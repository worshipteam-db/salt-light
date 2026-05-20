// ─── XP SCALING ─────────────────────────────────────────────────────────────
// Base 100 at level 1, +5 per level, with an extra +50 every 5 levels
export function xpForLevel(level) {
  const base = 100 + (level - 1) * 5;
  const bonus = Math.floor((level - 1) / 5) * 50;
  return base + bonus;
}

export function getLevelFromXP(totalXP) {
  let level = 1;
  let remaining = totalXP;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  return { level, currentXP: remaining, neededXP: xpForLevel(level) };
}

// ─── GOAL REWARDS ────────────────────────────────────────────────────────────
export const XP_REWARDS = {
  daily: 15,
  weekly: 40,
  long_term: 100,
  boss_fight: 250,
};

export const FAITH_REWARDS = {
  devotion_base: 10,
  devotion_streak_bonus: 2, // per streak day after 1
};

// ─── EQUIPMENT ───────────────────────────────────────────────────────────────
// costType: "xp" | "faith" | "both"
// passive: description shown when equipped
// requiredJob: null = any class, string[] = restricted to those job ids
export const EQUIPMENT = [
  // ── Tier 1 (Lv 1–10) ──
  { id: "wooden_sword",      name: "Wooden Sword",       type: "weapon",    icon: "⚔️",  requiredLevel: 1,  xpCost: 0,    faithCost: 0,   costType: "xp",    requiredJob: null,                          description: "A humble beginning",           passive: null },
  { id: "leather_cap",       name: "Leather Cap",        type: "helmet",    icon: "🧢",  requiredLevel: 2,  xpCost: 0,    faithCost: 0,   costType: "xp",    requiredJob: null,                          description: "Light head protection",        passive: null },
  { id: "cloth_cape",        name: "Cloth Cape",         type: "cape",      icon: "🧣",  requiredLevel: 3,  xpCost: 50,   faithCost: 0,   costType: "xp",    requiredJob: null,                          description: "A flowing cape",               passive: "+2 XP on daily goals" },
  { id: "iron_shield",       name: "Iron Shield",        type: "shield",    icon: "🛡️",  requiredLevel: 4,  xpCost: 80,   faithCost: 0,   costType: "xp",    requiredJob: null,                          description: "Sturdy defense",               passive: "Prevents streak break penalty" },
  { id: "seeker_staff",      name: "Seeker's Staff",     type: "weapon",    icon: "🪄",  requiredLevel: 3,  xpCost: 60,   faithCost: 0,   costType: "xp",    requiredJob: ["seeker"],                    description: "For those seeking purpose",    passive: "+3 XP on all goals" },
  { id: "novice_tome",       name: "Novice Tome",        type: "offhand",   icon: "📓",  requiredLevel: 5,  xpCost: 0,    faithCost: 10,  costType: "faith", requiredJob: ["scholar","scribe","sage"],    description: "Scholar exclusive",            passive: "+5 XP on elite quests" },
  { id: "devotee_rosary",    name: "Devotional Journal",  type: "accessory", icon: "📔",  requiredLevel: 4,  xpCost: 0,    faithCost: 15,  costType: "faith", requiredJob: ["devotee","priest","paladin","prophet"], description: "Devotee exclusive",    passive: "+4 Faith per devotion" },
  { id: "warrior_gauntlets", name: "Warrior Gauntlets",  type: "gloves",    icon: "🥊",  requiredLevel: 5,  xpCost: 90,   faithCost: 0,   costType: "xp",    requiredJob: ["warrior","knight","berserker","legend"], description: "Warrior exclusive", passive: "+8 XP on weekly goals" },
  { id: "iron_boots",        name: "Iron Boots",         type: "boots",     icon: "👢",  requiredLevel: 6,  xpCost: 100,  faithCost: 0,   costType: "xp",    requiredJob: null,                          description: "Grounded and steady",          passive: "+1 skill point at level-up" },
  { id: "prayer_beads",      name: "Prayer Beads",       type: "accessory", icon: "🔮",  requiredLevel: 7,  xpCost: 0,    faithCost: 20,  costType: "faith", requiredJob: null,                          description: "Faith amplifier",              passive: "+3 Faith per devotion" },

  // ── Tier 2 (Lv 11–20) ──
  { id: "steel_blade",       name: "Steel Blade",        type: "weapon",    icon: "🗡️",  requiredLevel: 11, xpCost: 150,  faithCost: 0,   costType: "xp",    requiredJob: null,                          description: "Sharper than words",           passive: "+5 XP on weekly goals" },
  { id: "knight_helm",       name: "Knight Helm",        type: "helmet",    icon: "⛑️",  requiredLevel: 12, xpCost: 200,  faithCost: 0,   costType: "xp",    requiredJob: ["warrior","knight","berserker","paladin","legend"], description: "Warrior class only", passive: "+10 XP on weekly goals" },
  { id: "magic_ring",        name: "Ring of Focus",      type: "accessory", icon: "💍",  requiredLevel: 13, xpCost: 100,  faithCost: 15,  costType: "both",  requiredJob: null,                          description: "Sharpens the mind",            passive: "+5% XP from all goals" },
  { id: "holy_tome",         name: "Holy Bible",         type: "offhand",    icon: "📖",  requiredLevel: 14, xpCost: 0,    faithCost: 40,  costType: "faith", requiredJob: ["devotee","priest","paladin","prophet","scribe"], description: "For spiritual classes", passive: "+5 Faith on devotion completion" },
  { id: "silver_boots",      name: "Silver Boots",       type: "boots",     icon: "🥿",  requiredLevel: 15, xpCost: 200,  faithCost: 0,   costType: "xp",    requiredJob: null,                          description: "Swift as the wind",            passive: "+1 skill point at level-up" },
  { id: "sage_crystal",      name: "Sage Crystal",       type: "accessory", icon: "💎",  requiredLevel: 16, xpCost: 250,  faithCost: 0,   costType: "xp",    requiredJob: ["scholar","sage","oracle","scribe"], description: "Scholar path only",     passive: "+1 skill point per 5 goals" },
  { id: "pilgrim_robe",      name: "Pilgrim's Cloak",    type: "armor",     icon: "🧥",  requiredLevel: 17, xpCost: 0,    faithCost: 60,  costType: "faith", requiredJob: ["devotee","priest","paladin","prophet"], description: "Devotee classes only",  passive: "+8 Faith per devotion" },
  { id: "berserker_axe",     name: "Berserker Axe",      type: "weapon",    icon: "🪓",  requiredLevel: 18, xpCost: 350,  faithCost: 0,   costType: "xp",    requiredJob: ["berserker"],                 description: "Berserker exclusive",          passive: "+20 XP on boss fights" },
  { id: "truth_lantern",     name: "Lantern of Truth",   type: "offhand",   icon: "🏮",  requiredLevel: 19, xpCost: 200,  faithCost: 40,  costType: "both",  requiredJob: null,                          description: "Lights the dark path",         passive: "+5 XP on all goal types" },
  { id: "dragon_sword",      name: "Dragon Blade",       type: "weapon",    icon: "🐉",  requiredLevel: 20, xpCost: 400,  faithCost: 0,   costType: "xp",    requiredJob: ["warrior","knight","berserker","paladin","legend"], description: "Warrior path only",  passive: "+20 XP on boss fights" },

  // ── Tier 3 (Lv 21–30) ──
  { id: "enchanted_armor",   name: "Enchanted Armor",    type: "armor",     icon: "🦺",  requiredLevel: 21, xpCost: 300,  faithCost: 30,  costType: "both",  requiredJob: null,                          description: "Glows with power",             passive: "+15 XP on boss fights" },
  { id: "mana_crystal",      name: "Mana Crystal",       type: "accessory", icon: "🔮",  requiredLevel: 22, xpCost: 250,  faithCost: 0,   costType: "xp",    requiredJob: ["sage","oracle","scribe"],     description: "Sage class only",              passive: "+1 skill point per 5 goals" },
  { id: "crown_seeker",      name: "Seeker Crown",       type: "helmet",    icon: "👑",  requiredLevel: 25, xpCost: 500,  faithCost: 50,  costType: "both",  requiredJob: null,                          description: "For the worthy",               passive: "+2 skill points at level-up" },
  { id: "angelic_wings",     name: "Angelic Wings",      type: "cape",      icon: "🪽",  requiredLevel: 27, xpCost: 0,    faithCost: 100, costType: "faith", requiredJob: ["priest","prophet","devotee"], description: "Devotee faith path only",      passive: "+12 Faith per devotion" },
  { id: "rune_gauntlets",    name: "Rune Gauntlets",     type: "gloves",    icon: "🧤",  requiredLevel: 28, xpCost: 450,  faithCost: 0,   costType: "xp",    requiredJob: null,                          description: "Ancient runes carved in",      passive: "+10% XP from weekly & elite quests" },
  { id: "sanctuary_amulet",  name: "Covenant Emblem",    type: "accessory", icon: "✝️",  requiredLevel: 30, xpCost: 300,  faithCost: 80,  costType: "both",  requiredJob: null,                          description: "Blessed protection",           passive: "+5 Faith on any goal complete" },

  // ── Tier 4 (Lv 31–50) ──
  { id: "phoenix_cape",      name: "Phoenix Cape",       type: "cape",      icon: "🔥",  requiredLevel: 35, xpCost: 600,  faithCost: 0,   costType: "xp",    requiredJob: null,                          description: "Rise from ashes",              passive: "Restore 10 XP on failed streak" },
  { id: "knight_shield",     name: "Knight's Shield",    type: "shield",    icon: "🔰",  requiredLevel: 38, xpCost: 550,  faithCost: 50,  costType: "both",  requiredJob: ["knight","legend"],            description: "Knight exclusive",             passive: "+20 XP on weekly, streak protection" },
  { id: "oracle_lens",       name: "Oracle's Lens",      type: "accessory", icon: "🌀",  requiredLevel: 40, xpCost: 700,  faithCost: 0,   costType: "xp",    requiredJob: ["oracle","sage"],              description: "Oracle/Sage only",             passive: "+25 XP on elite quests" },
  { id: "prophet_mantle",    name: "Prophet's Mantle",   type: "cape",      icon: "☀️",  requiredLevel: 42, xpCost: 0,    faithCost: 180, costType: "faith", requiredJob: ["prophet","priest"],           description: "Prophet class only",           passive: "+15 Faith per devotion" },
  { id: "celestial_blade",   name: "Celestial Blade",    type: "weapon",    icon: "⚡",  requiredLevel: 45, xpCost: 800,  faithCost: 80,  costType: "both",  requiredJob: null,                          description: "Forged in starlight",          passive: "+15% XP from all goals" },
  { id: "legendary_boots",   name: "Legendary Boots",    type: "boots",     icon: "🌟",  requiredLevel: 50, xpCost: 1000, faithCost: 100, costType: "both",  requiredJob: ["legend","oracle","prophet"],  description: "Legend-tier exclusive",        passive: "+3 skill points at level-up" },

  // ── Tier 5 (Lv 51–70) ──
  { id: "seraph_blade",      name: "Seraph Blade",       type: "weapon",    icon: "✨",  requiredLevel: 55, xpCost: 800,  faithCost: 150, costType: "both",  requiredJob: null,                          description: "Touched by the divine",        passive: "+25 XP & +10 Faith on boss" },
  { id: "infinity_gem",      name: "Infinity Gem",       type: "accessory", icon: "💎",  requiredLevel: 60, xpCost: 1000, faithCost: 0,   costType: "xp",    requiredJob: null,                          description: "Limitless potential",          passive: "+15% XP from all goals" },
  { id: "sacred_scripture",  name: "Sacred Scripture",   type: "offhand",   icon: "📜",  requiredLevel: 65, xpCost: 0,    faithCost: 200, costType: "faith", requiredJob: null,                          description: "The Word, made manifest",      passive: "+20 Faith per devotion, +1 SP/week" },
  { id: "warlord_armor",     name: "Warlord Armor",      type: "armor",     icon: "🛡️",  requiredLevel: 70, xpCost: 1200, faithCost: 0,   costType: "xp",    requiredJob: ["warrior","knight","berserker","paladin","legend"], description: "Warrior endgame",   passive: "+20% XP on all combat goals" },

  // ── Tier 6 (Lv 71–100) ──
  { id: "divine_crown",      name: "Divine Crown",       type: "helmet",    icon: "👸",  requiredLevel: 75, xpCost: 1500, faithCost: 200, costType: "both",  requiredJob: null,                          description: "Worn only by legends",         passive: "+4 skill points at level-up" },
  { id: "archangel_wings",   name: "Archangel Wings",    type: "cape",      icon: "🕊️",  requiredLevel: 80, xpCost: 0,    faithCost: 400, costType: "faith", requiredJob: ["prophet","priest"],           description: "Prophet apex",                 passive: "+30 Faith per devotion" },
  { id: "timeless_relic",    name: "Timeless Relic",     type: "accessory", icon: "⏳",  requiredLevel: 85, xpCost: 2000, faithCost: 300, costType: "both",  requiredJob: null,                          description: "Carries the weight of time",   passive: "+20% XP all goals, +15 Faith/devotion" },
  { id: "genesis_blade",     name: "Genesis Blade",      type: "weapon",    icon: "🌌",  requiredLevel: 90, xpCost: 2500, faithCost: 250, costType: "both",  requiredJob: null,                          description: "In the beginning was the Word",passive: "+30% XP all goals" },
  { id: "eternity_ring",     name: "Ring of Eternity",   type: "accessory", icon: "🌠",  requiredLevel: 95, xpCost: 3000, faithCost: 500, costType: "both",  requiredJob: null,                          description: "For those who reach the end",  passive: "+5 SP per level-up, +25% all XP" },
  { id: "omega_robe",        name: "Omega Robe",         type: "armor",     icon: "🌈",  requiredLevel: 100, xpCost: 5000, faithCost: 1000, costType: "both", requiredJob: null,                          description: "The ultimate form",            passive: "ALL bonuses doubled" },

  // ── Tier 4+ High-Tier Job Exclusives (Lv 30+) ──
  { id: "shadow_cloak",      name: "Shadow Cloak",       type: "cape",      icon: "🖤",  requiredLevel: 35, xpCost: 700,  faithCost: 0,   costType: "xp",    requiredJob: ["dark_knight","shadow_lord"],  description: "Dark Knight path",             passive: "+30 XP on boss fights" },
  { id: "void_crown",        name: "Void Crown",         type: "helmet",    icon: "⚫",  requiredLevel: 52, xpCost: 1100, faithCost: 100, costType: "both",  requiredJob: ["void_master"],                description: "Void Master exclusive",        passive: "+40 XP on boss fights, +20% XP" },
  { id: "blood_chalice",     name: "Blood Chalice",      type: "offhand",    icon: "🍷",  requiredLevel: 36, xpCost: 600,  faithCost: 50,  costType: "both",  requiredJob: ["blood_mage","blood_lord"],    description: "Blood path exclusive",         passive: "+45 XP on boss fights" },
  { id: "crimson_crown",     name: "Crimson Crown",      type: "helmet",    icon: "👑",  requiredLevel: 53, xpCost: 1200, faithCost: 80,  costType: "both",  requiredJob: ["crimson_king"],               description: "Crimson King exclusive",       passive: "+60 XP on boss, +25% XP all" },
  { id: "cosmic_orb",        name: "Cosmic Orb",         type: "accessory", icon: "🪐",  requiredLevel: 38, xpCost: 800,  faithCost: 0,   costType: "xp",    requiredJob: ["arch_sage","mystic"],         description: "Sage path exclusive",          passive: "+40 XP on elite quests" },
  { id: "infinite_scroll",   name: "Infinite Scroll",    type: "offhand",    icon: "∞",  requiredLevel: 54, xpCost: 1300, faithCost: 150, costType: "both",  requiredJob: ["cosmic_sage"],                description: "Cosmic Sage exclusive",        passive: "+45 XP elite quests, +30% XP" },
  { id: "divine_circlet",    name: "Divine Circlet",     type: "helmet",    icon: "☀️",  requiredLevel: 37, xpCost: 650,  faithCost: 100, costType: "both",  requiredJob: ["sanctifier","ascended"],      description: "Priest path exclusive",        passive: "+35 Faith/devotion, +15 XP" },
  { id: "sovereign_scepter", name: "Sovereign Scepter",  type: "weapon",    icon: "👑",  requiredLevel: 55, xpCost: 1400, faithCost: 200, costType: "both",  requiredJob: ["divine_sovereign"],           description: "Divine path apex",             passive: "+50 Faith/devotion, +25% XP" },
];

