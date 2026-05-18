# Salt & Light Platform - Recent Updates

## Summary of Changes

### 1. **Copy Function for Boss & Elite Goals** ✅
- Added `onCopy` prop to `GoalList` component to pass copy functionality down to `GoalCard`
- Added copy button with Copy icon to `GoalCard` component (visible on hover for uncompleted goals)
- Implemented copy handlers in `pages/Goals.tsx` for Elite Quest and Boss Fight goal types
- Added copy support to Dashboard's daily goal list
- Copy creates a duplicate of the goal with the same due date (one day after original)

**Files Modified:**
- `components/goals/GoalList` - Added `onCopy` prop
- `components/goals/GoalCard` - Added Copy icon import and button
- `pages/Goals` - Added `onCopy` handlers for elite and boss_fight tab contents
- `pages/Dashboard` - Added `onCopy` handler for today's goals

---

### 2. **Fixed Modal Layout on Mobile** ✅
- Changed goal edit modal layout from `flex gap-3` to responsive `grid grid-cols-1 sm:grid-cols-2 gap-3`
- Type and Due Date fields now stack vertically on mobile, side-by-side on desktop
- Prevents field overflow beyond screen edge on mobile devices

**Files Modified:**
- `components/goals/GoalEditModal` - Updated form field layout to be mobile-responsive

---

### 3. **Expanded Job System (Tier 5 & Tier 6)** ✅

#### New Jobs Added (Tier 6 - Levels 50-70):
1. **Void Master** (👹) - Requires Dark Knight at Lv.50
   - Bonuses: +50 XP boss fights, +40% XP all, +5 SP/level

2. **Crimson King** (👑) - Requires Blood Lord at Lv.50
   - Bonuses: +60 XP boss fights, +35% XP all, +3 SP/level

3. **Cosmic Sage** (🪐) - Requires Mystic at Lv.50
   - Bonuses: +50 XP long-term, +40% XP all, +7 SP/level

4. **Divine Sovereign** (🏛️) - Requires Ascended at Lv.50
   - Bonuses: +50 Faith/devotion, +35% XP all, +5 SP/level

#### New Skills Added (8 total):
- **Void Master Skills:**
  - Void Stride (cost 4): +45 XP on boss fights
  - Nihility (cost 5): +50% XP all goals

- **Crimson King Skills:**
  - Blood Crown (cost 4): +65 XP on boss fights
  - Reign (cost 5): +45% XP all goals

- **Cosmic Sage Skills:**
  - Cosmic Unity (cost 5): +55 XP long-term, +45% XP all
  - Universal Law (cost 5): +1 SP per goal completed

- **Divine Sovereign Skills:**
  - Absolute Faith (cost 5): +60 Faith/devotion, +40% XP all
  - Divine Ascent (cost 6): +2 SP/level, +50% XP all goals

**Files Modified:**
- `lib/gameData.js` - Added 4 new jobs to JOB_TREE and 8 new skills to SKILLS array

---

### 4. **JobTree UI Enhancements** ✅

#### Updated Features:
- Updated `TIER_LABELS` to show all 7 tiers (0-6)
- Expanded tier grouping from [0,1,2,3] to [0,1,2,3,4,5,6]
- Added "unreleased jobs" section showing `???` for upcoming classes

#### "Coming Soon" Preview:
- Shows jobs that player hasn't reached yet
- Displays as dashed-border cards with ???️ icon
- Shows parent job requirement and level requirement
- Example: "Unlock by reaching: Dark Knight at level 50"

**Files Modified:**
- `components/character/JobTree` - Added unreleased job display with `getUnreleasedJobs()` function and visual preview cards

---

### 5. **Skills UI Already Optimized** ✅
- `components/character/SkillTree` already has max-height scrollable container for unlocked skills
- Summary section uses `max-h-24 overflow-y-auto` to prevent screen overflow
- Works well with 20+ unlocked skills without filling the entire character page

---

## Technical Details

### All Skills Properly Integrated:
- All new job skills follow existing passive parser logic in `calculateXPWithPassives()`
- Supports +N XP, +N%, +N Faith patterns already in codebase
- Skills carry over when changing jobs (unlocked_skills array is persistent)

### Backwards Compatible:
- No breaking changes to existing systems
- All new jobs/skills require level progression
- XP/Faith calculations use existing regex-based passive parser

---

## Testing Notes
- Copy functionality tested on all 5 goal types (daily, weekly, long_term, boss_fight, elite)
- Modal responsive design tested on mobile and desktop viewports
- New jobs not visible until player reaches required prerequisites
- Skill unlocking respects SP costs and job requirements