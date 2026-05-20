import React, { useMemo, useState } from "react";
import { useCharacter } from "@/lib/useCharacter";
import {
  ACHIEVEMENTS,
  ACHIEVEMENT_CATEGORIES,
  getCategoryLabel,
} from "@/lib/achievements";
import CharacterSetup from "@/components/character/CharacterSetup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Search,
  Sparkles,
  Lock,
  Unlock,
  ArrowLeft,
  Filter,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

function AchievementCard({ achievement }) {
  return (
    <Card
      className={cn(
        "transition-all border",
        achievement.unlocked
          ? "bg-primary/5 border-primary/20"
          : "bg-muted/20 border-muted-foreground/20 opacity-90"
      )}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={cn(
                "shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center text-lg border",
                achievement.unlocked
                  ? "bg-primary/10 border-primary/20"
                  : "bg-background border-muted-foreground/20"
              )}
            >
              {achievement.icon}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-semibold text-sm sm:text-base">
                  {achievement.name}
                </h3>
                <Badge variant="secondary" className="text-[10px]">
                  {achievement.rarity}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {getCategoryLabel(achievement.category)}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground mt-1">
                {achievement.description}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            {achievement.unlocked ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                <Unlock className="w-3.5 h-3.5" />
                Unlocked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Lock className="w-3.5 h-3.5" />
                Locked
              </span>
            )}
            <span className="text-[10px] text-muted-foreground">
              Tier {achievement.tier}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground">
            Progress:{" "}
            <span className="font-medium text-foreground">
              {achievement.unlocked ? "Complete" : `${achievement.current}/${achievement.target}`}
            </span>
          </span>
          <span className="font-medium text-primary">
            {achievement.percent}%
          </span>
        </div>

        <Progress value={achievement.percent} className="h-2" />
      </CardContent>
    </Card>
  );
}

export default function AchievementsPage() {
  const { character, achievementState, isLoading, createCharacter } = useCharacter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  const filteredAchievements = useMemo(() => {
    const query = search.trim().toLowerCase();

    return achievementState.evaluated
      .filter((achievement) => {
        const matchesCategory =
          category === "all" || achievement.category === category;
        const matchesSearch =
          !query ||
          achievement.name.toLowerCase().includes(query) ||
          achievement.description.toLowerCase().includes(query) ||
          achievement.category.toLowerCase().includes(query) ||
          achievement.rarity.toLowerCase().includes(query);

        const matchesUnlocked = !showUnlockedOnly || achievement.unlocked;

        return matchesCategory && matchesSearch && matchesUnlocked;
      })
      .sort((a, b) => {
        if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
        if (a.tier !== b.tier) return a.tier - b.tier;
        return a.name.localeCompare(b.name);
      });
  }, [achievementState.evaluated, search, category, showUnlockedOnly]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!character) return <CharacterSetup onSetup={createCharacter} />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <Button asChild variant="ghost" size="sm" className="px-0 -ml-2 h-auto">
            <Link to="/character" className="inline-flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back to Character
            </Link>
          </Button>

          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              Achievements
            </h1>
            <p className="text-sm text-muted-foreground">
              Complete milestones across levels, goals, devotion, equipment, skills, and jobs.
            </p>
          </div>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-background">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completion</p>
              <p className="text-3xl font-bold font-display">
                {achievementState.completionPercent}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {achievementState.unlockedCount} of {achievementState.totalCount} unlocked
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>{achievementState.newlyUnlocked.length} newly unlocked in this sync</span>
            </div>
          </div>

          <Progress value={achievementState.completionPercent} className="h-3" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="rounded-xl border bg-card p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Level</p>
              <p className="font-display font-semibold text-lg">{achievementState.stats.level}</p>
            </div>
            <div className="rounded-xl border bg-card p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Goals</p>
              <p className="font-display font-semibold text-lg">{achievementState.stats.completed_goals}</p>
            </div>
            <div className="rounded-xl border bg-card p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Devotion Streak</p>
              <p className="font-display font-semibold text-lg">{achievementState.stats.current_streak}</p>
            </div>
            <div className="rounded-xl border bg-card p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Faith</p>
              <p className="font-display font-semibold text-lg">{achievementState.stats.faith_total}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search achievements..."
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {ACHIEVEMENT_CATEGORIES.map((item) => (
              <Button
                key={item.id}
                type="button"
                variant={category === item.id ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(item.id)}
                className="min-h-[40px]"
              >
                {item.label}
              </Button>
            ))}

            <Button
              type="button"
              variant={showUnlockedOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowUnlockedOnly((prev) => !prev)}
              className="min-h-[40px]"
            >
              {showUnlockedOnly ? "Showing Unlocked" : "Unlocked Only"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {filteredAchievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="font-medium">No achievements match your filters.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try a different search term or category.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}