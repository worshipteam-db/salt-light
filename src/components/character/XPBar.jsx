import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function XPBar({ currentXP, neededXP, level }) {
  const pct = Math.min((currentXP / neededXP) * 100, 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-display font-semibold text-primary flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Level {level}
        </span>
        <span className="text-muted-foreground">{currentXP} / {neededXP} XP</span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden relative">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
      </div>
    </div>
  );
}