// ─── JOB TREE ────────────────────────────────────────────────────────────────
export const JOB_TREE = [
  { id: "seeker",    name: "Seeker",    icon: "🌱", requiredJob: null,      requiredLevel: 1,  description: "The beginning of every journey.", bonuses: ["+2 XP on daily goals"], tier: 0 },
  { id: "warrior",   name: "Warrior",   icon: "⚔️", requiredJob: "seeker",  requiredLevel: 5,  description: "Faces challenges head-on.", bonuses: ["+5 XP on weekly goals", "+3 XP on daily goals"], tier: 1 },
  { id: "scholar",   name: "Scholar",   icon: "📚", requiredJob: "seeker",  requiredLevel: 5,  description: "Grows through knowledge.", bonuses: ["+10 XP on long-term goals", "+1 Skill Point per 3 levels"], tier: 1 },
  { id: "devotee",   name: "Devotee",   icon: "🕊️", requiredJob: "seeker",  requiredLevel: 5,  description: "Rooted in faith.", bonuses: ["+5 Faith per devotion", "+2 XP per streak day"], tier: 1 },
  { id: "knight",    name: "Knight",    icon: "🛡️", requiredJob: "warrior", requiredLevel: 10, description: "A guardian of habit.", bonuses: ["+10 XP on weekly goals", "+15 XP on boss fights", "Streak protection"], tier: 2 },
  { id: "berserker", name: "Berserker", icon: "🪓", requiredJob: "warrior", requiredLevel: 10, description: "Raw power from completing hard goals.", bonuses: ["+30 XP on boss fights", "+5 XP daily"], tier: 2 },
  { id: "sage",      name: "Sage",      icon: "🔮", requiredJob: "scholar", requiredLevel: 10, description: "Distills wisdom into mastery.", bonuses: ["+15 XP on long-term goals", "Skills cost −1 SP"], tier: 2 },
  { id: "scribe",    name: "Scribe",    icon: "🖊️", requiredJob: "scholar", requiredLevel: 10, description: "Documents the journey.", bonuses: ["+5 XP per devotion", "+8 XP on long-term goals"], tier: 2 },
  { id: "priest",    name: "Pastor",    icon: "⛪", requiredJob: "devotee", requiredLevel: 10, description: "Guides growth through prayer and care.", bonuses: ["+10 Faith per devotion", "+5 XP on devotion"], tier: 2 },
  { id: "paladin",   name: "Paladin",   icon: "⚜️", requiredJob: "devotee", requiredLevel: 10, description: "Holy warrior. Faith and combat united.", bonuses: ["+8 Faith per devotion", "+10 XP on weekly & boss"], tier: 2 },
  { id: "legend",    name: "Legend",    icon: "🌟", requiredJob: "knight",  requiredLevel: 20, description: "A champion reborn.", bonuses: ["+15% XP all goals", "+15 Faith/devotion", "+3 SP per level"], tier: 3 },
  { id: "oracle",    name: "Oracle",    icon: "🌀", requiredJob: "sage",    requiredLevel: 20, description: "Sees the path ahead.", bonuses: ["+20 XP on long-term", "+20% XP from all goals", "+4 SP per level"], tier: 3 },
  { id: "prophet",   name: "Prophet",   icon: "☀️", requiredJob: "priest",  requiredLevel: 20, description: "Anointed. Faith moves mountains.", bonuses: ["+20 Faith/devotion", "+10% XP from all goals", "+2 SP per level"], tier: 3 },
  // Tier 4 (Lv 25–35)
  { id: "dark_knight", name: "Watchman",        icon: "🌙", requiredJob: "knight", requiredLevel: 25, description: "Keeps watch through the night.", bonuses: ["+25 XP on weekly & boss", "+20% XP all goals", "+2 SP per level"], tier: 4 },
  { id: "blood_mage",  name: "Martyr",          icon: "🔥", requiredJob: "berserker", requiredLevel: 25, description: "Power through sacrifice and endurance.", bonuses: ["+40 XP on boss fights", "+10% XP all goals", "+1 SP per level"], tier: 4 },
  { id: "arch_sage",   name: "Arch Sage",       icon: "🔮", requiredJob: "oracle", requiredLevel: 25, description: "Master of infinite knowledge.", bonuses: ["+30 XP on long-term", "+25% XP all goals", "+5 SP per level"], tier: 4 },
  { id: "sanctifier",  name: "Sanctifier",      icon: "⛪", requiredJob: "prophet", requiredLevel: 25, description: "Conduit of divine grace.", bonuses: ["+30 Faith/devotion", "+15% XP all goals", "+3 SP per level"], tier: 4 },
  // Tier 5 (Lv 35–70)
  { id: "shadow_lord",  name: "Night Sentinel",  icon: "🛡️", requiredJob: "knight", requiredLevel: 35, description: "Guardian of the watch in dark times.", bonuses: ["+35 XP on boss fights", "+30% XP all goals", "+4 SP per level"], tier: 5 },
  { id: "blood_lord",   name: "Covenant King",   icon: "👑", requiredJob: "blood_mage", requiredLevel: 35, description: "Ruler grounded in covenant and sacrifice.", bonuses: ["+50 XP on boss fights", "+20% XP all goals", "+2 SP per level"], tier: 5 },
  { id: "mystic",       name: "Mystic",          icon: "🌌", requiredJob: "arch_sage", requiredLevel: 35, description: "Touched by the cosmic truth.", bonuses: ["+40 XP on long-term", "+30% XP all goals", "+6 SP per level"], tier: 5 },
  { id: "ascended",     name: "Ascended",        icon: "✨", requiredJob: "sanctifier", requiredLevel: 35, description: "Transcendent being of pure faith.", bonuses: ["+40 Faith/devotion", "+25% XP all goals", "+4 SP per level"], tier: 5 },
  // Tier 6 (Lv 50–70) — Apex classes
  { id: "void_master",  name: "Eternal Keeper",  icon: "⏳", requiredJob: "shadow_lord", requiredLevel: 50, description: "Keeper of what endures.", bonuses: ["+50 XP on boss fights", "+40% XP all goals", "+5 SP per level"], tier: 6 },
  { id: "crimson_king", name: "Redeemed King",    icon: "👑", requiredJob: "blood_lord", requiredLevel: 50, description: "A king made new.", bonuses: ["+60 XP on boss fights", "+35% XP all goals", "+3 SP per level"], tier: 6 },
  { id: "cosmic_sage",  name: "Heaven Seer",      icon: "🌠", requiredJob: "mystic", requiredLevel: 50, description: "Sees beyond the present.", bonuses: ["+50 XP on long-term", "+40% XP all goals", "+7 SP per level"], tier: 6 },
  { id: "divine_sovereign", name: "Divine Sovereign", icon: "🏛️", requiredJob: "ascended", requiredLevel: 50, description: "Sovereign of all creation.", bonuses: ["+50 Faith/devotion", "+35% XP all goals", "+5 SP per level"], tier: 6 },
];

