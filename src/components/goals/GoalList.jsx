import React from "react";
import GoalCard from "./GoalCard";
import { AnimatePresence } from "framer-motion";
import { Target } from "lucide-react";

export default function GoalList({ goals, onComplete, onDelete, onEdit, onCopy, emptyMessage = "No goals yet" }) {
  if (!goals || goals.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <Target className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {goals.map((goal, i) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            index={i}
            onComplete={onComplete}
            onDelete={onDelete}
            onEdit={onEdit}
            onCopy={onCopy}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}