import React from "react";
import { motion } from "framer-motion";
import { getTitle, EQUIPMENT, getJobById } from "@/lib/gameData";

const MAX_EQUIPPED = 6;

export default function CharacterAvatar({ character, size = "lg" }) {
  const level = character?.level || 1;
  const title = getTitle(level);
  const equipped = character?.equipped_items || [];
  const equippedItems = EQUIPMENT.filter(e => equipped.includes(e.id));
  const currentJob = getJobById(character?.current_job || "seeker");

  const sizeClasses = size === "lg" ? "w-28 h-28" : "w-16 h-16";
  const mainIconSize = size === "lg" ? "text-5xl" : "text-2xl";

  // 6 slots: 3 on left, 3 on right
  const slots = Array.from({ length: MAX_EQUIPPED });
  const leftSlots = slots.slice(0, 3);
  const rightSlots = slots.slice(3, 6);

  const getSlotItem = (slotIndex) => equippedItems[slotIndex] || null;

  const SlotDot = ({ slotIndex }) => {
    const item = getSlotItem(slotIndex);
    return (
      <div className={`w-7 h-7 rounded-lg border flex items-center justify-center text-sm transition-all
        ${item
          ? "bg-accent/20 border-accent/60 shadow-sm"
          : "bg-muted/40 border-border/40 border-dashed"
        }`}
      >
        {item ? item.icon : ""}
      </div>
    );
  };

  if (size !== "lg") {
    return (
      <div className="flex flex-col items-center gap-2">
        <motion.div
          className={`${sizeClasses} rounded-xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 border-2 border-primary/20 flex items-center justify-center`}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <span className={mainIconSize}>{currentJob.icon}</span>
        </motion.div>
        <div className="text-center">
          <p className="font-display font-bold text-foreground text-sm">{character?.name || "Hero"}</p>
          <p className="text-[10px] text-accent font-semibold uppercase tracking-wider">{title}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar with equipment slots on both sides */}
      <div className="flex items-center gap-2">
        {/* Left slots */}
        <div className="flex flex-col gap-1.5">
          {leftSlots.map((_, i) => <SlotDot key={i} slotIndex={i} />)}
        </div>

        {/* Main avatar */}
        <motion.div
          className={`${sizeClasses} rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 border-2 border-primary/20 flex items-center justify-center relative overflow-hidden`}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
          <span className={mainIconSize}>{currentJob.icon}</span>
          {/* Job name label */}
          <div className="absolute top-1.5 left-0 right-0 flex justify-center">
            <div className="bg-background/80 backdrop-blur-sm rounded-full px-1.5 py-0.5 text-[8px] font-semibold border border-border/50 text-foreground leading-none">
              {currentJob.name}
            </div>
          </div>
        </motion.div>

        {/* Right slots */}
        <div className="flex flex-col gap-1.5">
          {rightSlots.map((_, i) => <SlotDot key={i + 3} slotIndex={i + 3} />)}
        </div>
      </div>

      <div className="text-center">
        <p className="font-display font-bold text-foreground">{character?.name || "Hero"}</p>
        <p className="text-xs text-accent font-semibold uppercase tracking-wider">{title}</p>
      </div>
    </div>
  );
}