const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useCharacter } from "@/lib/useCharacter";
import { FAITH_REWARDS, calculateXPWithPassives, calculateFaithWithPassives } from "@/lib/gameData";
import { logActivity } from "@/lib/useCharacter";
import PullToRefresh from "@/components/layout/PullToRefresh";
import DevotionForm from "@/components/devotion/DevotionForm";
import MonthlyGrid from "@/components/devotion/MonthlyGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Flame, Sparkles, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { format, subDays } from "date-fns";

const BASE_DEVOTION_XP = 20;

function computeStreak(devotions) {
  if (!devotions || devotions.length === 0) return 0;
  const dates = [...new Set(devotions.map((d) => d.date))].sort().reverse();
  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
  if (dates[0] !== today && dates[0] !== yesterday) return 0;
  let streak = 0;
  let check = dates[0] === today ? new Date() : subDays(new Date(), 1);
  for (const d of dates) {
    if (d === format(check, "yyyy-MM-dd")) {
      streak++;
      check = subDays(check, 1);
    } else break;
  }
  return streak;
}

export default function DevotionPage() {
  const queryClient = useQueryClient();
  const { character, addXP, addFaith } = useCharacter();
  const [editing, setEditing] = useState(false);

  const { data: devotions = [], isLoading } = useQuery({
    queryKey: ["devotions"],
    queryFn: async () => {
      const user = await db.auth.me();
      return db.entities.Devotion.filter({ created_by: user.email }, "-date");
    },
  });

  const today = format(new Date(), "yyyy-MM-dd");
  const todayDevotion = devotions.find((d) => d.date === today);
  const streak = computeStreak(devotions);
  const baseXPToday = BASE_DEVOTION_XP + Math.max(0, streak - 1) * 5;
  const baseFaithToday = FAITH_REWARDS.devotion_base + Math.max(0, streak - 1) * FAITH_REWARDS.devotion_streak_bonus;
  const { finalXP: xpToday, modifiers: xpModifiers } = calculateXPWithPassives(
    baseXPToday, "devotion", character?.equipped_items || [], character?.current_job, character?.unlocked_skills || []
  );
  const { finalFaith: faithToday, modifiers: faithModifiers } = calculateFaithWithPassives(
    baseFaithToday, character?.equipped_items || [], character?.current_job, character?.unlocked_skills || []
  );
  const completedDates = devotions.map((d) => d.date);

  const createDevotion = useMutation({
    mutationFn: async ({ verse, notes }) => {
      await db.entities.Devotion.create({
        date: today,
        bible_verse: verse,
        notes,
        xp_earned: xpToday,
        streak_day: streak + 1,
      });
      if (character) {
        addXP(xpToday);
        addFaith(faithToday);
        await logActivity({
          action_type: "xp_gained",
          source: `Devotion: ${verse}`,
          amount: xpToday,
          base_amount: baseXPToday,
          modifiers: xpModifiers.join(", "),
          icon: "📖",
        });
        await logActivity({
          action_type: "faith_gained",
          source: `Devotion: ${verse}`,
          amount: faithToday,
          base_amount: baseFaithToday,
          modifiers: faithModifiers.join(", "),
          icon: "✨",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devotions"] });
      setEditing(false);
    },
  });

  const updateDevotion = useMutation({
    mutationFn: ({ verse, notes }) =>
      db.entities.Devotion.update(todayDevotion.id, {
        bible_verse: verse,
        notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devotions"] });
      setEditing(false);
    },
  });

  const deleteDevotion = useMutation({
    mutationFn: (id) => db.entities.Devotion.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devotions"] });
      setEditing(false);
    },
  });

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["devotions"] }),
      queryClient.invalidateQueries({ queryKey: ["character"] }),
    ]);
  }, [queryClient]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" /> Daily Devotion
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1.5 justify-end">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="font-display font-bold text-lg">{streak}</span>
            </div>
            <p className="text-xs text-muted-foreground">day streak</p>
          </div>
        </motion.div>

        {/* XP banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/15 px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Today's Reward</span>
            {streak > 1 && (
              <Badge variant="secondary" className="text-xs">
                +{(streak - 1) * 5} streak bonus
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-primary">+{xpToday} XP</span>
            <span className="font-display font-bold text-chart-2">+{faithToday} Faith</span>
          </div>
        </motion.div>

        {/* Today's devotion — completed state or form */}
        {todayDevotion && !editing ? (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <p className="font-display font-semibold">Devotion Complete! ✨</p>
                    <p className="text-xs font-medium text-primary">{todayDevotion.bible_verse}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed break-words line-clamp-4">
                      {todayDevotion.notes}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => setEditing(true)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteDevotion.mutate(todayDevotion.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <DevotionForm
            key={editing ? "edit" : "new"}
            initialVerse={editing ? todayDevotion?.bible_verse : ""}
            initialNotes={editing ? todayDevotion?.notes : ""}
            onSubmit={editing ? updateDevotion.mutate : createDevotion.mutate}
            onCancel={editing ? () => setEditing(false) : undefined}
            isSubmitting={createDevotion.isPending || updateDevotion.isPending}
            isEditing={editing}
          />
        )}

        {/* Monthly progress */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">Monthly Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyGrid completedDates={completedDates} devotions={devotions} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent entries */}
        {devotions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-base">Recent Entries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {devotions.slice(0, 7).map((d) => {
                  const isToday = d.date === today;
                  return (
                    <div key={d.id} className="flex gap-3 py-2.5 border-b last:border-0 items-start">
                      <div className="w-10 h-10 rounded-lg bg-muted flex flex-col items-center justify-center shrink-0 text-center">
                        <span className="text-[10px] text-muted-foreground leading-none">
                          {format(new Date(d.date + "T00:00:00"), "MMM")}
                        </span>
                        <span className="font-display font-bold text-sm leading-none">
                          {format(new Date(d.date + "T00:00:00"), "d")}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-primary truncate">{d.bible_verse}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 break-words">{d.notes}</p>
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <span className="text-xs font-medium text-accent">+{d.xp_earned} XP</span>
                        {isToday && (
                          <div className="flex gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-foreground"
                              onClick={() => setEditing(true)}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteDevotion.mutate(d.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </PullToRefresh>
  );
}