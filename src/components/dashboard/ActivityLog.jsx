import db from "@/api/base44Client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const PAGE_SIZE = 20;

const ACTION_LABELS = {
  xp_gained: {
    label: "XP Gained",
    color: "text-chart-2",
    bg: "bg-chart-2/10",
  },

  faith_gained: {
    label: "Faith Gained",
    color: "text-primary",
    bg: "bg-primary/10",
  },

  faith_spent: {
    label: "Faith Spent",
    color: "text-destructive",
    bg: "bg-destructive/10",
  },

  xp_spent: {
    label: "XP Spent",
    color: "text-destructive",
    bg: "bg-destructive/10",
  },

  item_purchased: {
    label: "Item Purchased",
    color: "text-accent",
    bg: "bg-accent/10",
  },

  achievement_unlocked: {
    label: "Achievement",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },

  job_changed: {
    label: "Job Changed",
    color: "text-chart-4",
    bg: "bg-chart-4/10",
  },
};

export default function ActivityLog() {
  const [page, setPage] = useState(0);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["activity_logs"],
    queryFn: async () => {
      const user = await db.auth.me();
      return db.entities.ActivityLog.filter({ user_id: user.id });
    },
  });

  const sortedLogs = [...logs].sort(
    (a, b) =>
      new Date(b.created_date || b.created_at || 0) -
      new Date(a.created_date || a.created_at || 0)
  );

  const totalPages = Math.ceil(sortedLogs.length / PAGE_SIZE);

  const pageLogs = sortedLogs.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE
  );

  if (isLoading) return null;

  if (logs.length === 0)
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            No activity yet. Complete goals or devotions to see logs here.
          </p>
        </CardContent>
      </Card>
    );

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="font-display text-base flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Recent Activity
        </CardTitle>

        <span className="text-xs text-muted-foreground">
          {logs.length} entries
        </span>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y">
          {pageLogs.map((log, i) => {
            const config =
              ACTION_LABELS[log.action_type] || {
                label: log.action_type,
                color: "text-foreground",
                bg: "bg-muted",
              };

            const isNegative =
              log.amount < 0 || log.action_type.includes("spent");

            const isLevelUp =
              log.icon === "🎉" &&
              log.source?.startsWith("Level Up!");

            const isAchievement =
              log.action_type === "achievement_unlocked";

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`flex items-start gap-3 px-4 py-3 ${
                  isAchievement
                    ? "bg-yellow-500/[0.03]"
                    : ""
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-8 h-8 rounded-xl ${config.bg} flex items-center justify-center shrink-0 text-sm border`}
                >
                  {isAchievement ? (
                    <Trophy className="w-4 h-4 text-yellow-500" />
                  ) : (
                    log.icon || "⚡"
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-medium truncate ${
                      isAchievement
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-foreground"
                    }`}
                  >
                    {log.source}
                  </p>

                  {log.modifiers && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                      {log.modifiers}
                    </p>
                  )}

                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {log.created_date
                      ? format(
                          new Date(log.created_date),
                          "MMM d, h:mm a"
                        )
                      : ""}
                  </p>
                </div>

                {/* Amount */}
                <div className="shrink-0 text-right">
                  {isLevelUp ? (
                    <>
                      <span className="text-sm font-display font-bold text-chart-3">
                        +{log.amount} SP
                      </span>

                      <p className="text-[10px] text-muted-foreground">
                        Skill Points
                      </p>
                    </>
                  ) : isAchievement ? (
                    <>
                      <span className="text-sm font-display font-bold text-yellow-500">
                        UNLOCKED
                      </span>

                      <p className="text-[10px] text-muted-foreground">
                        Achievement
                      </p>
                    </>
                  ) : (
                    <>
                      <span
                        className={`text-sm font-display font-bold ${
                          isNegative
                            ? "text-destructive"
                            : config.color
                        }`}
                      >
                        {isNegative ? "" : "+"}
                        {log.amount}
                      </span>

                      <p className="text-[10px] text-muted-foreground">
                        {config.label}
                      </p>

                      {log.base_amount !== log.amount && (
                        <p className="text-[9px] text-muted-foreground">
                          base: {log.base_amount}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <span className="text-xs text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>

            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}