// ─── SKILL TREES ─────────────────────────────────────────────────────────────
export const SKILLS = [
  { id: "sk_focus",        jobId: "seeker",    name: "Inner Focus",         icon: "🎯", cost: 1, description: "+1 XP on every completed goal" },
  { id: "sk_resolve",      jobId: "seeker",    name: "Resolve",             icon: "💪", cost: 1, description: "+5 XP when completing a goal on time" },
  { id: "sk_roots",        jobId: "seeker",    name: "Deep Roots",          icon: "🌳", cost: 2, description: "+3 Faith on any goal complete" },
  { id: "sk_battle_cry",   jobId: "warrior",   name: "Battle Cry",          icon: "📣", cost: 1, description: "+5 XP on daily goals" },
  { id: "sk_endurance",    jobId: "warrior",   name: "Endurance",           icon: "🏋️", cost: 2, description: "+10 XP on weekly goals" },
  { id: "sk_wrath",        jobId: "warrior",   name: "Holy Wrath",          icon: "⚡", cost: 3, description: "+25 XP on boss fights" },
  { id: "sk_insight",      jobId: "scholar",   name: "Insight",             icon: "💡", cost: 1, description: "+8 XP on elite quests" },
  { id: "sk_memory",       jobId: "scholar",   name: "Photographic Memory", icon: "🧠", cost: 2, description: "+1 SP every 5 completed goals" },
  { id: "sk_wisdom",       jobId: "scholar",   name: "Ancient Wisdom",      icon: "📖", cost: 3, description: "+15 XP on elite quests, +2 Faith" },
  { id: "sk_prayer",       jobId: "devotee",   name: "Morning Prayer",      icon: "🌅", cost: 1, description: "+5 Faith per devotion" },
  { id: "sk_communion",    jobId: "devotee",   name: "Communion",           icon: "🍞", cost: 2, description: "+3 XP per streak day" },
  { id: "sk_anointed",     jobId: "devotee",   name: "Anointed",            icon: "🕯️", cost: 3, description: "+10 Faith per devotion, +5 XP" },
  { id: "sk_guard",        jobId: "knight",    name: "Guardian",            icon: "🛡️", cost: 2, description: "Streak breaks only remove half XP" },
  { id: "sk_valor",        jobId: "knight",    name: "Valor",               icon: "🏆", cost: 2, description: "+15 XP on weekly goals" },
  { id: "sk_fortress",     jobId: "knight",    name: "Fortress",            icon: "🏰", cost: 3, description: "+20 XP on boss fights, +8 XP weekly" },
  { id: "sk_fury",         jobId: "berserker", name: "Fury",                icon: "🔥", cost: 1, description: "+10 XP on boss fights" },
  { id: "sk_rampage",      jobId: "berserker", name: "Rampage",             icon: "💢", cost: 3, description: "+35 XP on boss fights" },
  { id: "sk_clarity",      jobId: "sage",      name: "Clarity",             icon: "✨", cost: 2, description: "+12 XP on elite quests" },
  { id: "sk_mastery",      jobId: "sage",      name: "Mastery",             icon: "🎓", cost: 3, description: "+20 XP on elite quests, +1 SP per level" },
  { id: "sk_journal",      jobId: "scribe",    name: "Daily Journal",       icon: "📓", cost: 1, description: "+3 XP per devotion entry" },
  { id: "sk_chronicle",    jobId: "scribe",    name: "Chronicle",           icon: "📝", cost: 2, description: "+10 XP on elite quests, +5 XP devotion" },
  { id: "sk_intercession", jobId: "priest",    name: "Intercession",        icon: "🙏", cost: 2, description: "+8 Faith per devotion" },
  { id: "sk_revival",      jobId: "priest",    name: "Revival",             icon: "💫", cost: 3, description: "+15 Faith per devotion, +5 XP" },
  { id: "sk_holy_strike",  jobId: "paladin",   name: "Holy Strike",         icon: "⚔️", cost: 2, description: "+12 XP on weekly & boss goals" },
  { id: "sk_shield_faith", jobId: "paladin",   name: "Shield of Faith",     icon: "🛡️", cost: 3, description: "+10 Faith/devotion, +15 XP boss fights" },
  { id: "sk_ascend",       jobId: "legend",    name: "Ascendance",          icon: "🌠", cost: 3, description: "+20% XP from all goals" },
  { id: "sk_foresight",    jobId: "oracle",    name: "Foresight",           icon: "🔭", cost: 3, description: "+25% XP from all goals" },
  { id: "sk_revelation",   jobId: "prophet",   name: "Revelation",          icon: "📯", cost: 3, description: "+25 Faith/devotion, +15% XP all goals" },
  // Dark Knight
  { id: "sk_shadow_strike", jobId: "dark_knight", name: "Shadow Strike",     icon: "🗡️", cost: 2, description: "+18 XP on weekly & boss goals" },
  { id: "sk_duality",       jobId: "dark_knight", name: "Duality",           icon: "☯️", cost: 3, description: "+25% XP all goals" },
  // Blood Mage
  { id: "sk_blood_pact",    jobId: "blood_mage", name: "Blood Pact",        icon: "📜", cost: 2, description: "+35 XP on boss fights" },
  { id: "sk_sacrifice",     jobId: "blood_mage", name: "Sacrifice",         icon: "🔥", cost: 3, description: "+50 XP on boss fights" },
  // Arch Sage
  { id: "sk_omniscience",   jobId: "arch_sage",  name: "Omniscience",       icon: "👁️", cost: 3, description: "+30 XP on elite quests, +30% XP" },
  { id: "sk_cosmic_truth",  jobId: "arch_sage",  name: "Cosmic Truth",      icon: "🌌", cost: 4, description: "+40 XP on elite quests, +1 SP per 3 goals" },
  // Sanctifier
  { id: "sk_divine_grace",  jobId: "sanctifier", name: "Divine Grace",      icon: "🙏", cost: 2, description: "+20 Faith/devotion" },
  { id: "sk_apotheosis",    jobId: "sanctifier", name: "Apotheosis",        icon: "⛪", cost: 4, description: "+35 Faith/devotion, +20% XP all" },
  // Shadow Lord
  { id: "sk_eclipse",       jobId: "shadow_lord", name: "Eclipse",          icon: "🌑", cost: 3, description: "+40 XP on boss fights" },
  { id: "sk_void_walk",     jobId: "shadow_lord", name: "Void Walk",        icon: "💫", cost: 4, description: "+35% XP all goals" },
  // Blood Lord
  { id: "sk_crimson_tide",  jobId: "blood_lord", name: "Crimson Tide",     icon: "🌊", cost: 3, description: "+55 XP on boss fights" },
  { id: "sk_dominion",      jobId: "blood_lord", name: "Dominion",         icon: "👑", cost: 4, description: "+50 XP on boss fights, +20% XP" },
  // Mystic
  { id: "sk_transcendence", jobId: "mystic",     name: "Transcendence",    icon: "✨", cost: 4, description: "+40% XP all goals" },
  { id: "sk_infinite_mind", jobId: "mystic",     name: "Infinite Mind",    icon: "∞", cost: 4, description: "+50 XP on elite quests, +1 SP per 2 goals" },
  // Ascended
  { id: "sk_divine_light",  jobId: "ascended",   name: "Divine Light",     icon: "☀️", cost: 3, description: "+40 Faith/devotion" },
  { id: "sk_salvation",     jobId: "ascended",   name: "Salvation",        icon: "🕊️", cost: 5, description: "+50 Faith/devotion, +30% XP all goals" },
  // Void Master
  { id: "sk_void_stride",   jobId: "void_master", name: "Void Stride",      icon: "🚀", cost: 4, description: "+45 XP on boss fights" },
  { id: "sk_nihility",      jobId: "void_master", name: "Nihility",         icon: "⚫", cost: 5, description: "+50% XP all goals" },
  // Crimson King
  { id: "sk_blood_crown",   jobId: "crimson_king", name: "Blood Crown",     icon: "👑", cost: 4, description: "+65 XP on boss fights" },
  { id: "sk_reign",         jobId: "crimson_king", name: "Reign",           icon: "🔴", cost: 5, description: "+45% XP all goals" },
  // Cosmic Sage
  { id: "sk_cosmic_unity",  jobId: "cosmic_sage",  name: "Cosmic Unity",    icon: "🌌", cost: 5, description: "+55 XP on elite quests, +45% XP all" },
  { id: "sk_universal_law", jobId: "cosmic_sage",  name: "Universal Law",   icon: "⚖️", cost: 5, description: "+1 SP per goal completed" },
  // Divine Sovereign
  { id: "sk_absolute_faith", jobId: "divine_sovereign", name: "Absolute Faith", icon: "🙏", cost: 5, description: "+60 Faith/devotion, +40% XP all" },
  { id: "sk_divine_ascent",  jobId: "divine_sovereign", name: "Divine Ascent",  icon: "✨", cost: 6, description: "+2 SP per level, +50% XP all goals" },
];

