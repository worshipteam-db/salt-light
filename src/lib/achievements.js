import { EQUIPMENT, JOB_TREE, SKILLS } from "@/lib/gameData";
import { format, subDays, addDays } from "date-fns";

const RARITY_BY_TIER = {
  1: "Common",
  2: "Uncommon",
  3: "Rare",
  4: "Epic",
  5: "Legendary",
  6: "Mythic",
};

const buildThresholdAchievements = ({ category, tier, items, type, prefix }) => {
  return items.map(([target, name, icon, description]) => ({
    id: `${prefix}_${target}`,
    name,
    icon,
    category,
    tier,
    rarity: RARITY_BY_TIER[tier] || "Common",
    description,
    criteria: { type, target },
  }));
};

const levelAchievements = buildThresholdAchievements({
  category: "progress",
  tier: 1,
  type: "level",
  prefix: "level",
  items: [
    [2, "First Light", "🌱", "Reach level 2."],
    [5, "Steady Steps", "🚶", "Reach level 5."],
    [10, "Growing Strength", "💪", "Reach level 10."],
    [15, "Seasoned", "🏹", "Reach level 15."],
    [20, "Called Higher", "🛡️", "Reach level 20."],
    [30, "Established", "🏔️", "Reach level 30."],
    [40, "Veteran", "⭐", "Reach level 40."],
    [50, "Elite", "🔥", "Reach level 50."],
    [60, "Mastery", "🧠", "Reach level 60."],
    [75, "Legend", "👑", "Reach level 75."],
    [90, "Mythic", "🌌", "Reach level 90."],
    [100, "Divine", "✨", "Reach level 100."],
  ],
});

const goalAchievements = buildThresholdAchievements({
  category: "progress",
  tier: 1,
  type: "goals",
  prefix: "goals",
  items: [
    [1, "First Quest", "⚡", "Complete your first goal."],
    [5, "In Rhythm", "📋", "Complete 5 goals."],
    [10, "Disciplined", "🏁", "Complete 10 goals."],
    [25, "Momentum", "🌊", "Complete 25 goals."],
    [50, "Steady Victory", "🏆", "Complete 50 goals."],
    [100, "Hundredfold", "💯", "Complete 100 goals."],
    [200, "Halfway to Greatness", "🛤️", "Complete 200 goals."],
    [365, "Daily Faithfulness", "📅", "Complete 365 goals."],
    [500, "Habit Builder", "🧱", "Complete 500 goals."],
    [1000, "Unshakable", "🏔️", "Complete 1000 goals."],
  ],
});

const devotionAchievements = [
  ...buildThresholdAchievements({
    category: "faith",
    tier: 1,
    type: "devotions_total",
    prefix: "devotions_total",
    items: [
      [1, "First Prayer", "🙏", "Complete your first devotion."],
      [7, "One Week", "🕯️", "Complete 7 devotions."],
      [14, "Fortnight of Faith", "📖", "Complete 14 devotions."],
      [30, "Thirty Days", "🕊️", "Complete 30 devotions."],
      [50, "Faith Builder", "⛪", "Complete 50 devotions."],
      [100, "Steadfast", "✨", "Complete 100 devotions."],
    ],
  }),
  ...buildThresholdAchievements({
    category: "faith",
    tier: 2,
    type: "current_streak",
    prefix: "streak",
    items: [
      [3, "Three-Day Spark", "🌅", "Hold a 3-day devotion streak."],
      [7, "Seven-Day Flame", "🔥", "Hold a 7-day devotion streak."],
      [30, "Thirty-Day Fire", "🌞", "Hold a 30-day devotion streak."],
      [100, "Long Walk", "🛤️", "Hold a 100-day devotion streak."],
    ],
  }),
];

