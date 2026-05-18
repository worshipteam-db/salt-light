import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EQUIPMENT, EQUIPMENT_TIERS, getJobById } from "@/lib/gameData";
import { Lock, Check, Zap, Star, ShoppingCart, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MAX_EQUIPPED = 6;

const TYPE_COLORS = {
  weapon:    "from-red-500/10 to-orange-500/10 border-red-200",
  helmet:    "from-blue-500/10 to-sky-500/10 border-blue-200",
  armor:     "from-slate-500/10 to-gray-500/10 border-slate-200",
  cape:      "from-purple-500/10 to-violet-500/10 border-purple-200",
  shield:    "from-green-500/10 to-emerald-500/10 border-green-200",
  accessory: "from-yellow-500/10 to-amber-500/10 border-yellow-200",
  offhand:   "from-teal-500/10 to-cyan-500/10 border-teal-200",
  boots:     "from-indigo-500/10 to-blue-500/10 border-indigo-200",
  gloves:    "from-rose-500/10 to-pink-500/10 border-rose-200",
};

function ItemCard({ item, character, onEquip, onBuy }) {
  const level = character?.level || 1;
  const unlocked = character?.unlocked_items || [];
  const equipped = character?.equipped_items || [];
  const faith = character?.faith || 0;
  const totalXP = character?.total_xp || 0;
  const equippedCount = equipped.length;
  const currentJobId = character?.current_job || "seeker";

  const isPurchased = unlocked.includes(item.id);
  const isFree = item.xpCost === 0 && item.faithCost === 0;
  const isAvailableLevel = level >= item.requiredLevel;
  const isEquipped = equipped.includes(item.id);

  // Job restriction check
  const jobAllowed = !item.requiredJob || item.requiredJob.includes(currentJobId);
  const canAfford = () => {
    if (item.costType === "xp") return totalXP >= item.xpCost;
    if (item.costType === "faith") return faith >= item.faithCost;
    if (item.costType === "both") return totalXP >= item.xpCost && faith >= item.faithCost;
    return true;
  };

  const affordable = canAfford();
  const canEquip = (isPurchased || (isFree && isAvailableLevel)) && jobAllowed;
  const isLocked = !isAvailableLevel || !jobAllowed;

  const handleBuy = () => {
    if (!affordable) { toast.error("Not enough resources!"); return; }
    if (!jobAllowed) { toast.error(`Only ${item.requiredJob?.join(", ")} can equip this!`); return; }
    onBuy({ itemId: item.id, xpCost: item.xpCost || 0, faithCost: item.faithCost || 0, itemName: item.name });
    toast.success(`${item.name} unlocked!`);
  };

  const handleEquip = () => {
    if (!jobAllowed) { toast.error(`This item is restricted to certain classes.`); return; }
    if (equipped.includes(item.id)) {
      onEquip(item.id);
    } else if (equippedCount >= MAX_EQUIPPED) {
      toast.error(`Max ${MAX_EQUIPPED} items equipped. Unequip one first.`);
    } else {
      onEquip(item.id);
    }
  };

  return (
    <div className={cn(
      "relative rounded-xl border-2 p-3 flex flex-col gap-2 transition-all",
      isEquipped
        ? "border-accent bg-accent/10 shadow-md shadow-accent/10"
        : canEquip
        ? cn("bg-gradient-to-br border", TYPE_COLORS[item.type] || "border-border")
        : isAvailableLevel && !jobAllowed
        ? "border-dashed border-orange-300 bg-orange-50/30"
        : isAvailableLevel
        ? "border-dashed border-border bg-muted/30"
        : "border-border/40 bg-muted/20 opacity-50"
    )}>
      {/* Top-right badge: equipped or locked */}
      <div className="absolute top-2 right-2 flex gap-1">
        {isEquipped && (
          <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
            <Check className="w-3 h-3 text-accent-foreground" />
          </div>
        )}
        {!isAvailableLevel && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
      </div>

      {/* Job restriction label — with warning icon inline when wrong class */}
      {item.requiredJob && (
        <div className="flex items-center justify-center gap-1">
          {isAvailableLevel && !jobAllowed && (
            <span className="text-orange-500 text-[11px] leading-none">⚠</span>
          )}
          <div className="text-[9px] text-orange-600 bg-orange-50 border border-orange-200 rounded px-1.5 py-0.5 text-center leading-tight">
            {item.requiredJob.join(" / ")}
          </div>
        </div>
      )}

      {/* Icon & name */}
      <div className="text-center">
        <span className="text-2xl">{item.icon}</span>
        <p className="font-display text-xs font-semibold mt-1 leading-tight">{item.name}</p>
        <Badge variant="outline" className="text-[9px] capitalize mt-0.5 px-1 py-0">{item.type}</Badge>
      </div>

      {/* Passive */}
      {item.passive && (
        <p className={cn(
          "text-[10px] text-center leading-tight rounded-md px-1.5 py-1",
          isEquipped ? "bg-accent/20 text-accent-foreground font-medium" : "text-muted-foreground bg-muted/50"
        )}>
          {isEquipped ? "✨ " : ""}{item.passive}
        </p>
      )}

      {/* Action */}
      <div className="mt-auto">
        {!isAvailableLevel ? (
          <p className="text-[10px] text-center text-muted-foreground">Lv. {item.requiredLevel}</p>
        ) : !jobAllowed ? (
          <p className="text-[10px] text-center text-orange-500">Wrong class</p>
        ) : canEquip ? (
          <Button
            size="sm"
            variant={isEquipped ? "default" : "outline"}
            className="w-full h-7 text-[11px]"
            onClick={handleEquip}
          >
            {isEquipped ? "Unequip" : equippedCount >= MAX_EQUIPPED ? "Slots Full" : "Equip"}
          </Button>
        ) : (
          <div className="space-y-1">
            <div className="flex gap-1 justify-center flex-wrap">
              {item.xpCost > 0 && (
                <span className={cn("text-[10px] font-medium", totalXP >= item.xpCost ? "text-chart-2" : "text-destructive")}>
                  ⚡ {item.xpCost} XP
                </span>
              )}
              {item.faithCost > 0 && (
                <span className={cn("text-[10px] font-medium", faith >= item.faithCost ? "text-primary" : "text-destructive")}>
                  ✨ {item.faithCost} Faith
                </span>
              )}
            </div>
            <Button
              size="sm"
              className="w-full h-7 text-[10px] px-1 truncate"
              disabled={!affordable}
              onClick={handleBuy}
            >
              <ShoppingCart className="w-3 h-3 shrink-0 mr-1" />
              <span className="truncate">{affordable ? "Buy" : "Can't Afford"}</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EquipmentGrid({ character, onEquip, onBuy }) {
  const level = character?.level || 1;
  const unlocked = character?.unlocked_items || [];
  const equipped = character?.equipped_items || [];
  const faith = character?.faith || 0;
  const totalXP = character?.total_xp || 0;
  const equippedCount = equipped.length;

  // Track which tiers are expanded
  const [expandedTiers, setExpandedTiers] = useState(() => {
    const initial = {};
    EQUIPMENT_TIERS.forEach((t, i) => { initial[i] = i === 0; });
    return initial;
  });

  const toggleTier = (i) => {
    setExpandedTiers(prev => ({ ...prev, [i]: !prev[i] }));
  };

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-3 text-sm">
          <span className="flex items-center gap-1 font-medium">
            <Check className="w-3.5 h-3.5 text-accent" />
            <span className="font-display font-bold">{equippedCount}/{MAX_EQUIPPED}</span>
            <span className="text-muted-foreground text-xs">equipped</span>
          </span>
          <span className="flex items-center gap-1 font-medium">
            <Star className="w-3.5 h-3.5 text-primary" />
            <span className="font-display font-bold">{unlocked.length}</span>
            <span className="text-muted-foreground text-xs">owned</span>
          </span>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Zap className="w-3 h-3 text-chart-2" />{totalXP} XP
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            ✨ {faith} Faith
          </span>
        </div>
      </div>

      {/* Tier groups */}
      {EQUIPMENT_TIERS.map((tier, tierIdx) => {
        const tierItems = EQUIPMENT.filter(e => e.requiredLevel >= tier.minLevel && e.requiredLevel <= tier.maxLevel);
        const playerTierIndex = EQUIPMENT_TIERS.findIndex(t => level >= t.minLevel && level <= t.maxLevel);
        const isAccessible = tierIdx <= playerTierIndex;
        const isExpanded = expandedTiers[tierIdx];
        // Count owned: free items (no cost) count as owned when level is sufficient, paid items need purchase
        const ownedInTier = tierItems.filter(e => {
          const isFree = e.xpCost === 0 && e.faithCost === 0;
          if (isFree) return level >= e.requiredLevel;
          return unlocked.includes(e.id);
        }).length;

        // Hide tiers above current player tier
        if (!isAccessible) {
          return (
            <div key={tier.label} className="border border-dashed border-border/40 rounded-xl p-3 opacity-40">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <span className="font-display text-sm font-semibold text-muted-foreground">{tier.label}</span>
                <span className="text-xs text-muted-foreground ml-auto">Requires Lv. {tier.minLevel}</span>
              </div>
            </div>
          );
        }

        return (
          <div key={tier.label} className="border rounded-xl overflow-hidden">
            {/* Tier header — clickable */}
            <button
              onClick={() => toggleTier(tierIdx)}
              className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                {isExpanded ? <ChevronDown className="w-4 h-4 text-primary" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                <span className="font-display font-semibold text-sm">{tier.label}</span>
                <span className="text-xs text-muted-foreground">Lv. {tier.minLevel}–{tier.maxLevel}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">{ownedInTier}/{tierItems.length} owned</span>
                {equipped.some(id => tierItems.find(e => e.id === id)) && (
                  <span className="bg-accent/20 text-accent-foreground rounded px-1.5 py-0.5 font-medium">Active</span>
                )}
              </div>
            </button>

            {/* Tier items */}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {tierItems.map(item => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        character={character}
                        onEquip={onEquip}
                        onBuy={onBuy}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}