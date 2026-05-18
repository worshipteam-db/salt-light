import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { XP_REWARDS } from "@/lib/gameData";

export default function GoalForm({ onSubmit, onCancel, defaultTimeframe = "daily" }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeframe, setTimeframe] = useState(defaultTimeframe);
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      timeframe,
      due_date: dueDate || undefined,
      xp_reward: XP_REWARDS[timeframe],
      status: "active",
    });
    setTitle("");
    setDescription("");
    setTimeframe("daily");
    setDueDate("");
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="bg-card border rounded-xl p-5 space-y-4 overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold">New Goal</h3>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Input
        placeholder="What do you want to achieve?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="font-medium"
        autoFocus
      />

      <Textarea
        placeholder="Add details (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="h-20 resize-none"
      />

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-muted-foreground px-1">Type</label>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily (+{XP_REWARDS.daily} XP)</SelectItem>
              <SelectItem value="weekly">Weekly (+{XP_REWARDS.weekly} XP)</SelectItem>
              <SelectItem value="long_term">🛡️ Elite Quest (+{XP_REWARDS.long_term} XP)</SelectItem>
              <SelectItem value="boss_fight">⚔️ Boss Fight (+{XP_REWARDS.boss_fight} XP)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-muted-foreground px-1">
            {timeframe === "daily" ? "Date" : timeframe === "weekly" ? "Week of" : "Due date"}
          </label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 font-display" disabled={!title.trim()}>
        <Plus className="w-4 h-4 mr-2" /> Add Goal
      </Button>
    </motion.form>
  );
}