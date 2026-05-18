import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { XP_REWARDS } from "@/lib/gameData";

export default function GoalEditModal({ goal, onSave, onClose }) {
  const [title, setTitle] = useState(goal.title || "");
  const [description, setDescription] = useState(goal.description || "");
  const [timeframe, setTimeframe] = useState(goal.timeframe || "daily");
  const [dueDate, setDueDate] = useState(goal.due_date || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(goal.id, {
      title: title.trim(),
      description: description.trim(),
      timeframe,
      due_date: dueDate || undefined,
      xp_reward: XP_REWARDS[timeframe],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-md bg-card border rounded-2xl shadow-2xl p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold">Edit Goal</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            placeholder="Goal title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="font-medium"
            autoFocus
          />
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
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
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1 font-display" disabled={!title.trim()}>Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}