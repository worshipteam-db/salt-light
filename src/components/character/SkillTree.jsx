import React, { useState } from "react";
import { motion } from "framer-motion";
import { SKILLS, JOB_TREE, getJobById } from "@/lib/gameData";
import { cn } from "@/lib/utils";
import { Lock, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SkillTree({ character, onUnlockSkill }) {
  const currentJobId = character?.current_job || "seeker";
  const unlockedSkills = character?.unlocked_skills || [];
  const skillPoints = character?.skill_points || 0;
  const [viewJobId, setViewJobId] = useState(currentJobId);

  // Jobs the character has access to (current + ancestors)
  const accessibleJobIds = new Set();
  let cursor = currentJobId;
  while (cursor) {
    accessibleJobIds.add(cursor);
    const job = JOB_TREE.find((j) => j.id === cursor);
    cursor = job?.requiredJob || null;
  }
  const accessibleJobs = JOB_TREE.filter((j) => accessibleJobIds.has(j.id));

  const viewJob = getJobById(viewJobId);
  const jobSkills = SKILLS.filter((s) => s.jobId === viewJobId);

  const handleUnlock = (skill) => {
    if (unlockedSkills.includes(skill.id)) return;
    if (skillPoints < skill.cost) {
      toast.error(`Need ${skill.cost} SP. You have ${skillPoints}.`);
      return;
    }
    onUnlockSkill({ skillId: skill.id, cost: skill.cost });
    toast.success(`${skill.name} unlocked!`);
  };

  return (
    <div className="space-y-4">
      {/* SP indicator */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Skills carry over when you change jobs.</p>
        <div className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-3 py-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="font-display font-bold text-sm">{skillPoints}</span>
          <span className="text-xs">SP available</span>
        </div>
      </div>

      {/* Job selector tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {accessibleJobs.map((job) => (
          <button
            key={job.id}
            onClick={() => setViewJobId(job.id)}
            className={cn(
              "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all",
              viewJobId === job.id
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/40"
            )}
          >
            <span>{job.icon}</span>
            <span className="font-display font-medium">{job.name}</span>
            {job.id === currentJobId && (
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            )}
          </button>
        ))}
      </div>

      {/* Skills for selected job */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {jobSkills.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-2 text-center py-6">No skills for this job yet.</p>
        )}
        {jobSkills.map((skill, i) => {
          const isUnlocked = unlockedSkills.includes(skill.id);
          const canAfford = skillPoints >= skill.cost;

          return (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                "rounded-xl border-2 p-4 transition-all",
                isUnlocked
                  ? "border-primary bg-primary/5"
                  : canAfford
                  ? "border-border bg-card hover:border-primary/30"
                  : "border-border/50 bg-muted/20 opacity-60"
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">{skill.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display font-semibold text-sm">{skill.name}</p>
                    {isUnlocked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full border font-medium",
                        canAfford ? "border-primary/40 text-primary bg-primary/5" : "border-border text-muted-foreground"
                      )}>
                        {skill.cost} SP
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{skill.description}</p>
                </div>
              </div>
              {!isUnlocked && (
                <Button
                  size="sm"
                  className="w-full mt-3 h-7 text-xs font-display"
                  disabled={!canAfford}
                  onClick={() => handleUnlock(skill)}
                >
                  {canAfford ? `Unlock (${skill.cost} SP)` : <><Lock className="w-3 h-3 mr-1" />Need {skill.cost} SP</>}
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* All unlocked skills summary */}
      {unlockedSkills.length > 0 && (
        <div className="rounded-xl border bg-muted/30 p-4">
          <p className="text-xs font-display font-bold text-muted-foreground uppercase tracking-wider mb-3">
            All Unlocked Skills ({unlockedSkills.length})
          </p>
          <div className="max-h-24 overflow-y-auto pr-2 flex flex-wrap gap-2">
            {SKILLS.filter((s) => unlockedSkills.includes(s.id)).map((s) => (
              <div key={s.id} className="flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-full px-2.5 py-1 whitespace-nowrap">
                <span>{s.icon}</span>
                <span className="font-medium">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}