// ─── PASSIVE CALCULATOR ──────────────────────────────────────────────────────
// Returns { finalXP, modifiers[] } factoring in item passives + job bonuses + skill bonuses
export function calculateXPWithPassives(baseXP, timeframe, equippedItemIds = [], currentJobId = null, unlockedSkillIds = [], goalMeta = {}) {
  const equippedItems = EQUIPMENT.filter(e => equippedItemIds.includes(e.id));
  const job = currentJobId ? JOB_TREE.find(j => j.id === currentJobId) : null;
  const unlockedSkills = SKILLS.filter(s => unlockedSkillIds.includes(s.id));
  let bonus = 0;
  let multiplier = 1;
  const modifiers = [];
  const { isOnTime = true } = goalMeta; // whether goal was completed on or before due date

  // Helper: parse a passive string for flat XP and % XP bonuses
  const applyPassive = (p, label) => {
    if (!p) return;
    let m;

    // "+N XP on every completed goal" / "+N XP on every goal" — universal flat bonus
    const everyGoalRe = /\+(\d+)\s*XP\s+on\s+every\s+(?:completed\s+)?goal/gi;
    while ((m = everyGoalRe.exec(p)) !== null) {
      const amt = parseInt(m[1]);
      bonus += amt; modifiers.push(`+${amt} XP (${label})`);
    }

    // "+N XP when completing a goal on time"
    const onTimeRe = /\+(\d+)\s*XP\s+when\s+completing\s+a\s+goal\s+on\s+time/gi;
    while ((m = onTimeRe.exec(p)) !== null) {
      const amt = parseInt(m[1]);
      if (isOnTime) { bonus += amt; modifiers.push(`+${amt} XP (${label})`); }
    }

    // +N XP on <timeframe> goals  (handles "all", "daily", "weekly", "long-term", "boss fights")
    const flatRe = /\+(\d+)\s*XP\s+on\s+(daily|weekly|long[- ]term|boss\s*fights?|all(?:\s+goal)?)\s*(?:goals?)?/gi;
    while ((m = flatRe.exec(p)) !== null) {
      const amt = parseInt(m[1]);
      const scope = m[2].toLowerCase().replace(/\s+/g, "_");
      const match =
        scope.startsWith("all") ||
        (scope === "daily" && timeframe === "daily") ||
        (scope === "weekly" && timeframe === "weekly") ||
        (scope.startsWith("long") && timeframe === "long_term") ||
        (scope.includes("boss") && timeframe === "boss_fight");
      if (match) { bonus += amt; modifiers.push(`+${amt} XP (${label})`); }
    }

    // +N XP from all goals (alternative phrasing)
    const flatAllRe = /\+(\d+)\s*XP\s+(?:from\s+)?all\s+(?:goal|combat)?/gi;
    while ((m = flatAllRe.exec(p)) !== null) {
      const amt = parseInt(m[1]);
      bonus += amt; modifiers.push(`+${amt} XP (${label})`);
    }

    // +N XP on weekly & long-term  /  +N XP on weekly & boss
    const weeklyAndRe = /\+(\d+)\s*XP\s+(?:on\s+)?weekly\s*[&,]\s*(long[- ]term|boss)/gi;
    while ((m = weeklyAndRe.exec(p)) !== null) {
      const amt = parseInt(m[1]);
      const second = m[2].toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
      const matchWeekly = timeframe === "weekly";
      const matchSecond = second.startsWith("long") ? timeframe === "long_term" : timeframe === "boss_fight";
      if (matchWeekly || matchSecond) { bonus += amt; modifiers.push(`+${amt} XP (${label})`); }
    }

    // +N XP per devotion entry / per devotion (only for devotion timeframe)
    const devXpRe = /\+(\d+)\s*XP\s+(?:per\s+devotion|on\s+devotion)/gi;
    while ((m = devXpRe.exec(p)) !== null) {
      const amt = parseInt(m[1]);
      if (timeframe === "devotion") { bonus += amt; modifiers.push(`+${amt} XP (${label})`); }
    }

    // +N XP per streak day (for devotion)
    const streakXpRe = /\+(\d+)\s*XP\s+per\s+streak\s+day/gi;
    while ((m = streakXpRe.exec(p)) !== null) {
      const amt = parseInt(m[1]);
      if (timeframe === "devotion") { bonus += amt; modifiers.push(`+${amt} XP (${label})`); }
    }

    // +N% XP from all goals
    const pctAllRe = /\+(\d+)%\s*XP\s+(?:from\s+|on\s+)?all\s+(?:goal|combat)?/gi;
    while ((m = pctAllRe.exec(p)) !== null) {
      const pct = parseInt(m[1]) / 100;
      multiplier += pct; modifiers.push(`+${m[1]}% XP (${label})`);
    }

    // +N% XP from weekly & long-term
    const pctWeeklyRe = /\+(\d+)%\s*XP\s+(?:from\s+)?(?:weekly\s*(?:&|and)?\s*long[- ]term)/gi;
    while ((m = pctWeeklyRe.exec(p)) !== null) {
      const pct = parseInt(m[1]) / 100;
      if (timeframe === "weekly" || timeframe === "long_term") { multiplier += pct; modifiers.push(`+${m[1]}% XP (${label})`); }
    }
  };

  // Apply job bonuses
  if (job?.bonuses) {
    for (const b of job.bonuses) applyPassive(b, job.name);
  }

  // Apply skill bonuses
  for (const skill of unlockedSkills) {
    applyPassive(skill.description, skill.name);
  }

  // Apply item passives
  for (const item of equippedItems) {
    applyPassive(item.passive, item.name);
  }

  const finalXP = Math.round((baseXP + bonus) * multiplier);
  return { finalXP, modifiers };
}

