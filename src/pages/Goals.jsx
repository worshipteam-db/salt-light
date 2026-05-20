import db from "@/api/base44Client";

import React, { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useCharacter } from "@/lib/useCharacter";
import GoalForm from "@/components/goals/GoalForm";
import GoalList from "@/components/goals/GoalList";
import GoalEditModal from "@/components/goals/GoalEditModal";
import DailyCalendarView from "@/components/goals/DailyCalendarView";
import WeeklyCalendarView from "@/components/goals/WeeklyCalendarView";
import PullToRefresh from "@/components/layout/PullToRefresh";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Archive } from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { format, startOfWeek, addDays, parseISO } from "date-fns";
import { toast } from "sonner";
import { calculateXPWithPassives, calculateFaithForGoal } from "@/lib/gameData";
import { logActivity } from "@/lib/useCharacter";

export default function Goals() {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [tab, setTab] = useState("all");
  const queryClient = useQueryClient();
  const { character, addXP, addFaith, isLoading: charLoading, createCharacter } = useCharacter();

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["goals"] }),
      queryClient.invalidateQueries({ queryKey: ["character"] }),
    ]);
  }, [queryClient]);

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const user = await db.auth.me();
      return db.entities.Goal.filter({ created_by: user.email }, "-created_date");
    },
  });

  const createGoal = useMutation({
    mutationFn: (data) => db.entities.Goal.create(data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["goals"] });
      const previous = queryClient.getQueryData(["goals"]);
      const optimistic = { ...data, id: `temp-${Date.now()}`, created_date: new Date().toISOString() };
      queryClient.setQueryData(["goals"], (old = []) => [optimistic, ...old]);
      return { previous };
    },
    onError: (_err, _data, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["goals"], ctx.previous);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      setShowForm(false);
    },
  });

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

  const deleteGoal = useMutation({
    mutationFn: (goal) => db.entities.Goal.delete(goal.id),
    onMutate: async (goal) => {
      await queryClient.cancelQueries({ queryKey: ["goals"] });
      const previous = queryClient.getQueryData(["goals"]);
      queryClient.setQueryData(["goals"], (old = []) => old.filter(g => g.id !== goal.id));
      return { previous };
    },
    onError: (_err, _goal, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["goals"], ctx.previous);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals"] }),
  });

  // Copy a daily goal to multiple dates, or a weekly goal to a specific due_date
  const copyGoal = useMutation({
    mutationFn: async ({ goal, target }) => {
      // target is either string[] (daily: list of dates) or string (weekly: single due_date)
      const dates = Array.isArray(target) ? target : [target];
      await Promise.all(dates.map(date =>
        db.entities.Goal.create({
          title: goal.title,
          description: goal.description,
          timeframe: goal.timeframe,
          xp_reward: goal.xp_reward,
          status: "active",
          due_date: date,
        })
      ));
      return dates.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success(`Copied to ${count} day${count > 1 ? "s" : ""}!`, { icon: "📋" });
    },
  });

  if (charLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const filterGoals = (timeframe) => {
    const filtered = timeframe === "all" ? goals : goals.filter(g => g.timeframe === timeframe);
    const active = filtered.filter(g => g.status === "active");
    return active;
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Goals</h1>
          <p className="text-sm text-muted-foreground">Track and conquer your quests</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="select-none font-display min-h-[44px]"
        >
          <Plus className="w-4 h-4 mr-2" /> New Goal
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <GoalForm
            defaultTimeframe={tab !== "all" ? tab : "daily"}
            onSubmit={(data) => createGoal.mutate(data)}
            onCancel={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full grid grid-cols-5 h-auto">
          <TabsTrigger value="all" className="select-none font-display text-xs min-h-[44px]">All</TabsTrigger>
          <TabsTrigger value="daily" className="select-none font-display text-xs min-h-[44px]">Daily</TabsTrigger>
          <TabsTrigger value="weekly" className="select-none font-display text-xs min-h-[44px]">Weekly</TabsTrigger>
          <TabsTrigger value="long_term" className="select-none font-display text-xs min-h-[44px]">Elite</TabsTrigger>
          <TabsTrigger value="boss_fight" className="select-none font-display text-xs min-h-[44px]">⚔️ Boss</TabsTrigger>
        </TabsList>

        {/* All — flat list */}
        <TabsContent value="all">
          <GoalList
            goals={filterGoals("all")}
            onComplete={(goal) => completeGoal.mutate(goal)}
            onDelete={(goal) => deleteGoal.mutate(goal)}
            onEdit={(goal) => setEditingGoal(goal)}
            emptyMessage="No goals yet. Add one!"
          />
        </TabsContent>

        {/* Daily — calendar view */}
        <TabsContent value="daily">
          {filterGoals("daily").length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">No daily goals yet. Add one!</div>
          ) : (
            <DailyCalendarView
              goals={filterGoals("daily")}
              onComplete={(goal) => completeGoal.mutate(goal)}
              onDelete={(goal) => deleteGoal.mutate(goal)}
              onCopy={(goal, dates) => copyGoal.mutate({ goal, target: dates })}
            />
          )}
        </TabsContent>

        {/* Weekly — calendar view */}
        <TabsContent value="weekly">
          {filterGoals("weekly").length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">No weekly goals yet. Add one!</div>
          ) : (
            <WeeklyCalendarView
              goals={filterGoals("weekly")}
              onComplete={(goal) => completeGoal.mutate(goal)}
              onDelete={(goal) => deleteGoal.mutate(goal)}
              onCopy={(goal, date) => copyGoal.mutate({ goal, target: date })}
            />
          )}
        </TabsContent>

        {/* Elite — flat list */}
        <TabsContent value="long_term">
          <GoalList
            goals={filterGoals("long_term")}
            onComplete={(goal) => completeGoal.mutate(goal)}
            onDelete={(goal) => deleteGoal.mutate(goal)}
            onEdit={(goal) => setEditingGoal(goal)}
            onCopy={(goal) => copyGoal.mutate({ goal, target: goal.due_date || format(new Date(), "yyyy-MM-dd") })}
            emptyMessage="No elite goals yet. Add one!"
          />
        </TabsContent>

        {/* Boss Fight — flat list */}
        <TabsContent value="boss_fight">
          <GoalList
            goals={filterGoals("boss_fight")}
            onComplete={(goal) => completeGoal.mutate(goal)}
            onDelete={(goal) => deleteGoal.mutate(goal)}
            onEdit={(goal) => setEditingGoal(goal)}
            onCopy={(goal) => copyGoal.mutate({ goal, target: goal.due_date || format(new Date(), "yyyy-MM-dd") })}
            emptyMessage="No boss fights yet. Add one!"
          />
        </TabsContent>
      </Tabs>

      {/* Archive link */}
      <Link to="/archive" className="block">
        <Button variant="outline" className="w-full font-display" size="lg">
          <Archive className="w-4 h-4 mr-2" /> View Task Archive
        </Button>
      </Link>
    </div>
    </PullToRefresh>
    </>
  );
}