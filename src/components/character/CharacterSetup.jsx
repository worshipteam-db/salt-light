import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function CharacterSetup({ onSetup }) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName || isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    try {
      await Promise.resolve(onSetup(trimmedName));
    } catch (err) {
      console.error("Character creation failed:", err);
      setError("Could not create your character. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClick = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    try {
      await Promise.resolve(onSetup(trimmedName));
    } catch (err) {
      console.error("Character creation failed:", err);
      setError("Could not create your character. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
          <p className="text-muted-foreground text-sm mt-1">
            Begin your quest to achieve your goals
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Enter character name..."
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError("");
            }}
            className="text-center font-display text-lg"
            autoFocus
          />

          {error && (
            <p className="text-sm text-destructive font-medium">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full font-display"
            disabled={!name.trim() || isSubmitting}
            onClick={handleClick}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isSubmitting ? "Starting..." : "Start Your Quest"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}