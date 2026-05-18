const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const PAGE_SIZE = 20;

const ACTION_LABELS = {
  xp_gained: { label: "XP Gained", color: "text-chart-2", bg: "bg-chart-2/10" },
  faith_gained: { label: "Faith Gained", color: "text-primary", bg: "bg-primary/10" },
  faith_spent: { label: "Faith Spent", color: "text-destructive", bg: "bg-destructive/10" },
  xp_spent: { label: "XP Spent", color: "text-destructive", bg: "bg-destructive/10" },
  item_purchased: { label: "Item Purchased", color: "text-accent", bg: "bg-accent/10" },
};

export default function ActivityLog() {
  const [page, setPage] = useState(0);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["activity_logs"],
    queryFn: async () => {
      const user = await db.auth.me();
      return db.entities.ActivityLog.filter({ created_by: user.email }, "-created_date", 200);
    },
  });

  const totalPages = Math.ceil(logs.length / PAGE_SIZE);
  const pageLogs = logs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (isLoading) return null;
  if (logs.length === 0) return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-base flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground text-center py-6">No activity yet. Complete goals or devotions to see logs here.</p>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="font-display text-base flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> Recent Activity
        </CardTitle>
        <span className="text-xs text-muted-foreground">{logs.length} entries</span>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {pageLogs.map((log, i) => {
            const config = ACTION_LABELS[log.action_type] || { label: log.action_type, color: "text-foreground", bg: "bg-muted" };
            const isNegative = log.amount < 0 || log.action_type.includes("spent");
            const isLevelUp = log.icon === "🎉" && log.source?.startsWith("Level Up!");
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-start gap-3 px-4 py-2.5"
              >
                {/* Icon */}
                <div className={`w-7 h-7 rounded-lg ${config.bg} flex items-center justify-center shrink-0 text-sm`}>
                  {log.icon || "⚡"}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{log.source}</p>
                  {log.modifiers && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{log.modifiers}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {log.created_date ? format(new Date(log.created_date), "MMM d, h:mm a") : ""}
                  </p>
                </div>
                {/* Amount */}
                <div className="shrink-0 text-right">
                  {isLevelUp ? (
                    <>
                      <span className="text-sm font-display font-bold text-chart-3">
                        +{log.amount} SP
                      </span>
                      <p className="text-[10px] text-muted-foreground">Skill Points</p>
                    </>
                  ) : (
                    <>
                      <span className={`text-sm font-display font-bold ${isNegative ? "text-destructive" : config.color}`}>
                        {isNegative ? "" : "+"}{log.amount}
                      </span>
                      <p className="text-[10px] text-muted-foreground">{config.label}</p>
                      {log.base_amount !== log.amount && (
                        <p className="text-[9px] text-muted-foreground">base: {log.base_amount}</p>
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
              variant="ghost" size="sm"
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</span>
            <Button
              variant="ghost" size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}