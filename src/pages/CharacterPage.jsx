import db from "@/api/base44Client";
import React, { useRef, useState } from "react";
import { useCharacter } from "@/lib/useCharacter";
import { getJobById, getTitle } from "@/lib/gameData";
import CharacterAvatar from "@/components/character/CharacterAvatar";
import CharacterSetup from "@/components/character/CharacterSetup";
import XPBar from "@/components/character/XPBar";
import EquipmentGrid from "@/components/character/EquipmentGrid";
import JobTree from "@/components/character/JobTree";
import SkillTree from "@/components/character/SkillTree";
import FriendsPanel from "@/components/character/FriendsPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Trophy,
  Swords,
  Sparkles,
  Trash2,
  Zap,
  BookOpen,
  Flame,
  Shield,
  Sun,
  Moon,
  Brain,
  LogOut,
  Pencil,
  Download,
} from "lucide-react";
import { EQUIPMENT, SKILLS } from "@/lib/gameData";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import { Link } from "react-router-dom";

function StatBox({ icon: Icon, label, value, color = "text-primary" }) {
  return (
    <div className="text-center p-3 rounded-xl bg-card border">
      <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
      <p className="font-display font-bold text-lg leading-none">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function ExportSectionTitle({ children }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
      {children}
    </p>
  );
}

export default function CharacterPage() {
  const {
    character,
    levelInfo,
    achievementState,
    achievementCompletionPercent,
    achievementUnlockedCount,
    achievementTotalCount,
    isLoading,
    createCharacter,
    toggleEquip,
    buyEquipment,
    unlockSkill,
    changeJob,
    MAX_EQUIPPED,
  } = useCharacter();

  const queryClient = useQueryClient();
  const { signOut } = useAuth();
  const exportRef = useRef(null);

  const [deleting, setDeleting] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState("");
  const [isDark, setIsDark] = useState(() =>
    typeof window !== "undefined" &&
    document.documentElement.classList.contains("dark")
  );

  const toggleTheme = () => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setIsDark(next);
  };

  const handleRename = async () => {
    if (!newName.trim() || !character) return;
    try {
      await db.entities.Character.update(character.id, { name: newName.trim() });
      queryClient.invalidateQueries({ queryKey: ["character"] });
      toast.success("Character renamed!");
      setRenaming(false);
      setNewName("");
    } catch (e) {
      toast.error("Failed to rename character");
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      if (character) await db.entities.Character.delete(character.id);
      queryClient.invalidateQueries({ queryKey: ["character"] });
      toast.success("Character deleted. Start fresh!");
    } finally {
      setDeleting(false);
    }
  };

  const exportProfileCard = async () => {
    const html2canvas = (await import("html2canvas")).default;
    const element = exportRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${character.name}-profile.png`;
      link.click();
      toast.success("Profile card downloaded!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export profile");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!character) return <CharacterSetup onSetup={createCharacter} />;

  const currentJob = getJobById(character.current_job || "seeker");
  const equippedCount = character.equipped_items?.length || 0;
  const title = getTitle(levelInfo.level);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Character</h1>
          <p className="text-sm text-muted-foreground">
            Level up, equip, and advance your path
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={exportProfileCard}
          className="shrink-0"
          title="Download profile card"
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>

      {/* Hero Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-background">
          <CardContent className="p-5 flex flex-col sm:flex-row items-center gap-5">
            <CharacterAvatar character={character} size="lg" />
            <div className="flex-1 space-y-4 w-full">
              <div className="flex items-start gap-2 flex-wrap">
                <span className="text-xl mt-0.5">{currentJob.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-display font-bold text-base leading-none">
                      {character.name}
                    </p>
                    <Dialog open={renaming} onOpenChange={setRenaming}>
                      <button
                        onClick={() => {
                          setNewName(character.name);
                          setRenaming(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        aria-label="Rename character"
                        type="button"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Rename Character</DialogTitle>
                          <DialogDescription>
                            Enter a new name for your character
                          </DialogDescription>
                        </DialogHeader>
                        <Input
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="Enter new name..."
                          autoFocus
                          onKeyDown={(e) => e.key === "Enter" && handleRename()}
                        />
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setRenaming(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleRename} disabled={!newName.trim()}>
                            Rename
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <p className="text-xs text-muted-foreground">{currentJob.name}</p>
                  {currentJob.bonuses?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {currentJob.bonuses.map((b, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-primary/10 text-primary rounded px-1.5 py-0.5 font-medium"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <XPBar
                currentXP={levelInfo.currentXP}
                neededXP={levelInfo.neededXP}
                level={levelInfo.level}
              />

              <div className="grid grid-cols-3 gap-2">
                <StatBox
                  icon={Trophy}
                  label="Goals Done"
                  value={character.goals_completed || 0}
                  color="text-accent"
                />
                <StatBox
                  icon={Zap}
                  label="Total XP"
                  value={character.total_xp || 0}
                  color="text-chart-2"
                />
                <StatBox
                  icon={BookOpen}
                  label="Faith"
                  value={character.faith || 0}
                  color="text-primary"
                />
                <StatBox
                  icon={Sparkles}
                  label="Skill Pts"
                  value={character.skill_points || 0}
                  color="text-chart-4"
                />
                <StatBox
                  icon={Swords}
                  label="Equipped"
                  value={`${equippedCount}/${MAX_EQUIPPED}`}
                  color="text-chart-3"
                />
                <StatBox
                  icon={Flame}
                  label="Total Faith"
                  value={character.total_faith || 0}
                  color="text-orange-500"
                />
              </div>

              <Card className="bg-muted/30 border-dashed">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 mt-0.5 text-primary">🏅</div>
                      <div>
                        <p className="text-sm font-semibold">Achievements</p>
                        <p className="text-xs text-muted-foreground">
                          {achievementUnlockedCount}/{achievementTotalCount} unlocked
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-primary">
                      {achievementCompletionPercent}%
                    </span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${achievementCompletionPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      Track milestones for level, devotion, equipment, skills, and job progress.
                    </p>
                    <Button asChild variant="outline" size="sm" className="shrink-0 min-h-[44px]">
                      <Link to="/achievements">View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {equippedCount > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Equipped Effects
                  </p>
                  <div className="space-y-1">
                    {EQUIPMENT.filter((e) => character.equipped_items?.includes(e.id)).map((item) => (
                      <div key={item.id} className="flex items-center gap-2 text-xs">
                        <span>{item.icon}</span>
                        <span className="font-medium text-foreground">{item.name}</span>
                        <span className="text-muted-foreground">—</span>
                        <span className={item.passive ? "text-primary font-medium" : "text-muted-foreground italic"}>
                          {item.passive || "No passive"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {character.unlocked_skills?.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Brain className="w-3 h-3" /> Active Skills ({character.unlocked_skills.length})
                  </p>
                  <div className="max-h-32 overflow-y-auto pr-2 space-y-1">
                    {SKILLS.filter((s) => character.unlocked_skills.includes(s.id)).map((skill) => (
                      <div key={skill.id} className="flex items-center gap-2 text-xs flex-wrap">
                        <span className="shrink-0">{skill.icon}</span>
                        <span className="font-medium text-foreground">{skill.name}</span>
                        <span className="text-muted-foreground shrink-0">—</span>
                        <span className="text-chart-4 font-medium">{skill.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="equipment">
        <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="equipment" className="font-display text-xs min-h-[44px]">
            ⚔️ Equipment
          </TabsTrigger>
          <TabsTrigger value="jobs" className="font-display text-xs min-h-[44px]">
            🗺️ Jobs
          </TabsTrigger>
          <TabsTrigger value="skills" className="font-display text-xs min-h-[44px]">
            ✨ Skills
          </TabsTrigger>
          <TabsTrigger value="friends" className="font-display text-xs min-h-[44px]">
            👥 Friends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="equipment">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">Equipment Shop</CardTitle>
            </CardHeader>
            <CardContent>
              <EquipmentGrid character={character} onEquip={toggleEquip} onBuy={buyEquipment} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">Job Tree</CardTitle>
            </CardHeader>
            <CardContent>
              <JobTree character={character} onChangeJob={changeJob} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">Skill Tree</CardTitle>
            </CardHeader>
            <CardContent>
              <SkillTree character={character} onUnlockSkill={unlockSkill} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="friends">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">Friends</CardTitle>
            </CardHeader>
            <CardContent>
              <FriendsPanel />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-red-600 mt-1">Dark mode is currently disabled due to bugs.</p>
              <p className="text-xs text-muted-foreground mt-1">
                This is temporary while the styling is being refined.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="min-h-[44px] gap-2 font-display opacity-60 cursor-not-allowed"
              disabled
              title="Dark mode is temporarily disabled"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4" /> Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" /> Dark Mode
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4 flex-col sm:flex-row">
            <div>
              <p className="text-sm font-medium">Feedback / Bug Report</p>
              <p className="text-xs text-muted-foreground mt-0.5">Send a bug report or suggestion.</p>
            </div>

            <Button asChild className="w-full sm:w-auto min-h-[44px] px-4 sm:px-5">
              <Link to="/feedback">Open Form</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/20">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Log Out</p>
              <p className="text-xs text-muted-foreground mt-0.5">Sign out of your account.</p>
            </div>
            <Button variant="outline" size="sm" className="min-h-[44px] shrink-0" onClick={() => signOut()}>
              <LogOut className="w-4 h-4 mr-2" /> Log Out
            </Button>
          </div>

          <div className="border-t" />

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Delete Character</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently delete all progress. Cannot be undone.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="min-h-[44px] shrink-0" disabled={deleting}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Character?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete <strong>{character.name}</strong> and all progress. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="min-h-[44px]">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="min-h-[44px] bg-destructive hover:bg-destructive/90"
                  >
                    Yes, Delete Forever
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Export-only profile card */}
      <div
        ref={exportRef}
        className="fixed -left-[99999px] top-0 w-[1480px] p-8 bg-[#f7f6f1]"
        style={{
          border: "2px solid #dfddd4",
          borderRadius: "24px",
          pointerEvents: "none",
        }}
      >
        <div className="flex gap-8">
          {/* Left profile column */}
          <div className="w-[320px] shrink-0">
            <div className="h-full rounded-[28px] border border-[#d9d7ce] bg-gradient-to-b from-white via-[#f7f5ef] to-[#efe9dc] p-5 shadow-sm">
              <div className="text-center">
                <div className="inline-flex items-center rounded-full border border-[#d7d5ca] bg-white px-3 py-1 text-[12px] font-semibold text-[#6c6f7d] shadow-sm">
                  {currentJob.name}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center">
                <div className="h-[230px] w-[230px] rounded-[28px] border border-[#d7d5ca] bg-white/70 flex items-center justify-center shadow-inner">
                  <CharacterAvatar character={character} size="xl" />
                </div>
              </div>

              <div className="mt-5 text-center">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-[34px] font-extrabold leading-none tracking-tight text-[#1d2230]">
                    {character.name}
                  </h2>
                  <Pencil className="w-5 h-5 text-[#7e8394] opacity-80" />
                </div>

                <p className="mt-2 text-[14px] font-medium text-[#6f7384]">
                  {title}
                </p>

                {currentJob.bonuses?.length > 0 && (
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {currentJob.bonuses.slice(0, 3).map((b, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-white/90 px-3 py-1 text-[12px] font-semibold text-[#2b6f3d] border border-[#dfe6d8]"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-[#dedbd1] bg-white p-3 text-center">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a8e9d]">
                    Level
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[#1d2230]">
                    {levelInfo.level}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#dedbd1] bg-white p-3 text-center">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a8e9d]">
                    Title
                  </p>
                  <p className="mt-1 text-xl font-bold text-[#1d2230]">
                    {title}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 space-y-5">
            {/* Header */}
            <div className="rounded-[28px] border border-[#dedbd1] bg-white/90 p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7f8393]">
                    Character Profile
                  </p>
                  <h3 className="mt-2 text-4xl font-extrabold tracking-tight text-[#1d2230]">
                    {character.name}
                  </h3>
                  <p className="mt-2 text-sm text-[#6f7384]">
                    {currentJob.icon} {currentJob.name}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7f8393]">
                    Progress
                  </p>
                  <p className="mt-2 text-2xl font-bold text-[#1d2230]">
                    {levelInfo.currentXP} / {levelInfo.neededXP} XP
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-semibold text-[#2c6f3e]">Level {levelInfo.level}</span>
                  <span className="text-[#6f7384]">{character.total_xp || 0} total XP</span>
                </div>

                <div className="h-4 rounded-full bg-[#eef0ea] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#2a7a43] via-[#7f9827] to-[#f6b731]"
                    style={{
                      width: `${Math.max(
                        8,
                        Math.min(100, (levelInfo.currentXP / Math.max(levelInfo.neededXP, 1)) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-[24px] border border-[#dedbd1] bg-white p-4 text-center shadow-sm">
                <Trophy className="mx-auto h-5 w-5 text-[#f4b000]" />
                <p className="mt-2 text-3xl font-extrabold text-[#1d2230]">
                  {character.goals_completed || 0}
                </p>
                <p className="mt-1 text-sm text-[#6f7384]">Goals Done</p>
              </div>

              <div className="rounded-[24px] border border-[#dedbd1] bg-white p-4 text-center shadow-sm">
                <Zap className="mx-auto h-5 w-5 text-[#f4b000]" />
                <p className="mt-2 text-3xl font-extrabold text-[#1d2230]">
                  {character.total_xp || 0}
                </p>
                <p className="mt-1 text-sm text-[#6f7384]">Total XP</p>
              </div>

              <div className="rounded-[24px] border border-[#dedbd1] bg-white p-4 text-center shadow-sm">
                <BookOpen className="mx-auto h-5 w-5 text-[#2c7a3f]" />
                <p className="mt-2 text-3xl font-extrabold text-[#1d2230]">
                  {character.faith || 0}
                </p>
                <p className="mt-1 text-sm text-[#6f7384]">Faith</p>
              </div>

              <div className="rounded-[24px] border border-[#dedbd1] bg-white p-4 text-center shadow-sm">
                <Sparkles className="mx-auto h-5 w-5 text-[#ff4f88]" />
                <p className="mt-2 text-3xl font-extrabold text-[#1d2230]">
                  {character.skill_points || 0}
                </p>
                <p className="mt-1 text-sm text-[#6f7384]">Skill Pts</p>
              </div>

              <div className="rounded-[24px] border border-[#dedbd1] bg-white p-4 text-center shadow-sm">
                <Swords className="mx-auto h-5 w-5 text-[#1ea97f]" />
                <p className="mt-2 text-3xl font-extrabold text-[#1d2230]">
                  {equippedCount}/{MAX_EQUIPPED}
                </p>
                <p className="mt-1 text-sm text-[#6f7384]">Equipped</p>
              </div>

              <div className="rounded-[24px] border border-[#dedbd1] bg-white p-4 text-center shadow-sm">
                <Flame className="mx-auto h-5 w-5 text-[#f27128]" />
                <p className="mt-2 text-3xl font-extrabold text-[#1d2230]">
                  {character.total_faith || 0}
                </p>
                <p className="mt-1 text-sm text-[#6f7384]">Total Faith</p>
              </div>
            </div>

            {/* Achievements */}
            <div className="rounded-[28px] border border-dashed border-[#d9d7ce] bg-white/80 p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏅</span>
                    <h4 className="text-2xl font-extrabold text-[#1d2230]">
                      Achievements
                    </h4>
                  </div>
                  <p className="mt-1 text-sm text-[#6f7384]">
                    {achievementUnlockedCount}/{achievementTotalCount} unlocked
                  </p>
                </div>

                <p className="text-2xl font-extrabold text-[#2c6f3e]">
                  {achievementCompletionPercent}%
                </p>
              </div>

              <div className="mt-5 h-3 rounded-full bg-[#eef0ea] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#2c6f3e]"
                  style={{ width: `${achievementCompletionPercent}%` }}
                />
              </div>
            </div>

            {/* Equipment */}
            <div className="rounded-[28px] border border-[#dedbd1] bg-white/90 p-6 shadow-sm">
              <ExportSectionTitle>Equipped Items</ExportSectionTitle>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {EQUIPMENT.filter((e) => character.equipped_items?.includes(e.id)).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-[#e1ded4] bg-[#fbfaf7] p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-[#e2dfd5]">
                        <span className="text-lg">{item.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#1d2230]">{item.name}</p>
                        <p className="mt-0.5 text-xs text-[#6f7384]">
                          {item.type}
                        </p>
                        <p
                          className={`mt-1 text-sm ${
                            item.passive ? "text-[#2c6f3e]" : "text-[#7e8394] italic"
                          }`}
                        >
                          {item.passive || "No passive"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer line */}
            <div className="text-center text-[10px] text-[#7a7e8d]">
              <p>Salt &amp; Light • Character Profile</p>
              <p className="mt-1">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}