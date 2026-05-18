import React, { useState } from "react";
import { useDarkMode } from "@/hooks/useDarkMode";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, getDay,
  startOfWeek, endOfWeek, addWeeks, parseISO
} from "date-fns";
import { ChevronLeft, ChevronRight, X, CheckCircle2, Circle, Copy, Trash2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Light mode: bright yellow for active/goals
// Dark mode: purple (6B55C3) for active/goals
function getWeekStyle(completedCount, activeCount, isCurrentWeek, isDark) {
  const total = completedCount + activeCount;
  if (total === 0 && !isCurrentWeek) return null;

  const completedRgb = isDark ? "107,85,195" : "255,213,0";
  const currentWeekBg = isDark ? "rgba(107,85,195,0.08)" : "rgba(255,213,0,0.12)";
  const currentWeekBorder = isDark ? "rgba(107,85,195,0.25)" : "rgba(255,213,0,0.35)";

  if (completedCount === 0 && activeCount === 0 && isCurrentWeek) {
    return { background: currentWeekBg, border: `1px solid ${currentWeekBorder}` };
  }

  if (completedCount === 0) {
    if (activeCount === 1) return { background: `rgba(${completedRgb},0.25)`, border: `1px solid rgba(${completedRgb},0.45)` };
    if (activeCount === 2) return { background: `rgba(${completedRgb},0.42)`, border: `1px solid rgba(${completedRgb},0.62)` };
    if (activeCount === 3) return { background: `rgba(${completedRgb},0.58)`, border: `1px solid rgba(${completedRgb},0.78)` };
    return { background: `rgba(${completedRgb},0.75)`, border: `1px solid rgba(${completedRgb},0.95)` };
  }

  if (activeCount === 0) {
    if (completedCount === 1) return { background: `rgba(${completedRgb},${isDark ? "0.35" : "0.7"})`, border: `1px solid rgba(${completedRgb},${isDark ? "0.55" : "0.6"})` };
    if (completedCount === 2) return { background: `rgba(${completedRgb},${isDark ? "0.52" : "0.85"})`, border: `1px solid rgba(${completedRgb},${isDark ? "0.72" : "0.75"})` };
    if (completedCount === 3) return { background: `rgba(${completedRgb},${isDark ? "0.68" : "0.6"})`, border: `1px solid rgba(${completedRgb},${isDark ? "0.85" : "0.8"})` };
    return { background: `rgba(${completedRgb},${isDark ? "0.82" : "0.8"})`, border: `1px solid rgba(${completedRgb},${isDark ? "1" : "0.95"})` };
  }

  const ratio = completedCount / total;
  const splitPct = Math.round((1 - ratio) * 100);
  return {
    background: `linear-gradient(135deg, rgba(${completedRgb},0.5) 0%, rgba(${completedRgb},0.5) ${splitPct}%, rgba(${completedRgb},0.55) ${splitPct}%, rgba(${completedRgb},0.55) 100%)`,
    border: `1px solid rgba(${completedRgb},0.5)`
  };
}

export default function WeeklyCalendarView({ goals = [], onComplete, onDelete, onCopy }) {
  const isDark = useDarkMode();
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedWeekStart, setSelectedWeekStart] = useState(null);
  const [copiedGoalId, setCopiedGoalId] = useState(null);

  const today = format(new Date(), "yyyy-MM-dd");
  const currentWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 0 }), "yyyy-MM-dd");

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startOffset = getDay(monthStart);

  const prevMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const goalsForWeek = (weekStartStr) => {
    const ws = new Date(weekStartStr + "T00:00:00");
    const we = endOfWeek(ws, { weekStartsOn: 0 });
    return goals.filter(g => {
      if (g.status === "completed" && g.completed_date) {
        const cd = new Date(g.completed_date + "T00:00:00");
        return cd >= ws && cd <= we;
      }
      if (g.status === "active") {
        const anchor = g.due_date
          ? format(startOfWeek(parseISO(g.due_date), { weekStartsOn: 0 }), "yyyy-MM-dd")
          : currentWeekStart;
        return anchor === weekStartStr;
      }
      return false;
    });
  };

  // Count per week-start
  const activeCountByWeek = {};
  const completedCountByWeek = {};
  goals.forEach(g => {
    if (g.status === "active") {
      const ws = g.due_date
        ? format(startOfWeek(parseISO(g.due_date), { weekStartsOn: 0 }), "yyyy-MM-dd")
        : currentWeekStart;
      activeCountByWeek[ws] = (activeCountByWeek[ws] || 0) + 1;
    } else if (g.status === "completed" && g.completed_date) {
      const ws = format(startOfWeek(new Date(g.completed_date + "T00:00:00"), { weekStartsOn: 0 }), "yyyy-MM-dd");
      completedCountByWeek[ws] = (completedCountByWeek[ws] || 0) + 1;
    }
  });

  // Set of specific due_dates for active goals (to highlight exact day logged)
  const activeDueDates = new Set(
    goals.filter(g => g.status === "active" && g.due_date).map(g => g.due_date)
  );
  // Set of completed_dates
  const completedDueDates = new Set(
    goals.filter(g => g.status === "completed" && g.completed_date).map(g => g.completed_date)
  );

  const getWeekStart = (day) => format(startOfWeek(day, { weekStartsOn: 0 }), "yyyy-MM-dd");

  const handleDayClick = (day) => {
    const ws = getWeekStart(day);
    setSelectedWeekStart(prev => prev === ws ? null : ws);
  };

  const selectedGoals = selectedWeekStart ? goalsForWeek(selectedWeekStart) : [];

  const triggerCopyFeedback = (goalId) => {
    setCopiedGoalId(goalId);
    setTimeout(() => setCopiedGoalId(null), 1800);
  };

  const handleCopyNextWeek = (goal) => {
    const anchor = goal.due_date || today;
    const nextWeekDate = format(addWeeks(parseISO(anchor), 1), "yyyy-MM-dd");
    onCopy(goal, nextWeekDate);
    triggerCopyFeedback(goal.id);
    toast.success("Copied to next week!", { icon: "📋" });
  };

  return (
    <div className="space-y-3">
      {/* Month header */}
      <div className="flex items-center justify-between">
        <span className="font-display font-semibold text-sm">{format(viewDate, "MMMM yyyy")}</span>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-1 rounded hover:bg-muted transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={nextMonth} className="p-1 rounded hover:bg-muted transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
          <div key={`label-${i}`} className={cn(
            "text-center text-[10px] font-medium py-0.5",
            i === 0 ? "text-primary font-bold" : "text-muted-foreground"
          )}>{d[0]}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startOffset }).map((_, i) => <div key={`off-${i}`} />)}
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isToday = dateStr === today;
          const ws = getWeekStart(day);
          const isCurrentWeek = ws === currentWeekStart;
          const isSelectedWeek = selectedWeekStart === ws;
          const activeCount = activeCountByWeek[ws] || 0;
          const completedCount = completedCountByWeek[ws] || 0;

          // Is this specific date a goal's logged/due date?
          const isGoalDate = activeDueDates.has(dateStr) || completedDueDates.has(dateStr);

          const weekStyle = getWeekStyle(completedCount, activeCount, isCurrentWeek, isDark);
          const hasAny = activeCount + completedCount > 0 || isCurrentWeek;

          const isTodayDarkMode = isToday && isDark;
          return (
            <button
              key={dateStr}
              onClick={() => handleDayClick(day)}
              style={
                isToday
                  ? isTodayDarkMode
                    ? { background: "linear-gradient(135deg, rgb(107,85,195) 0%, rgb(147,125,235) 100%)" }
                    : { background: "linear-gradient(135deg, hsl(143,64%,24%) 0%, hsl(143,64%,38%) 100%)" }
                  : weekStyle || {}
              }
              className={cn(
                "aspect-square rounded-md flex items-center justify-center text-[10px] font-medium transition-all cursor-pointer relative",
                isToday && "text-white shadow-md",
                !isToday && !hasAny && "bg-muted/30 text-muted-foreground/50 hover:bg-muted/50",
                !isToday && hasAny && "text-foreground",
                isSelectedWeek && !isToday && "ring-2 ring-accent ring-offset-1",
                isToday && isSelectedWeek && "ring-2 ring-accent ring-offset-1"
              )}
            >
              {format(day, "d")}
              {/* Dot indicator for specific goal dates */}
              {isGoalDate && !isToday && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary/70" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 pt-1 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ background: isDark ? "rgba(107,85,195,0.45)" : "rgba(255,213,0,0.45)", border: isDark ? "1px solid rgba(107,85,195,0.65)" : "1px solid rgba(255,213,0,0.65)" }} />
          <span className="text-xs text-muted-foreground">Goals</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-primary/70" />
          <span className="text-xs text-muted-foreground">Done</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/70 inline-block" />
          <span className="text-xs text-muted-foreground">Goal Date</span>
        </div>
        <span className="text-xs text-muted-foreground ml-auto">Tap any day</span>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedWeekStart && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="border rounded-xl overflow-hidden"
          >
            <div className="px-4 py-3 flex items-center justify-between bg-primary/5 border-b">
              <span className="font-display font-semibold text-sm">
                Week of {format(new Date(selectedWeekStart + "T00:00:00"), "MMMM d")}
                {" – "}
                {format(endOfWeek(new Date(selectedWeekStart + "T00:00:00"), { weekStartsOn: 0 }), "MMMM d")}
              </span>
              <button onClick={() => setSelectedWeekStart(null)} className="p-1 rounded hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="bg-card divide-y max-h-80 overflow-y-auto">
              {selectedGoals.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-6">No goals for this week.</p>
              ) : (
                selectedGoals.map(goal => {
                  const isDone = goal.status === "completed";
                  return (
                    <div key={goal.id} className="px-4 py-3 space-y-2">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => !isDone && onComplete(goal)}
                          disabled={isDone}
                          className="shrink-0"
                        >
                          {isDone
                            ? <CheckCircle2 className="w-5 h-5 text-primary" />
                            : <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                          }
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-medium", isDone && "line-through text-muted-foreground")}>
                            {goal.title}
                          </p>
                          {goal.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{goal.description}</p>
                          )}
                          {goal.xp_reward && (
                            <p className="text-[10px] text-accent font-semibold mt-0.5">+{goal.xp_reward} XP</p>
                          )}
                          {goal.due_date && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Due: {format(parseISO(goal.due_date), "EEE, MMM d")}
                            </p>
                          )}
                        </div>
                        {onDelete && (
                          <button
                            onClick={() => onDelete(goal)}
                            className="shrink-0 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {onCopy && !isDone && (
                        <div className="pl-8">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[10px] h-6 px-2 gap-1"
                            onClick={() => handleCopyNextWeek(goal)}
                          >
                            {copiedGoalId === goal.id ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
                            Copy to next week
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}