// Calculate faith bonuses from passives/skills on goal completion (not devotion)
export function calculateFaithForGoal(equippedItemIds = [], currentJobId = null, unlockedSkillIds = []) {
  const equippedItems = EQUIPMENT.filter(e => equippedItemIds.includes(e.id));
  const job = currentJobId ? JOB_TREE.find(j => j.id === currentJobId) : null;
  const unlockedSkills = SKILLS.filter(s => unlockedSkillIds.includes(s.id));
  let bonus = 0;
  const modifiers = [];

  const applyGoalFaith = (p, label) => {
    if (!p) return;
    let m;
    // "+N Faith on any goal completion" / "+N Faith on any goal complete"
    const goalFaithRe = /\+(\d+)\s*Faith\s+on\s+any\s+goal\s+complet/gi;
    while ((m = goalFaithRe.exec(p)) !== null) {
      const amt = parseInt(m[1]);
      bonus += amt; modifiers.push(`+${amt} Faith (${label})`);
    }
    // "+N Faith on any goal" (shorter phrasing)
    const goalFaithRe2 = /\+(\d+)\s*Faith\s+on\s+any\s+goal$/gim;
    while ((m = goalFaithRe2.exec(p)) !== null) {
      const amt = parseInt(m[1]);
      bonus += amt; modifiers.push(`+${amt} Faith (${label})`);
    }
  };

  // Skill-specific: Deep Roots = "+3 Faith on any goal completion"
  for (const skill of unlockedSkills) {
    applyGoalFaith(skill.description, skill.name);
  }
  for (const item of equippedItems) {
    applyGoalFaith(item.passive, item.name);
  }
  if (job?.bonuses) {
    for (const b of job.bonuses) applyGoalFaith(b, job.name);
  }

  return { faithBonus: bonus, modifiers };
}

