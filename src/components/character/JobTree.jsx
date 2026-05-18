import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { JOB_TREE, getJobById } from "@/lib/gameData";
import { cn } from "@/lib/utils";
import { ChevronRight, Lock, CheckCircle2, HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const TIER_NAMES = ["Tier 0 (Lv 1)", "Tier 1 (Lv 5)", "Tier 2 (Lv 10)", "Tier 3 (Lv 20)", "Tier 4 (Lv 25)", "Tier 5 (Lv 35)", "Tier 6 (Lv 50)"];

export default function JobTree({ character, onChangeJob }) {
  const level = character?.level || 1;
  const currentJobId = character?.current_job || "seeker";
  const [showHelp, setShowHelp] = useState(false);

  const getJobAncestry = (jobId) => {
    const path = [];
    let current = jobId;
    while (current) {
      const job = JOB_TREE.find(j => j.id === current);
      path.unshift(job);
      current = job?.requiredJob;
    }
    return path;
  };

  const isJobAccessible = (job) => {
    // Current job is always accessible
    if (job.id === currentJobId) return true;

    // Get the path from current job to root
    const currentPath = getJobAncestry(currentJobId);
    const currentJobs = new Set(currentPath.map(j => j.id));

    // Get the path from target job to root
    const targetPath = getJobAncestry(job.id);

    // Check if all ancestors are accessible and level req is met
    for (const ancestor of targetPath) {
      if (ancestor.id === job.id) break; // Don't check the job itself
      if (!currentJobs.has(ancestor.id)) {
        // This ancestor is not on our path
        return false;
      }
    }

    return level >= job.requiredLevel;
  };

  const canChangeTo = (job) => {
    if (job.id === currentJobId) return false;
    return isJobAccessible(job) && level >= job.requiredLevel;
  };

  const handleChange = (job) => {
    if (!canChangeTo(job)) return;
    onChangeJob(job.id);
    toast.success(`Job changed to ${job.name}!`);
  };

  // Group all jobs by tier
  const tierGroups = {};
  JOB_TREE.forEach(job => {
    if (!tierGroups[job.tier]) tierGroups[job.tier] = [];
    tierGroups[job.tier].push(job);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Explore all job paths available to you.
        </p>
        <button
          onClick={() => setShowHelp(true)}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Job tree help"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Help Popup */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Job Tree Guide</DialogTitle>
            <DialogDescription>Complete progression paths for all jobs</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
              <p className="font-semibold text-foreground">Tier 0 (Lv 1)</p>
              <p className="text-xs text-muted-foreground">Seeker</p>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
              <p className="font-semibold text-foreground">Tier 1 (Lv 5)</p>
              <p className="text-xs text-muted-foreground">Warrior (→ Seeker) • Scholar (→ Seeker) • Devotee (→ Seeker)</p>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
              <p className="font-semibold text-foreground">Tier 2 (Lv 10)</p>
              <p className="text-xs text-muted-foreground">Knight (→ Warrior) • Berserker (→ Warrior) • Sage (→ Scholar) • Scribe (→ Scholar) • Priest (→ Devotee) • Paladin (→ Devotee)</p>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
              <p className="font-semibold text-foreground">Tier 3 (Lv 20)</p>
              <p className="text-xs text-muted-foreground">Legend (→ Knight) • Oracle (→ Sage) • Prophet (→ Priest)</p>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
              <p className="font-semibold text-foreground">Tier 4 (Lv 25)</p>
              <p className="text-xs text-muted-foreground">Dark Knight (→ Knight) • Blood Mage (→ Berserker) • Arch Sage (→ Oracle) • Sanctifier (→ Prophet)</p>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
              <p className="font-semibold text-foreground">Tier 5 (Lv 35)</p>
              <p className="text-xs text-muted-foreground">Shadow Lord (→ Dark Knight) • Blood Lord (→ Blood Mage) • Mystic (→ Arch Sage) • Ascended (→ Sanctifier)</p>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
              <p className="font-semibold text-foreground">Tier 6 (Lv 50)</p>
              <p className="text-xs text-muted-foreground">Void Master (→ Shadow Lord) • Crimson King (→ Blood Lord) • Cosmic Sage (→ Mystic) • Divine Sovereign (→ Ascended)</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* All Jobs by Tier */}
      {Object.keys(tierGroups)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map((tier) => {
          const tierNum = parseInt(tier);
          const jobs = tierGroups[tierNum];

          return (
            <div key={tier}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-display font-bold text-muted-foreground uppercase tracking-widest">
                  {TIER_NAMES[tierNum]}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {jobs.map((job, i) => {
                  const isCurrent = job.id === currentJobId;
                  const accessible = isJobAccessible(job);
                  const canChange = canChangeTo(job);
                  const reqJob = job.requiredJob ? getJobById(job.requiredJob) : null;

                  return (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "rounded-xl border-2 p-4 transition-all",
                        isCurrent
                          ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                          : canChange
                          ? "border-border bg-card hover:border-primary/40 cursor-pointer"
                          : "border-border/50 bg-muted/30 opacity-60"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className={cn("text-3xl shrink-0", !accessible && "opacity-50")}>{job.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-display font-bold text-sm">{job.name}</p>
                            {isCurrent && (
                              <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">
                                Current
                              </span>
                            )}
                            {!accessible && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 bg-muted/50 px-1.5 py-0.5 rounded">
                                <Lock className="w-3 h-3" /> Locked
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{job.description}</p>
                          
                          {/* Prerequisites */}
                          <div className="mt-2 space-y-1">
                            {reqJob && (
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <span className="text-[8px]">📋</span> Requires: <span className="font-medium">{reqJob.name}</span>
                              </p>
                            )}
                            {job.requiredLevel > 1 && (
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <span className="text-[8px]">⚡</span> Level {job.requiredLevel}+
                              </p>
                            )}
                          </div>

                          {/* Bonuses */}
                          <ul className="mt-2 space-y-0.5">
                            {job.bonuses.map((b, bi) => (
                              <li key={bi} className="text-[11px] flex items-start gap-1">
                                <CheckCircle2 className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                                <span className={isCurrent ? "text-foreground font-medium" : "text-muted-foreground"}>{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      {canChange && (
                        <Button
                          size="sm"
                          className="w-full mt-3 h-8 text-xs font-display"
                          onClick={() => handleChange(job)}
                        >
                          Switch to {job.name} <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
    </div>
  );
}