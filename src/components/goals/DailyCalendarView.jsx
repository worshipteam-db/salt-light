import React, { useState } from "react";
import { useDarkMode } from "@/hooks/useDarkMode";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, getDay,
  addDays, endOfWeek, isAfter, parseISO
} from "date-fns";
import { ChevronLeft, ChevronRight, X, CheckCircle2, Circle, Copy, Trash2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Light mode: green (active) → bright yellow (goals)
// Dark mode:  purple (active) → purple (goals with varying intensity)
function getDayStyle(completedCount, activeCount, isToday, isDark) {
  const isGreen = !isDark;
  
  if (isToday) {
    return isGreen 
      ? { background: "linear-gradient(135deg, hsl(143,64%,24%) 0%, hsl(143,64%,38%) 100%)" }
      : { background: "linear-gradient(135deg, rgb(107,85,195) 0%, rgb(147,125,235) 100%)" };
  }

  const total = completedCount + activeCount;
  if (total === 0) return null;

  // Active goals colors: bright yellow (light) or purple (dark)
  const activeShades = isDark ? [
    null,
    { background: "rgba(107,85,195,0.28)", border: "1px solid rgba(107,85,195,0.48)" },
    { background: "rgba(107,85,195,0.46)", border: "1px solid rgba(107,85,195,0.66)" },
    { background: "rgba(107,85,195,0.62)", border: "1px solid rgba(107,85,195,0.82)" },
    { background: "rgba(107,85,195,0.78)", border: "1px solid rgba(107,85,195,0.98)" },
  ] : [
    null,
    { background: "rgba(255,213,0,0.28)", border: "1px solid rgba(255,213,0,0.48)" },
    { background: "rgba(255,213,0,0.46)", border: "1px solid rgba(255,213,0,0.66)" },
    { background: "rgba(255,213,0,0.62)", border: "1px solid rgba(255,213,0,0.82)" },
    { background: "rgba(255,213,0,0.78)", border: "1px solid rgba(255,213,0,0.98)" },
  ];

  // Completed/goals shades — bright yellow (light) or purple (dark)
  const completedShades = isDark ? [
    null,
    { background: "rgba(107,85,195,0.35)", border: "1px solid rgba(107,85,195,0.55)" },
    { background: "rgba(107,85,195,0.52)", border: "1px solid rgba(107,85,195,0.72)" },
    { background: "rgba(107,85,195,0.68)", border: "1px solid rgba(107,85,195,0.85)" },
    { background: "rgba(107,85,195,0.84)", border: "1px solid rgba(107,85,195,1)" },
  ] : [
    null,
    { background: "rgba(255,213,0,0.7)", border: "1px solid rgba(255,213,0,0.6)" },
    { background: "rgba(255,213,0,0.85)", border: "1px solid rgba(255,213,0,0.75)" },
    { background: "rgba(255,213,0,0.6)", border: "1px solid rgba(255,213,0,0.8)" },
    { background: "rgba(255,213,0,0.8)", border: "1px solid rgba(255,213,0,0.95)" },
  ];

  const completedRgb = isDark ? "107,85,195" : "255,213,0";

  if (completedCount === 0) return activeShades[Math.min(activeCount, 4)];
  if (activeCount === 0) return completedShades[Math.min(completedCount, 4)];

  // Mixed gradient
  const ratio = completedCount / total;
  const splitPct = Math.round((1 - ratio) * 100);
  return {
    background: `linear-gradient(135deg, rgba(161,98,7,0.5) 0%, rgba(161,98,7,0.5) ${splitPct}%, rgba(${completedRgb},0.55) ${splitPct}%, rgba(${completedRgb},0.55) 100%)`,
    border: `1px solid rgba(${completedRgb},0.5)`
  };
}

function getActiveIntensityStyle(count, isDark) {
  if (count === 0) return null;
  const rgb = isDark ? "107,85,195" : "255,213,0";
  if (count === 1) return { background: `rgba(${rgb},0.25)`, border: `1px solid rgba(${rgb},0.45)` };
  if (count === 2) return { background: `rgba(${rgb},0.42)`, border: `1px solid rgba(${rgb},0.62)` };
  if (count === 3) return { background: `rgba(${rgb},0.58)`, border: `1px solid rgba(${rgb},0.78)` };
  return { background: `rgba(${rgb},0.75)`, border: `1px solid rgba(${rgb},0.95)` };
}

export default function DailyCalendarView({ goals = [], onComplete, onDelete, onCopy }) {
  const isDark = useDarkMode();
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [copiedGoalId, setCopiedGoalId] = useState(null);

  const today = format(new Date(), "yyyy-MM-dd");
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startOffset = getDay(monthStart);

  const goalsForDate = (dateStr) =>
    goals.filter(g => {
      if (g.status === "completed") return g.completed_date === dateStr;
      if (g.status === "active") return (g.due_date || today) === dateStr;
      return false;
    });

  // Count active and completed goals per date
  const activeCountByDate = {};
  const completedCountByDate = {};
  goals.forEach(g => {
    if (g.status === "active") {
      const d = g.due_date || today;
      activeCountByDate[d] = (activeCountByDate[d] || 0) + 1;
    } else if (g.status === "completed" && g.completed_date) {
      const d = g.completed_date;
      completedCountByDate[d] = (completedCountByDate[d] || 0) + 1;
    }
  });

  const completedDates = new Set(Object.keys(completedCountByDate));

  const prevMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const handleDayClick = (dateStr) => setSelectedDate(prev => prev === dateStr ? null : dateStr);

  const selectedGoals = selectedDate ? goalsForDate(selectedDate) : [];

  const triggerCopyFeedback = (goalId) => {
    setCopiedGoalId(goalId);
    setTimeout(() => setCopiedGoalId(null), 1800);
  };

  const handleCopyNextDay = (goal) => {
    const anchor = goal.due_date || today;
    const nextDay = format(addDays(parseISO(anchor), 1), "yyyy-MM-dd");
    onCopy(goal, [nextDay]);
    triggerCopyFeedback(goal.id + "_next");
    toast.success("Copied to next day!", { icon: "📋" });
  };

  const handleCopyWeek = (goal) => {
    const anchor = goal.due_date || today;
    const anchorDate = parseISO(anchor);
    const weekEnd = endOfWeek(anchorDate, { weekStartsOn: 1 });
    const dates = [];
    let d = addDays(anchorDate, 1);
    while (!isAfter(d, weekEnd)) { dates.push(format(d, "yyyy-MM-dd")); d = addDays(d, 1); }
    if (dates.length > 0) {
      onCopy(goal, dates);
      triggerCopyFeedback(goal.id + "_week");
      toast.success(`Copied to ${dates.length} more day${dates.length > 1 ? "s" : ""} this week!`, { icon: "📋" });
    }
  };

  const handleCopyMonth = (goal) => {
    const anchor = goal.due_date || today;
    const anchorDate = parseISO(anchor);
    const mEnd = endOfMonth(anchorDate);
    const dates = [];
    let d = addDays(anchorDate, 1);
    while (!isAfter(d, mEnd)) { dates.push(format(d, "yyyy-MM-dd")); d = addDays(d, 1); }
    if (dates.length > 0) {
      onCopy(goal, dates);
      triggerCopyFeedback(goal.id + "_month");
      toast.success(`Copied to ${dates.length} remaining days this month!`, { icon: "📋" });
    }
  };

  return (
    <div className="mx-auto w-full max-w-[620px] px-2 sm:px-4 space-y-3">
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
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
          <div key={`label-${i}`} className="text-center text-[10px] text-muted-foreground font-medium py-0.5">{d[0]}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {Array.from({ length: startOffset }).map((_, i) => <div key={`off-${i}`} />)}
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isToday = dateStr === today;
          const activeCount = activeCountByDate[dateStr] || 0;
          const completedCount = completedCountByDate[dateStr] || 0;
          const hasAny = activeCount + completedCount > 0;
          const isSelected = selectedDate === dateStr;
          const dayStyle = getDayStyle(completedCount, activeCount, isToday, isDark);

          return (
            <button
              key={dateStr}
              onClick={() => handleDayClick(dateStr)}
              style={dayStyle || {}}
              className={cn(
                "aspect-square rounded-md flex items-center justify-center text-[10px] font-medium transition-all relative cursor-pointer",
                isToday && "text-white shadow-md",
                !isToday && !hasAny && "bg-muted/30 text-muted-foreground/50 hover:bg-muted/50",
                !isToday && hasAny && "text-foreground",
                isSelected && "ring-2 ring-accent ring-offset-1"
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 pt-1 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-primary" />
          <span className="text-xs text-muted-foreground">Done</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Activity:</span>
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="w-3 h-3 rounded" style={getActiveIntensityStyle(n, isDark)} />
          ))}
        </div>
        <span className="text-xs text-muted-foreground ml-auto">Tap any day</span>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="border rounded-xl overflow-hidden"
          >
            <div className="px-4 py-3 flex items-center justify-between bg-primary/5 border-b">
              <span className="font-display font-semibold text-sm">
                {format(new Date(selectedDate + "T00:00:00"), "EEEE, MMMM d")}
              </span>
              <button onClick={() => setSelectedDate(null)} className="p-1 rounded hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="bg-card divide-y max-h-80 overflow-y-auto">
              {selectedGoals.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-6">No goals for this day.</p>
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
                        </div>
                        {/* Delete button */}
                        {onDelete && (
                          <button
                            onClick={() => { onDelete(goal); }}
                            className="shrink-0 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {/* Copy actions */}
                      {onCopy && !isDone && (
                        <div className="flex gap-2 pl-8 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[10px] h-6 px-2 gap-1"
                            onClick={() => handleCopyNextDay(goal)}
                          >
                            {copiedGoalId === goal.id + "_next" ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
                            Next day
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[10px] h-6 px-2 gap-1"
                            onClick={() => handleCopyWeek(goal)}
                          >
                            {copiedGoalId === goal.id + "_week" ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
                            Rest of week
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[10px] h-6 px-2 gap-1"
                            onClick={() => handleCopyMonth(goal)}
                          >
                            {copiedGoalId === goal.id + "_month" ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
                            Rest of month
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