// Calculate faith bonuses from job, skills, and equipped items for devotion
export function calculateFaithWithPassives(baseFaith, equippedItemIds = [], currentJobId = null, unlockedSkillIds = []) {
  const equippedItems = EQUIPMENT.filter(e => equippedItemIds.includes(e.id));
  const job = currentJobId ? JOB_TREE.find(j => j.id === currentJobId) : null;
  const unlockedSkills = SKILLS.filter(s => unlockedSkillIds.includes(s.id));
  let bonus = 0;
  const modifiers = [];

  const applyFaithPassive = (p, label) => {
    if (!p) return;
    // +N Faith per devotion / per devotion completion (devotion-specific passives only)
    const re = /\+(\d+)\s*Faith\s+(?:per\s+devotion|on\s+devotion|per\s+streak\s+day)/gi;
    let m;
    while ((m = re.exec(p)) !== null) {
      const amt = parseInt(m[1]);
      bonus += amt; modifiers.push(`+${amt} Faith (${label})`);
    }
    // NOTE: "Faith on any goal" is intentionally excluded here — devotion is not a goal
  };

  if (job?.bonuses) for (const b of job.bonuses) applyFaithPassive(b, job.name);
  for (const skill of unlockedSkills) applyFaithPassive(skill.description, skill.name);
  for (const item of equippedItems) applyFaithPassive(item.passive, item.name);

  return { finalFaith: baseFaith + bonus, modifiers };
}