const faithAchievements = buildThresholdAchievements({
  category: "faith",
  tier: 2,
  type: "total_faith",
  prefix: "faith",
  items: [
    [50, "Small Flame", "🕯️", "Earn 50 total Faith."],
    [100, "Growing Fire", "🔥", "Earn 100 total Faith."],
    [250, "Faithful Heart", "💖", "Earn 250 total Faith."],
    [500, "Deep Roots", "🌳", "Earn 500 total Faith."],
    [1000, "Blessed Momentum", "✨", "Earn 1000 total Faith."],
    [2500, "Overflowing", "🌊", "Earn 2500 total Faith."],
    [5000, "Abundant", "🏺", "Earn 5000 total Faith."],
    [10000, "Faith Legend", "👑", "Earn 10000 total Faith."],
  ],
});

const equipmentAchievements = [
  ...buildThresholdAchievements({
    category: "equipment",
    tier: 1,
    type: "items_owned",
    prefix: "items_owned",
    items: [
      [1, "First Purchase", "🛒", "Own 1 equipment item."],
      [5, "Starter Kit", "🎒", "Own 5 equipment items."],
      [10, "Well Stocked", "🧰", "Own 10 equipment items."],
      [20, "Collector", "📦", "Own 20 equipment items."],
      [30, "Armory", "🏛️", "Own 30 equipment items."],
      [40, "Vault Full", "🏦", "Own 40 equipment items."],
    ],
  }),
  ...buildThresholdAchievements({
    category: "equipment",
    tier: 2,
    type: "items_equipped",
    prefix: "items_equipped",
    items: [
      [1, "Wear It Well", "⚔️", "Equip your first item."],
      [3, "Prepared", "🧤", "Equip 3 items at once."],
      [6, "Fully Geared", "🛡️", "Equip all 6 slots."],
    ],
  }),
  {
    id: "all_items_owned",
    name: "Complete Set",
    icon: "👑",
    category: "equipment",
    tier: 5,
    rarity: "Legendary",
    description: "Own every equipment item in the game.",
    criteria: { type: "all_items_owned" },
  },
];

const skillAchievements = buildThresholdAchievements({
  category: "skills",
  tier: 1,
  type: "skills_unlocked",
  prefix: "skills",
  items: [
    [1, "First Skill", "✨", "Unlock your first skill."],
    [3, "Skill Student", "📚", "Unlock 3 skills."],
    [5, "Skill Apprentice", "🧠", "Unlock 5 skills."],
    [10, "Skill Adept", "🪄", "Unlock 10 skills."],
    [20, "Skill Master", "🎓", "Unlock 20 skills."],
    [30, "Skill Architect", "🏗️", "Unlock 30 skills."],
    [40, "Skill Sage", "🔮", "Unlock 40 skills."],
  ],
});

skillAchievements.push({
  id: "all_skills_unlocked",
  name: "Skill Tree Complete",
  icon: "🌟",
  category: "skills",
  tier: 5,
  rarity: "Legendary",
  description: "Unlock every skill in the game.",
  criteria: { type: "all_skills_unlocked" },
});

