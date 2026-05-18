import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function CharacterSetup({ onSetup }) {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSetup(name.trim());
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm w-full text-center space-y-6"
      >
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mx-auto flex items-center justify-center">
          <span className="text-5xl">🧙</span>
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">Create Your Character</h1>
          <p className="text-muted-foreground text-sm mt-1">Begin your quest to achieve your goals</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Enter character name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-center font-display text-lg"
            autoFocus
          />
          <Button type="submit" className="w-full font-display" disabled={!name.trim()}>
            <Sparkles className="w-4 h-4 mr-2" /> Start Your Quest
          </Button>
        </form>
      </motion.div>
    </div>
  );
}