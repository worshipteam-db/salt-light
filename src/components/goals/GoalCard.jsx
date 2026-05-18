import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Sparkles, Calendar, Trash2, Pencil, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const timeframeConfig = {
  daily: { label: "Daily", color: "bg-chart-5/10 text-chart-5 border-chart-5/20" },
  weekly: { label: "Weekly", color: "bg-primary/10 text-primary border-primary/20" },
  long_term: { label: "Elite", color: "bg-chart-2/10 text-chart-2 border-chart-2/20" },
  boss_fight: { label: "⚔️ Boss Fight", color: "bg-destructive/10 text-destructive border-destructive/20" },
};

export default function GoalCard({ goal, onComplete, onDelete, onEdit, onCopy, index = 0 }) {
  const [copiedId, setCopiedId] = React.useState(null);
  const config = timeframeConfig[goal.timeframe] || timeframeConfig.daily;
  const isCompleted = goal.status === "completed";

  const triggerCopyFeedback = () => {
    setCopiedId(true);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        "group relative flex items-start gap-3 p-4 rounded-xl border bg-card transition-all",
        isCompleted ? "opacity-60 border-border/50" : "hover:shadow-md hover:border-primary/20"
      )}
    >
      <button
        onClick={() => !isCompleted && onComplete(goal)}
        disabled={isCompleted}
        className="mt-0.5 flex-shrink-0"
      >
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-chart-2" />
        ) : (
          <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium text-sm",
          isCompleted && "line-through text-muted-foreground"
        )}>
          {goal.title}
        </p>
        {goal.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{goal.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <Badge variant="outline" className={cn("text-[10px] px-2 py-0 border", config.color)}>
            {config.label}
          </Badge>
          {goal.xp_reward && (
            <span className="text-[10px] text-accent font-semibold flex items-center gap-0.5">
              <Sparkles className="w-3 h-3" /> +{goal.xp_reward} XP
            </span>
          )}
          {goal.due_date && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <Calendar className="w-3 h-3" /> {format(new Date(goal.due_date), "MMM d")}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && !isCompleted && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(goal)}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
        )}
        {onCopy && !isCompleted && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-primary"
            onClick={() => {
              onCopy(goal);
              triggerCopyFeedback();
            }}
          >
            {copiedId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(goal)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}