const jobAchievements = [
  { id: "job_seeker", name: "Seeker", icon: "🌱", category: "vocation", tier: 1, rarity: "Common", description: "Reach the Seeker job.", criteria: { type: "job", jobId: "seeker" } },
  { id: "job_warrior", name: "Warrior", icon: "⚔️", category: "vocation", tier: 1, rarity: "Common", description: "Reach the Warrior job.", criteria: { type: "job", jobId: "warrior" } },
  { id: "job_scholar", name: "Scholar", icon: "📚", category: "vocation", tier: 1, rarity: "Common", description: "Reach the Scholar job.", criteria: { type: "job", jobId: "scholar" } },
  { id: "job_devotee", name: "Devotee", icon: "🕊️", category: "vocation", tier: 1, rarity: "Common", description: "Reach the Devotee job.", criteria: { type: "job", jobId: "devotee" } },
  { id: "job_knight", name: "Knight", icon: "🛡️", category: "vocation", tier: 2, rarity: "Uncommon", description: "Reach the Knight job.", criteria: { type: "job", jobId: "knight" } },
  { id: "job_legend", name: "Legend", icon: "🌟", category: "vocation", tier: 3, rarity: "Rare", description: "Reach the Legend job.", criteria: { type: "job", jobId: "legend" } },
  { id: "job_oracle", name: "Oracle", icon: "🌀", category: "vocation", tier: 3, rarity: "Rare", description: "Reach the Oracle job.", criteria: { type: "job", jobId: "oracle" } },
  { id: "job_prophet", name: "Prophet", icon: "☀️", category: "vocation", tier: 3, rarity: "Rare", description: "Reach the Prophet job.", criteria: { type: "job", jobId: "prophet" } },
  { id: "job_ascended", name: "Ascended", icon: "✨", category: "vocation", tier: 4, rarity: "Epic", description: "Reach the Ascended job.", criteria: { type: "job", jobId: "ascended" } },
  { id: "job_divine_sovereign", name: "Divine Sovereign", icon: "🏛️", category: "vocation", tier: 5, rarity: "Legendary", description: "Reach the Divine Sovereign job.", criteria: { type: "job", jobId: "divine_sovereign" } },
];

export const ACHIEVEMENTS = [
  ...levelAchievements,
  ...goalAchievements,
  ...devotionAchievements,
  ...faithAchievements,
  ...equipmentAchievements,
  ...skillAchievements,
  ...jobAchievements,
];

export const ACHIEVEMENT_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "progress", label: "Progress" },
  { id: "faith", label: "Faith" },
  { id: "equipment", label: "Equipment" },
  { id: "skills", label: "Skills" },
  { id: "vocation", label: "Vocation" },
];

export function computeCurrentStreak(devotions = []) {
  if (!devotions.length) return 0;

  const dates = [...new Set(devotions.map((d) => d.date))].sort().reverse();
  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let streak = 0;
  let cursor = dates[0] === today ? new Date() : subDays(new Date(), 1);

  for (const date of dates) {
    const expected = format(cursor, "yyyy-MM-dd");
    if (date === expected) {
      streak += 1;
      cursor = subDays(cursor, 1);
    } else {
      break;
    }
  }

  return streak;
}

export function computeMaxStreak(devotions = []) {
  if (!devotions.length) return 0;

  const dates = [...new Set(devotions.map((d) => d.date))].sort();
  const dateSet = new Set(dates);
  let best = 0;

  for (const date of dates) {
    const prev = format(subDays(new Date(date), 1), "yyyy-MM-dd");
    if (dateSet.has(prev)) continue;

    let streak = 1;
    let cursor = new Date(date);

    while (true) {
      cursor = addDays(cursor, 1);
      const next = format(cursor, "yyyy-MM-dd");
      if (!dateSet.has(next)) break;
      streak += 1;
    }

    best = Math.max(best, streak);
  }

  return best;
}

export function buildAchievementStats(character = null, goals = [], devotions = []) {
  const completedGoals = goals.filter((goal) => goal.status === "completed");
  const goalsByTimeframe = completedGoals.reduce(
    (acc, goal) => {
      const key = goal.timeframe || "unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {
      daily: 0,
      weekly: 0,
      long_term: 0,
      boss_fight: 0,
      unknown: 0,
    }
  );

  const unlockedItems = [...new Set(character?.unlocked_items || [])];
  const equippedItems = [...new Set(character?.equipped_items || [])];
  const unlockedSkills = [...new Set(character?.unlocked_skills || [])];
  const jobHistory = [...new Set([
    ...(character?.job_history || []),
    character?.current_job || "seeker",
  ].filter(Boolean))];

  const stats = {
    level: character?.level || 1,
    goals_completed: character?.goals_completed || 0,
    completed_goals: completedGoals.length,
    goals_daily: goalsByTimeframe.daily,
    goals_weekly: goalsByTimeframe.weekly,
    goals_long_term: goalsByTimeframe.long_term,
    goals_boss_fight: goalsByTimeframe.boss_fight,
    devotions_total: devotions.length,
    current_streak: computeCurrentStreak(devotions),
    max_streak: computeMaxStreak(devotions),
    faith_total: character?.total_faith || 0,
    faith_current: character?.faith || 0,
    items_owned: unlockedItems.length,
    items_equipped: equippedItems.length,
    skills_unlocked: unlockedSkills.length,
    jobs_unlocked: jobHistory.length,
    unlocked_items: unlockedItems,
    equipped_items: equippedItems,
    unlocked_skills: unlockedSkills,
    job_history: jobHistory,
    current_job: character?.current_job || "seeker",
    all_items_total: EQUIPMENT.length,
    all_skills_total: SKILLS.length,
    all_jobs_total: JOB_TREE.length,
  };

  return stats;
}

