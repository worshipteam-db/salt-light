import db from "@/api/base44Client";

import React, { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useCharacter } from "@/lib/useCharacter";
import { logActivity } from "@/lib/useCharacter";
import { calculateXPWithPassives, calculateFaithForGoal } from "@/lib/gameData";
import CharacterAvatar from "@/components/character/CharacterAvatar";
import XPBar from "@/components/character/XPBar";
import GoalList from "@/components/goals/GoalList";
import GoalEditModal from "@/components/goals/GoalEditModal";
import ActivityLog from "@/components/dashboard/ActivityLog";
import PullToRefresh from "@/components/layout/PullToRefresh";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Target, Trophy, Flame, Plus, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { format, addDays, parseISO } from "date-fns";
import { toast } from "sonner";

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <Card className="bg-card border">
      <CardContent className="p-3 flex flex-col items-center gap-2 text-center sm:p-4 sm:flex-row sm:text-left sm:gap-3">
        <div className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="bg-transparent lucide lucide-target w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-display font-bold leading-none">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{label}</p>
        </div>
      </CardContent>
    </Card>);

}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [editingGoal, setEditingGoal] = useState(null);
  const { character, levelInfo, isLoading: charLoading, createCharacter, addXP, addFaith } = useCharacter();

  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const user = await db.auth.me();
      return db.entities.Goal.filter({ created_by: user.email }, "-created_date");
    }
  });

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["goals"] }),
      queryClient.invalidateQueries({ queryKey: ["character"] }),
      queryClient.invalidateQueries({ queryKey: ["activity_logs"] }),
    ]);
  }, [queryClient]);

  const completeGoal = useMutation({
    mutationFn: async (goal) => {
      const baseXP = goal.xp_reward || 15;
      const isOnTime = !goal.due_date || goal.due_date >= format(new Date(), "yyyy-MM-dd");
      const { finalXP, modifiers } = calculateXPWithPassives(
        baseXP, goal.timeframe,
        character?.equipped_items || [],
        character?.current_job,
        character?.unlocked_skills || [],
        { isOnTime }
      );
      const { faithBonus, modifiers: faithMods } = calculateFaithForGoal(
        character?.equipped_items || [],
        character?.current_job,
        character?.unlocked_skills || []
      );
      await db.entities.Goal.update(goal.id, {
        status: "completed",
        completed_date: format(new Date(), "yyyy-MM-dd"),
      });
      addXP(finalXP);
      if (faithBonus > 0) {
        addFaith(faithBonus);
        await logActivity({
          action_type: "faith_gained",
          source: `Goal: ${goal.title}`,
          amount: faithBonus,
          base_amount: 0,
          modifiers: faithMods.join(", "),
          icon: "🌳",
        });
      }
      await logActivity({
        action_type: "xp_gained",
        source: `Goal: ${goal.title}`,
        amount: finalXP,
        base_amount: baseXP,
        modifiers: modifiers.join(", "),
        icon: goal.timeframe === "boss_fight" ? "⚔️" : "⚡",
      });
      return finalXP;
    },
    onMutate: async (goal) => {
      await queryClient.cancelQueries({ queryKey: ["goals"] });
      const previous = queryClient.getQueryData(["goals"]);
      queryClient.setQueryData(["goals"], (old = []) =>
        old.map(g => g.id === goal.id
          ? { ...g, status: "completed", completed_date: format(new Date(), "yyyy-MM-dd") }
          : g
        )
      );
      return { previous };
    },
    onError: (_err, _goal, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["goals"], ctx.previous);
    },
    onSuccess: (finalXP) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["activity_logs"] });
      toast.success(`+${finalXP} XP earned!`, { icon: "⚡" });
    },
  });

  const editGoal = useMutation({
    mutationFn: ({ id, data }) => db.entities.Goal.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals"] }),
  });

  if (charLoading || goalsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>);
  }

  if (!character) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Create a character to get started</p>
      </div>
    );
  }

  const today = format(new Date(), "yyyy-MM-dd");
  const activeGoals = goals.filter((g) => g.status === "active");
  const todayGoals = activeGoals.filter((g) => {
    if (g.timeframe === "daily") return !g.due_date || g.due_date === today;
    if (g.timeframe === "weekly") return g.due_date === today;
    if (g.timeframe === "long_term" || g.timeframe === "boss_fight") return g.due_date === today;
    return false;
  });
  const completedToday = goals.filter(
    (g) => g.status === "completed" && g.completed_date === today
  );

  return (
    <>
    {editingGoal && (
      <GoalEditModal
        goal={editingGoal}
        onSave={(id, data) => editGoal.mutate({ id, data })}
        onClose={() => setEditingGoal(null)}
      />
    )}
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="space-y-6">
      {/* Hero section */}
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary/5 via-accent/5 to-background rounded-2xl border p-6 flex flex-col sm:flex-row items-center gap-6">
          
        <CharacterAvatar character={character} size="lg" />
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div>
          <h1 className="font-display text-2xl font-bold">Welcome back, {character.name || "Hero"}!</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {todayGoals.length > 0 ?
                `You have ${todayGoals.length} goal${todayGoals.length > 1 ? "s" : ""} due today` :
                "Add some goals to start your quest"}
            </p>
          </div>
          <XPBar currentXP={levelInfo.currentXP} neededXP={levelInfo.neededXP} level={levelInfo.level} />
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={Target} label="Active Goals" value={activeGoals.length} color="bg-primary/10 text-primary" />
        <StatCard icon={Trophy} label="Completed" value={character.goals_completed || 0} color="bg-accent/10 text-accent" />
        <StatCard icon={Flame} label="Today" value={completedToday.length} color="bg-chart-4/10 text-chart-4" />
      </div>

      {/* Today's Goals */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="font-display text-lg">Today's Goals</CardTitle>
          <Link to="/goals">
            <Button variant="ghost" size="sm" className="text-xs">
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {todayGoals.length > 0 ?
            <GoalList
              goals={todayGoals.slice(0, 5)}
              onComplete={(goal) => completeGoal.mutate(goal)}
              onDelete={(goal) => db.entities.Goal.delete(goal.id).then(() => queryClient.invalidateQueries({ queryKey: ["goals"] }))}
              onEdit={(goal) => setEditingGoal(goal)}
              onCopy={(goal) => {
                const newDate = format(addDays(parseISO(goal.due_date || today), 1), "yyyy-MM-dd");
                db.entities.Goal.create({
                  title: goal.title,
                  description: goal.description,
                  timeframe: goal.timeframe,
                  xp_reward: goal.xp_reward,
                  status: "active",
                  due_date: newDate,
                }).then(() => queryClient.invalidateQueries({ queryKey: ["goals"] }));
              }}
              emptyMessage="No goals due today" /> :
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-3">No goals due today</p>
              <Link to="/goals">
                <Button size="sm" variant="outline" className="font-display">
                  <Plus className="w-4 h-4 mr-1" /> Add a Goal
                </Button>
              </Link>
            </div>
          }
        </CardContent>
      </Card>

      {/* Activity Log */}
      <ActivityLog />
    </div>
    </PullToRefresh>
    </>);

}