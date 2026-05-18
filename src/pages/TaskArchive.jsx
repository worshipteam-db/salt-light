import db from "@/api/base44Client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Archive, ArrowLeft, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";
import GoalList from "@/components/goals/GoalList";

export default function TaskArchive() {
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState("recent"); // 'recent' or 'oldest'

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const user = await db.auth.me();
      return db.entities.Goal.filter({ created_by: user.email }, "-created_date");
    }
  });

  const deleteGoal = useMutation({
    mutationFn: (goalId) => db.entities.Goal.delete(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Goal deleted");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const completedGoals = goals.filter(g => g.status === "completed");
  const sorted = sortBy === "recent"
    ? completedGoals
    : [...completedGoals].reverse();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/goals" className="inline-flex">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Archive className="w-6 h-6" /> Task Archive
          </h1>
          <p className="text-sm text-muted-foreground">
            {completedGoals.length} completed goal{completedGoals.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Sort buttons */}
      {completedGoals.length > 0 && (
        <div className="flex gap-2">
          <Button
            variant={sortBy === "recent" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("recent")}
            className="font-display"
          >
            Most Recent
          </Button>
          <Button
            variant={sortBy === "oldest" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("oldest")}
            className="font-display"
          >
            Oldest First
          </Button>
        </div>
      )}

      {/* Goals list */}
      <Card>
        <CardContent className="pt-6">
          {completedGoals.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Archive className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No completed goals yet</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              <AnimatePresence>
                {sorted.map((goal, i) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: i * 0.05 }}
                    className="border rounded-lg p-4 bg-card/50 space-y-2"
                  >
                    <div className="flex items-start gap-3 justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-through text-muted-foreground">
                          {goal.title}
                        </p>
                        {goal.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {goal.description}
                          </p>
                        )}
                        <div className="flex gap-2 mt-2 text-[10px] text-muted-foreground">
                          <span>Completed: {goal.completed_date ? format(new Date(goal.completed_date + "T00:00:00"), "MMM d, yyyy") : "—"}</span>
                          {goal.xp_reward && (
                            <span className="text-accent font-semibold">+{goal.xp_reward} XP</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm("Delete this goal permanently?")) {
                            deleteGoal.mutate(goal.id);
                          }
                        }}
                        className="shrink-0 p-2 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}