function getCriterionProgress(criterion, stats) {
  switch (criterion.type) {
    case "level":
      return { current: stats.level, target: criterion.target };
    case "goals":
      return { current: stats.goals_completed, target: criterion.target };
    case "devotions_total":
      return { current: stats.devotions_total, target: criterion.target };
    case "current_streak":
      return { current: stats.current_streak, target: criterion.target };
    case "max_streak":
      return { current: stats.max_streak, target: criterion.target };
    case "total_faith":
      return { current: stats.faith_total, target: criterion.target };
    case "faith_current":
      return { current: stats.faith_current, target: criterion.target };
    case "items_owned":
      return { current: stats.items_owned, target: criterion.target };
    case "items_equipped":
      return { current: stats.items_equipped, target: criterion.target };
    case "skills_unlocked":
      return { current: stats.skills_unlocked, target: criterion.target };
    case "all_items_owned":
      return { current: stats.items_owned, target: stats.all_items_total };
    case "all_skills_unlocked":
      return { current: stats.skills_unlocked, target: stats.all_skills_total };
    case "job": {
      const unlocked = stats.job_history.includes(criterion.jobId);
      return { current: unlocked ? 1 : 0, target: 1 };
    }
    default:
      return { current: 0, target: 1 };
  }
}

export function evaluateAchievement(achievement, stats) {
  const progress = getCriterionProgress(achievement.criteria, stats);
  const unlocked = progress.current >= progress.target;
  const percent = progress.target === 0 ? 100 : Math.min(100, Math.round((progress.current / progress.target) * 100));

  return {
    ...achievement,
    unlocked,
    current: progress.current,
    target: progress.target,
    percent,
  };
}

export function getAchievementState(character, goals = [], devotions = []) {
  const stats = buildAchievementStats(character, goals, devotions);
  const earnedSet = new Set(character?.earned_achievements || []);
  const evaluated = ACHIEVEMENTS.map((achievement) => evaluateAchievement(achievement, stats));
  const unlockedIds = evaluated.filter((a) => a.unlocked).map((a) => a.id);
  const newlyUnlocked = unlockedIds.filter((id) => !earnedSet.has(id));
  const earnedIds = [...new Set([...(character?.earned_achievements || []), ...unlockedIds])];

  return {
    stats,
    evaluated,
    unlockedIds,
    newlyUnlocked,
    earnedIds,
    unlockedCount: earnedIds.length,
    totalCount: ACHIEVEMENTS.length,
    completionPercent: ACHIEVEMENTS.length ? Math.round((earnedIds.length / ACHIEVEMENTS.length) * 100) : 0,
  };
}

export function formatAchievementProgress(achievement) {
  if (achievement.unlocked) return "Unlocked";
  return `${achievement.current}/${achievement.target}`;
}

export function getCategoryLabel(categoryId) {
  return ACHIEVEMENT_CATEGORIES.find((c) => c.id === categoryId)?.label || categoryId;
}