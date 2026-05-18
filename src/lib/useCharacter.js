const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getLevelFromXP, EQUIPMENT, JOB_TREE, calculateSPBonusOnLevelUp } from "@/lib/gameData";

export async function logActivity({ action_type, source, amount, base_amount, modifiers, icon }) {
  try {
    await db.entities.ActivityLog.create({
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

export function useCharacter() {
  const queryClient = useQueryClient();

  const { data: characters = [], isLoading } = useQuery({
    queryKey: ["character"],
    queryFn: async () => {
      const user = await db.auth.me();
      return db.entities.Character.filter({ created_by: user.email });
    },
  });

  const character = characters[0] || null;
  const levelInfo = character ? getLevelFromXP(character.total_xp || 0) : { level: 1, currentXP: 0, neededXP: 100 };

  const enrichedCharacter = character ? {
    ...character,
    level: levelInfo.level,
    // Items are "unlocked" only if explicitly purchased (stored in unlocked_items)
    unlocked_items: character.unlocked_items || [],
    equipped_items: character.equipped_items || [],
    unlocked_skills: character.unlocked_skills || [],
    current_job: character.current_job || "seeker",
    faith: character.faith || 0,
    skill_points: character.skill_points || 0,
  } : null;

  // ── CREATE ────────────────────────────────────────────────────────────────
  const createCharacter = useMutation({
    mutationFn: (name) => db.entities.Character.create({
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
    }),
    onSuccess: (newChar) => {
      // Directly set cache so UI updates immediately without waiting for refetch
      queryClient.setQueryData(["character"], [newChar]);
      queryClient.invalidateQueries({ queryKey: ["character"] });
    },
  });

  // ── ADD XP ────────────────────────────────────────────────────────────────
  const addXP = useMutation({
    mutationFn: async (amount) => {
      const oldTotal = character.total_xp || 0;
      const oldLevel = getLevelFromXP(oldTotal).level;
      const newTotalXP = oldTotal + amount;
      const newInfo = getLevelFromXP(newTotalXP);
      const levelsGained = newInfo.level - oldLevel;
      
      // Calculate SP: base 1 per level + bonuses from equipped items
      const equippedItems = character.equipped_items || [];
      const { bonusSP, modifiers: spModifiers } = calculateSPBonusOnLevelUp(equippedItems);
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
      
      // Log each level gained with SP amount shown
      for (let i = 1; i <= levelsGained; i++) {
        const reachedLevel = oldLevel + i;
        const modifierText = spModifiers.length > 0 
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
        return [{ ...old[0], total_xp: newTotalXP, xp: newInfo.currentXP, level: newInfo.level, goals_completed: (old[0].goals_completed || 0) + 1, skill_points: (old[0].skill_points || 0) + totalSpGained }];
      });
      return { previous };
    },
    onError: (_err, _amt, ctx) => { if (ctx?.previous) queryClient.setQueryData(["character"], ctx.previous); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["character"] }),
  });

  // ── ADD FAITH ─────────────────────────────────────────────────────────────
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
        return [{ ...old[0], faith: (old[0].faith || 0) + amount, total_faith: (old[0].total_faith || 0) + amount }];
      });
      return { previous };
    },
    onError: (_err, _amt, ctx) => { if (ctx?.previous) queryClient.setQueryData(["character"], ctx.previous); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["character"] }),
  });

  // ── EQUIP TOGGLE (max 5) ──────────────────────────────────────────────────
  const toggleEquip = useMutation({
    mutationFn: async (itemId) => {
      const current = character.equipped_items || [];
      let newEquipped;
      if (current.includes(itemId)) {
        newEquipped = current.filter((id) => id !== itemId);
      } else {
        if (current.length >= MAX_EQUIPPED) return null; // cap at 5
        newEquipped = [...current, itemId];
      }
      return db.entities.Character.update(character.id, { equipped_items: newEquipped });
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
    onError: (_err, _id, ctx) => { if (ctx?.previous) queryClient.setQueryData(["character"], ctx.previous); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["character"] }),
  });

  // ── BUY EQUIPMENT ─────────────────────────────────────────────────────────
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
        await logActivity({ action_type: "xp_spent", source: `Shop: ${itemName || itemId}`, amount: -xpCost, base_amount: -xpCost, icon: "🛒" });
      }
      if (faithCost > 0) {
        await logActivity({ action_type: "faith_spent", source: `Shop: ${itemName || itemId}`, amount: -faithCost, base_amount: -faithCost, icon: "🛒" });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["character"] }),
  });

  // ── UNLOCK SKILL ─────────────────────────────────────────────────────────
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
        return [{ ...old[0], unlocked_skills: [...(old[0].unlocked_skills || []), skillId], skill_points: (old[0].skill_points || 0) - cost }];
      });
      return { previous };
    },
    onError: (_err, _s, ctx) => { if (ctx?.previous) queryClient.setQueryData(["character"], ctx.previous); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["character"] }),
  });

  // ── CHANGE JOB (clears all equipped items) ────────────────────────────────
  const changeJob = useMutation({
    mutationFn: async (jobId) => {
      return db.entities.Character.update(character.id, {
        current_job: jobId,
        equipped_items: [], // always clear equipped on class change
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["character"] }),
  });

  return {
    character: enrichedCharacter,
    levelInfo,
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