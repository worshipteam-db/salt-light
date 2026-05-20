import db from "@/api/base44Client";
import React, { useState } from "react";
import { useCharacter } from "@/lib/useCharacter";
import { getJobById } from "@/lib/gameData";
import CharacterAvatar from "@/components/character/CharacterAvatar";
import CharacterSetup from "@/components/character/CharacterSetup";
import XPBar from "@/components/character/XPBar";
import EquipmentGrid from "@/components/character/EquipmentGrid";
import JobTree from "@/components/character/JobTree";
import SkillTree from "@/components/character/SkillTree";
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

export default function CharacterPage() {
  const {
    character,
    levelInfo,
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

  const [deleting, setDeleting] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState("");
  const [isDark, setIsDark] = useState(() =>
    typeof window !== "undefined" && document.documentElement.classList.contains("dark")
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
    const element = document.getElementById("profile-export-card");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${character.name}-profile.png`;
      link.click();
      toast.success("Profile card downloaded!");
    } catch {
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Character</h1>
          <p className="text-sm text-muted-foreground">Level up, equip, and advance your path</p>
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
                    <p className="font-display font-bold text-base leading-none">{character.name}</p>
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
                          <DialogDescription>Enter a new name for your character</DialogDescription>
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
                <StatBox icon={Trophy} label="Goals Done" value={character.goals_completed || 0} color="text-accent" />
                <StatBox icon={Zap} label="Total XP" value={character.total_xp || 0} color="text-chart-2" />
                <StatBox icon={BookOpen} label="Faith" value={character.faith || 0} color="text-primary" />
                <StatBox icon={Sparkles} label="Skill Pts" value={character.skill_points || 0} color="text-chart-4" />
                <StatBox
                  icon={Swords}
                  label="Equipped"
                  value={`${equippedCount}/${MAX_EQUIPPED}`}
                  color="text-chart-3"
                />
                <StatBox icon={Flame} label="Total Faith" value={character.total_faith || 0} color="text-orange-500" />
              </div>

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
        <TabsList className="w-full grid grid-cols-3 h-auto">
          <TabsTrigger value="equipment" className="font-display text-xs min-h-[44px]">
            ⚔️ Equipment
          </TabsTrigger>
          <TabsTrigger value="jobs" className="font-display text-xs min-h-[44px]">
            🗺️ Jobs
          </TabsTrigger>
          <TabsTrigger value="skills" className="font-display text-xs min-h-[44px]">
            ✨ Skills
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
      </Tabs>

      {/* Appearance */}
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

      <div
        id="profile-export-card"
        className="hidden fixed top-0 left-0 w-96 p-8 bg-gradient-to-br from-primary/10 via-accent/10 to-background"
        style={{
          backgroundColor: "#f9f7f2",
          border: "2px solid #4a7c59",
          borderRadius: "16px",
        }}
      >
        <div className="space-y-4 text-gray-900">
          <div className="text-center border-b border-gray-300 pb-4">
            <p className="text-sm font-medium text-gray-600">CHARACTER CARD</p>
            <h2 className="text-3xl font-bold mt-1" style={{ fontFamily: "Space Grotesk" }}>
              {character.name}
            </h2>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-sm font-medium">Class</span>
              <span className="text-lg">
                {currentJob.icon} {currentJob.name}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-sm font-medium">Level</span>
              <span className="text-2xl font-bold text-primary">{levelInfo.level}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-sm font-medium">Total XP</span>
              <span className="font-semibold">{character.total_xp || 0}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-sm font-medium">Faith</span>
              <span className="font-semibold">{character.faith || 0}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-sm font-medium">Goals Completed</span>
              <span className="font-semibold">{character.goals_completed || 0}</span>
            </div>
          </div>

          {equippedCount > 0 && (
            <div className="space-y-2 border-t border-gray-300 pt-3">
              <p className="text-sm font-semibold">⚔️ Equipped Items</p>
              <div className="space-y-1">
                {EQUIPMENT.filter((e) => character.equipped_items?.includes(e.id)).map((item) => (
                  <div key={item.id} className="text-xs flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center border-t border-gray-300 pt-3 text-[10px] text-gray-600">
            <p>Salt & Light - Character Profile</p>
            <p>{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}