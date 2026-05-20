import db from "@/api/base44Client";
import { useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLevelFromXP, calculateSPBonusOnLevelUp } from "@/lib/gameData";
import { ACHIEVEMENTS, getAchievementState } from "@/lib/achievements";

export async function logActivity({
  action_type,
  source,
  amount,
  base_amount,
  modifiers,
  icon,
}) {
  try {
    const user = await db.auth.me();

    await db.entities.ActivityLog.create({
      user_id: user.id,
      created_by: user.email,
      title: source,
      activity_type: action_type,
      action_type,
      source,
      amount,
      base_amount: base_amount ?? amount,
      modifiers: modifiers || "",
      icon: icon || "⚡",
    });
  } catch (e) {
    console.warn("Failed to log activity", e);
  }
}

const MAX_EQUIPPED = 6;

function uniqArray(values = []) {
  return [...new Set((Array.isArray(values) ? values : []).filter(Boolean))];
}

function sameStringSet(a = [], b = []) {
  const aa = uniqArray(a);
  const bb = uniqArray(b);
  if (aa.length !== bb.length) return false;
  return aa.every((value) => bb.includes(value));
}

export function useCharacter() {
  const queryClient = useQueryClient();
  const achievementSyncLock = useRef(false);

  const { data: characters = [], isLoading } = useQuery({
    queryKey: ["character"],
    queryFn: async () => {
      try {
        const user = await db.auth.me();
        return db.entities.Character.filter({ user_id: user.id });
      } catch (error) {
        console.warn("Failed to load character", error);
        return [];
      }
    },
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      try {
        const user = await db.auth.me();
        return db.entities.Goal.filter({ created_by: user.email });
      } catch (error) {
        console.warn("Failed to load goals", error);
        return [];
      }
    },
  });

  const { data: devotions = [] } = useQuery({
    queryKey: ["devotions"],
    queryFn: async () => {
      try {
        const user = await db.auth.me();
        return db.entities.Devotion.filter({ user_id: user.id });
      } catch (error) {
        console.warn("Failed to load devotions", error);
        return [];
      }
    },
  });

  const character = characters[0] || null;

  const levelInfo = character
    ? getLevelFromXP(character.total_xp || 0)
    : { level: 1, currentXP: 0, neededXP: 100 };

  const enrichedCharacter = character
    ? {
        ...character,
        level: levelInfo.level,
        unlocked_items: uniqArray(character.unlocked_items),
        equipped_items: uniqArray(character.equipped_items),
        unlocked_skills: uniqArray(character.unlocked_skills),
        earned_achievements: uniqArray(character.earned_achievements),
        job_history: uniqArray(character.job_history),
        current_job: character.current_job || "seeker",
        faith: character.faith || 0,
        skill_points: character.skill_points || 0,
      }
    : null;

  const achievementState = useMemo(() => {
    return getAchievementState(enrichedCharacter, goals, devotions);
  }, [enrichedCharacter, goals, devotions]);

  useEffect(() => {
    if (!character || isLoading) return;
    if (achievementSyncLock.current) return;

    const currentEarned = uniqArray(character.earned_achievements);
    const nextEarned = uniqArray(achievementState.earnedIds);

    const currentHistory = uniqArray(character.job_history);
    const nextHistory = uniqArray(character.job_history);

    const achievementsChanged = !sameStringSet(currentEarned, nextEarned);
    const historyChanged = !sameStringSet(currentHistory, nextHistory);

    if (!achievementsChanged && !historyChanged) return;

    achievementSyncLock.current = true;

    const syncAchievements = async () => {
      try {
        const payload = {};

        if (achievementsChanged) {
          payload.earned_achievements = nextEarned;
        }

        if (Object.keys(payload).length > 0) {
          await db.entities.Character.update(character.id, payload);

          queryClient.setQueryData(["character"], (old = []) => {
            if (!old[0]) return old;
            return [
              {
                ...old[0],
                ...payload,
              },
            ];
          });

          await queryClient.invalidateQueries({ queryKey: ["character"] });
        }

        if (achievementState.newlyUnlocked.length > 0) {
          for (const achievementId of achievementState.newlyUnlocked) {
            const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
            if (!achievement) continue;

            await logActivity({
              action_type: "achievement_unlocked",
              source: `Achievement Unlocked: ${achievement.name}`,
              amount: 1,
              base_amount: 1,
              modifiers: `${achievement.category} • ${achievement.rarity}`,
              icon: achievement.icon || "🏅",
            });
          }
        }

        window.dispatchEvent(new Event("achievements-updated"));
      } catch (error) {
        console.warn("Achievement sync failed", error);
      } finally {
        achievementSyncLock.current = false;
      }
    };

    syncAchievements();
  }, [achievementState, character, isLoading, queryClient]);

  const createCharacter = useMutation({
    mutationFn: async (name) => {
      const user = await db.auth.me();

      return db.entities.Character.create({
        user_id: user.id,
        created_by: user.email,
        name,
        level: 1,
        xp: 0,
        total_xp: 0,
        faith: 0,
        total_faith: 0,
        skill_points: 1,
        total_skill_points: 1,
        current_job: "seeker",
        goals_completed: 0,
        equipped_items: ["wooden_sword"],
        unlocked_items: ["wooden_sword"],
        unlocked_skills: [],
      });
    },
    onSuccess: (newChar) => {
      queryClient.setQueryData(["character"], [newChar]);
      queryClient.invalidateQueries({ queryKey: ["character"] });
    },
  });

  const addXP = useMutation({
    mutationFn: async (amount) => {
      const oldTotal = character.total_xp || 0;
      const oldLevel = getLevelFromXP(oldTotal).level;
      const newTotalXP = oldTotal + amount;
      const newInfo = getLevelFromXP(newTotalXP);
      const levelsGained = newInfo.level - oldLevel;

      const equippedItems = character.equipped_items || [];
      const { bonusSP, modifiers: spModifiers } =
        calculateSPBonusOnLevelUp(equippedItems);
      const spPerLevel = 1 + bonusSP;
      const totalSpGained = levelsGained * spPerLevel;

      const result = await db.entities.Character.update(character.id, {
        total_xp: newTotalXP,
        xp: newInfo.currentXP,
        level: newInfo.level,
        goals_completed: (character.goals_completed || 0) + 1,
        skill_points: (character.skill_points || 0) + totalSpGained,
        total_skill_points: (character.total_skill_points || 0) + totalSpGained,
      });

      for (let i = 1; i <= levelsGained; i++) {
        const reachedLevel = oldLevel + i;
        const modifierText =
          spModifiers.length > 0
            ? `Base: +1 SP, ${spModifiers.join(", ")}`
            : "";

        await logActivity({
          action_type: "xp_gained",
          source: `Level Up! Reached Level ${reachedLevel}`,
          amount: spPerLevel,
          base_amount: 1,
          modifiers: modifierText,
          icon: "🎉",
        });
      }

      return result;
    },
    onMutate: async (amount) => {
      await queryClient.cancelQueries({ queryKey: ["character"] });
      const previous = queryClient.getQueryData(["character"]);

      queryClient.setQueryData(["character"], (old = []) => {
        if (!old[0]) return old;

        const oldTotal = old[0].total_xp || 0;
        const oldLevel = getLevelFromXP(oldTotal).level;
        const newTotalXP = oldTotal + amount;
        const newInfo = getLevelFromXP(newTotalXP);
        const levelsGained = newInfo.level - oldLevel;
        const equippedItems = old[0].equipped_items || [];
        const { bonusSP } = calculateSPBonusOnLevelUp(equippedItems);
        const totalSpGained = levelsGained * (1 + bonusSP);

        return [
          {
            ...old[0],
            total_xp: newTotalXP,
            xp: newInfo.currentXP,
            level: newInfo.level,
            goals_completed: (old[0].goals_completed || 0) + 1,
            skill_points: (old[0].skill_points || 0) + totalSpGained,
          },
        ];
      });

      return { previous };
    },
    onError: (_err, _amt, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["character"], ctx.previous);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["character"] }),
  });

  const addFaith = useMutation({
    mutationFn: async (amount) => {
      return db.entities.Character.update(character.id, {
        faith: (character.faith || 0) + amount,
        total_faith: (character.total_faith || 0) + amount,
      });
    },
    onMutate: async (amount) => {
      await queryClient.cancelQueries({ queryKey: ["character"] });
      const previous = queryClient.getQueryData(["character"]);

      queryClient.setQueryData(["character"], (old = []) => {
        if (!old[0]) return old;
        return [
          {
            ...old[0],
            faith: (old[0].faith || 0) + amount,
            total_faith: (old[0].total_faith || 0) + amount,
          },
        ];
      });

      return { previous };
    },
    onError: (_err, _amt, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["character"], ctx.previous);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["character"] }),
  });

  const toggleEquip = useMutation({
    mutationFn: async (itemId) => {
      const current = character.equipped_items || [];
      let newEquipped;

      if (current.includes(itemId)) {
        newEquipped = current.filter((id) => id !== itemId);
      } else {
        if (current.length >= MAX_EQUIPPED) return null;
        newEquipped = [...current, itemId];
      }

      return db.entities.Character.update(character.id, {
        equipped_items: newEquipped,
      });
    },
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ["character"] });
      const previous = queryClient.getQueryData(["character"]);

      queryClient.setQueryData(["character"], (old = []) => {
        if (!old[0]) return old;

        const current = old[0].equipped_items || [];
        let newEquipped;

        if (current.includes(itemId)) {
          newEquipped = current.filter((id) => id !== itemId);
        } else {
          if (current.length >= MAX_EQUIPPED) return old;
          newEquipped = [...current, itemId];
        }

        return [{ ...old[0], equipped_items: newEquipped }];
      });

      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["character"], ctx.previous);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["character"] }),
  });

  const buyEquipment = useMutation({
    mutationFn: async ({ itemId, xpCost, faithCost, itemName }) => {
      const newUnlocked = [...(character.unlocked_items || []), itemId];
      const oldTotal = character.total_xp || 0;
      const newTotalXP = Math.max(0, oldTotal - xpCost);
      const newInfo = getLevelFromXP(newTotalXP);

      await db.entities.Character.update(character.id, {
        unlocked_items: newUnlocked,
        total_xp: newTotalXP,
        xp: newInfo.currentXP,
        level: newInfo.level,
        faith: (character.faith || 0) - faithCost,
      });

      if (xpCost > 0) {
        await logActivity({
          action_type: "xp_spent",
          source: `Shop: ${itemName || itemId}`,
          amount: -xpCost,
          base_amount: -xpCost,
          icon: "🛒",
        });
      }

      if (faithCost > 0) {
        await logActivity({
          action_type: "faith_spent",
          source: `Shop: ${itemName || itemId}`,
          amount: -faithCost,
          base_amount: -faithCost,
          icon: "🛒",
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["character"] }),
  });

  const unlockSkill = useMutation({
    mutationFn: async ({ skillId, cost }) => {
      const newSkills = [...(character.unlocked_skills || []), skillId];
      return db.entities.Character.update(character.id, {
        unlocked_skills: newSkills,
        skill_points: (character.skill_points || 0) - cost,
      });
    },
    onMutate: async ({ skillId, cost }) => {
      await queryClient.cancelQueries({ queryKey: ["character"] });
      const previous = queryClient.getQueryData(["character"]);

      queryClient.setQueryData(["character"], (old = []) => {
        if (!old[0]) return old;
        return [
          {
            ...old[0],
            unlocked_skills: [...(old[0].unlocked_skills || []), skillId],
            skill_points: (old[0].skill_points || 0) - cost,
          },
        ];
      });

      return { previous };
    },
    onError: (_err, _s, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["character"], ctx.previous);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["character"] }),
  });

  const changeJob = useMutation({
    mutationFn: async (jobId) => {
      const currentHistory = uniqArray(character.job_history);
      const nextHistory = uniqArray([
        ...currentHistory,
        character.current_job || "seeker",
        jobId,
      ]);

      const updated = await db.entities.Character.update(character.id, {
        current_job: jobId,
        equipped_items: [],
      });

      try {
        await db.entities.Character.update(character.id, {
          job_history: nextHistory,
        });
      } catch (historyError) {
        console.warn("Job history update skipped:", historyError);
      }

      await logActivity({
        action_type: "job_changed",
        source: `Job Changed: ${jobId}`,
        amount: 0,
        base_amount: 0,
        modifiers: `Switched to ${jobId}`,
        icon: "🗺️",
      });

      return updated;
    },
    onMutate: async (jobId) => {
      await queryClient.cancelQueries({ queryKey: ["character"] });
      const previous = queryClient.getQueryData(["character"]);

      queryClient.setQueryData(["character"], (old = []) => {
        if (!old[0]) return old;
        return [
          {
            ...old[0],
            current_job: jobId,
            equipped_items: [],
          },
        ];
      });

      return { previous };
    },
    onError: (_err, _jobId, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["character"], ctx.previous);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["character"] }),
  });

  return {
    character: enrichedCharacter,
    levelInfo,
    achievementState,
    achievementUnlockedIds: achievementState.unlockedIds,
    achievementCompletionPercent: achievementState.completionPercent,
    achievementUnlockedCount: achievementState.unlockedCount,
    achievementTotalCount: achievementState.totalCount,
    isLoading,
    createCharacter: createCharacter.mutate,
    addXP: addXP.mutate,
    addFaith: addFaith.mutate,
    toggleEquip: toggleEquip.mutate,
    buyEquipment: buyEquipment.mutate,
    unlockSkill: unlockSkill.mutate,
    changeJob: changeJob.mutate,
    MAX_EQUIPPED,
  };
}