// ─── TITLES ──────────────────────────────────────────────────────────────────
export const TITLES = [
  { level: 1,   title: "Novice" },
  { level: 5,   title: "Apprentice" },
  { level: 10,  title: "Adventurer" },
  { level: 15,  title: "Warrior" },
  { level: 20,  title: "Champion" },
  { level: 30,  title: "Hero" },
  { level: 40,  title: "Veteran" },
  { level: 50,  title: "Elite" },
  { level: 60,  title: "Master" },
  { level: 75,  title: "Legend" },
  { level: 90,  title: "Mythic" },
  { level: 100, title: "Divine" },
];

export function getTitle(level) {
  let title = "Novice";
  for (const t of TITLES) {
    if (level >= t.level) title = t.title;
  }
  return title;
}

// ─── JOB HELPERS ─────────────────────────────────────────────────────────────
export function getJobById(id) {
  return JOB_TREE.find((j) => j.id === id) || JOB_TREE[0];
}

export function getVisibleJobs(currentJobId, level) {
  const visible = new Set();

  // Collect all ancestors (path to root)
  const ancestors = new Set();
  let ancestor = currentJobId;
  while (ancestor) {
    ancestors.add(ancestor);
    const job = JOB_TREE.find((j) => j.id === ancestor);
    ancestor = job?.requiredJob || null;
  }

  // Show all ancestors
  ancestors.forEach(a => visible.add(a));

  // Recursively show all reachable descendants from any ancestor
  const addDescendants = (jobId) => {
    JOB_TREE.forEach((job) => {
      if (job.requiredJob === jobId && level >= job.requiredLevel && !visible.has(job.id)) {
        visible.add(job.id);
        addDescendants(job.id); // Recursively add children of this job
      }
    });
  };

  // Add descendants from all ancestors (not just current job)
  ancestors.forEach(ancestorId => addDescendants(ancestorId));

  return JOB_TREE.filter((j) => visible.has(j.id)).sort((a, b) => a.tier - b.tier);
}

export function getSkillsForJob(jobId) {
  return SKILLS.filter((s) => s.jobId === jobId);
}

export function getUnlockedSkills(unlockedSkillIds = []) {
  return SKILLS.filter((s) => unlockedSkillIds.includes(s.id));
}

// ─── EQUIPMENT TIERS ─────────────────────────────────────────────────────────
export const EQUIPMENT_TIERS = [
  { label: "Tier 1", minLevel: 1,  maxLevel: 10 },
  { label: "Tier 2", minLevel: 11, maxLevel: 20 },
  { label: "Tier 3", minLevel: 21, maxLevel: 30 },
  { label: "Tier 4", minLevel: 31, maxLevel: 50 },
  { label: "Tier 5", minLevel: 51, maxLevel: 70 },
  { label: "Tier 6", minLevel: 71, maxLevel: 100 },
];

export function getTierForLevel(level) {
  for (const tier of EQUIPMENT_TIERS) {
    if (level >= tier.minLevel && level <= tier.maxLevel) return tier;
  }
  return EQUIPMENT_TIERS[EQUIPMENT_TIERS.length - 1];
}

// ─── SKILL POINT BONUSES AT LEVEL UP ────────────────────────────────────────
// Calculates bonus SP from equipped items on level-up
export function calculateSPBonusOnLevelUp(equippedItemIds = []) {
  const equippedItems = EQUIPMENT.filter(e => equippedItemIds.includes(e.id));
  let bonusSP = 0;
  const modifiers = [];

  for (const item of equippedItems) {
    if (!item.passive) continue;
    // Match patterns like "+1 skill point at level-up", "+3 skill points at level-up", "+5 SP per level-up"
    const spRe = /\+(\d+)\s*(?:skill\s*points?|SP)\s+(?:at|per)\s+level[- ]?up/gi;
    let m;
    while ((m = spRe.exec(item.passive)) !== null) {
      const amt = parseInt(m[1]);
      bonusSP += amt;
      modifiers.push(`+${amt} SP (${item.name})`);
    }
  }

  return { bonusSP, modifiers };
}