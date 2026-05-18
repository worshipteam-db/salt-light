import React, { useState } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const sections = [
  {
    emoji: "⚡",
    title: "Welcome to Salt & Light",
    color: "from-primary/10 to-accent/10",
    content: (
      <div className="space-y-3 text-sm text-foreground/80 leading-relaxed">
        <p><strong className="text-foreground">Salt & Light</strong> is a gamified life tracker that turns your daily habits, goals, and faith journey into an RPG adventure.</p>
        <p>Complete goals → earn <strong className="text-yellow-500">⚡ XP</strong> → level up → unlock equipment & skills. Stay devoted → earn <strong className="text-primary">🌳 Faith</strong> → unlock faith-based gear & bonuses.</p>
      </div>
    )
  },
  {
    emoji: "🎯",
    title: "Goals & Quests",
    color: "from-blue-500/10 to-sky-500/10",
    content: (
      <div className="space-y-2 text-sm leading-relaxed">
        <p className="text-muted-foreground text-xs">4 goal types with increasing rewards:</p>
        {[
          { icon: "☀️", name: "Daily Goals", xp: "+15 XP", desc: "Short tasks every day. Auto-reset each morning." },
          { icon: "📅", name: "Weekly Goals", xp: "+40 XP", desc: "Bigger commitments for the week. Reset weekly." },
          { icon: "🛡️", name: "Elite Quests", xp: "+100 XP", desc: "Long-term goals — major milestones in your journey." },
          { icon: "⚔️", name: "Boss Fights", xp: "+250 XP", desc: "Your biggest challenges. Massive XP reward." },
        ].map(g => (
          <div key={g.name} className="flex items-start gap-2.5 bg-muted/40 rounded-lg p-2">
            <span className="text-base leading-none mt-0.5">{g.icon}</span>
            <div>
              <p className="font-semibold text-foreground text-xs">{g.name} <span className="text-yellow-500 font-normal">{g.xp}</span></p>
              <p className="text-[11px] text-muted-foreground">{g.desc}</p>
            </div>
          </div>
        ))}
      </div>
    )
  },
  {
    emoji: "📆",
    title: "Goal Calendar",
    color: "from-accent/10 to-yellow-500/10",
    content: (
      <div className="space-y-3 text-sm leading-relaxed">
        <p className="text-muted-foreground text-xs">Calendar view shows goals like <strong className="text-foreground">GitHub's activity graph</strong>.</p>
        <div className="space-y-2">
          {[
            { color: "rgba(161,98,7,0.4)", label: "Yellow", desc: "= active goals. Darker = more goals." },
            { color: "rgba(22,101,52,0.55)", label: "Green", desc: "= completed goals. Stronger = more completions." },
            { color: "linear-gradient(135deg, hsl(143,64%,24%) 0%, hsl(143,64%,38%) 100%)", label: "Gradient", desc: "= today's date." },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded flex-shrink-0" style={{ background: l.color }} />
              <p className="text-xs text-muted-foreground"><strong className="text-foreground">{l.label}</strong> {l.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Tap any day to view goals. Copy goals forward to the next day, rest of week, or month.</p>
      </div>
    )
  },
  {
    emoji: "⚡",
    title: "XP & Leveling Up",
    color: "from-yellow-500/10 to-orange-500/10",
    content: (
      <div className="space-y-3 text-sm leading-relaxed">
        <p className="text-muted-foreground text-xs">Completing goals earns <strong className="text-yellow-500">XP</strong>. Accumulate enough to level up your character.</p>
        <div className="bg-muted/40 rounded-lg p-3 space-y-1.5">
          <p className="font-semibold text-foreground text-xs">XP is boosted by:</p>
          {["🎯 Active Job (unique XP bonuses per class)", "🥊 Equipped Items with XP passives", "🌟 Unlocked Skills in your skill tree", "✅ Completing goals on time (before due date)"].map(t => (
            <p key={t} className="text-xs text-muted-foreground">{t}</p>
          ))}
        </div>
      </div>
    )
  },
  {
    emoji: "🌳",
    title: "Faith Currency",
    color: "from-primary/10 to-green-500/10",
    content: (
      <div className="space-y-3 text-sm leading-relaxed">
        <p className="text-muted-foreground text-xs"><strong className="text-foreground">Faith</strong> is earned through devotion and used for faith-based gear.</p>
        <div className="bg-muted/40 rounded-lg p-3 space-y-1.5">
          <p className="font-semibold text-foreground text-xs">How to earn Faith:</p>
          {["📖 Complete a Devotion entry daily", "🔥 Build your devotion streak for bonus faith", "⚙️ Equip faith-boosting items", "🛡️ Unlock faith skills in devotee/priest tree"].map(t => (
            <p key={t} className="text-xs text-muted-foreground">{t}</p>
          ))}
        </div>
      </div>
    )
  },
  {
    emoji: "📖",
    title: "Devotions & Streaks",
    color: "from-violet-500/10 to-purple-500/10",
    content: (
      <div className="space-y-3 text-sm leading-relaxed">
        <p className="text-muted-foreground text-xs">Daily spiritual journal. Each entry earns XP and Faith.</p>
        <div className="bg-muted/40 rounded-lg p-3 space-y-1.5">
          {["1. Select a Bible verse or enter your own", "2. Write your reflection notes", "3. Submit — earn XP and Faith instantly"].map(t => (
            <p key={t} className="text-xs text-muted-foreground">{t}</p>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-orange-500/10 rounded-lg p-2.5">
          <span className="text-xl">🔥</span>
          <p className="text-xs text-muted-foreground"><strong className="text-foreground">Streaks matter!</strong> Every consecutive day you complete a devotion, your streak grows, giving bonus Faith rewards.</p>
        </div>
      </div>
    )
  },
  {
    emoji: "🛡️",
    title: "Equipment & Shop",
    color: "from-slate-500/10 to-gray-500/10",
    content: (
      <div className="space-y-3 text-sm leading-relaxed">
        <p className="text-muted-foreground text-xs">Equipment gives passive bonuses that boost XP, Faith, and skill points automatically.</p>
        <div className="bg-muted/40 rounded-lg p-3 space-y-1.5">
          {["🎒 Equip up to 6 items at once", "🔓 Free items at certain levels — just equip them", "💰 Paid items cost XP or Faith to unlock", "🏷️ Some items are class-restricted", "🔐 Higher tiers require higher levels"].map(t => (
            <p key={t} className="text-xs text-muted-foreground">{t}</p>
          ))}
        </div>
      </div>
    )
  },
  {
    emoji: "⚔️",
    title: "Jobs & Class System",
    color: "from-red-500/10 to-orange-500/10",
    content: (
      <div className="space-y-3 text-sm leading-relaxed">
        <p className="text-muted-foreground text-xs">Your <strong className="text-foreground">Job</strong> defines playstyle and gives unique passive bonuses.</p>
        <div className="space-y-1.5">
          {[
            { icon: "🌱", name: "Seeker", desc: "Starting class. Balanced bonuses." },
            { icon: "⚔️", name: "Warrior path", desc: "Best XP on weekly & boss fights. Lv 5." },
            { icon: "📚", name: "Scholar path", desc: "Best XP on long-term goals. Lv 5." },
            { icon: "🕊️", name: "Devotee path", desc: "Best Faith gains. Lv 5." },
          ].map(j => (
            <div key={j.name} className="flex items-start gap-2">
              <span>{j.icon}</span>
              <p className="text-xs"><strong className="text-foreground">{j.name}</strong> — {j.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground bg-muted/40 rounded p-2">💡 Each path branches further at Lv 10 and Lv 20 into elite classes.</p>
      </div>
    )
  },
  {
    emoji: "🌟",
    title: "Skills & Skill Points",
    color: "from-chart-1/10 to-violet-500/10",
    content: (
      <div className="space-y-3 text-sm leading-relaxed">
        <p className="text-muted-foreground text-xs"><strong className="text-foreground">Skill Points (SP)</strong> are earned on level-up. Spend them on powerful passive skills.</p>
        <div className="bg-muted/40 rounded-lg p-3 space-y-1.5">
          {["📈 Earn 1 SP per level by default", "🎒 Certain items give bonus SP on level-up", "🔮 Sage job gives discounts on skill costs (−1 SP)", "🧠 Skills are permanent — carry over when changing jobs"].map(t => (
            <p key={t} className="text-xs text-muted-foreground">{t}</p>
          ))}
        </div>
      </div>
    )
  },
  {
    emoji: "🎨",
    title: "Appearance & Themes",
    color: "from-pink-500/10 to-rose-500/10",
    content: (
      <div className="space-y-3 text-sm leading-relaxed">
        <p className="text-muted-foreground text-xs">Customize the look in the <strong className="text-foreground">Character</strong> page under Settings.</p>
        <div className="bg-muted/40 rounded-lg p-3 space-y-1.5">
          {["🌙 Dark / Light mode — toggle anytime", "👤 Character name — shown on dashboard", "⚔️ Job & class — changes avatar and gear"].map(t => (
            <p key={t} className="text-xs text-muted-foreground">{t}</p>
          ))}
        </div>
        <div className="bg-destructive/10 rounded-lg p-2.5">
          <p className="text-xs text-destructive font-medium">⚠️ Danger Zone</p>
          <p className="text-xs text-muted-foreground mt-0.5">The Character page has a <strong className="text-foreground">delete character</strong> option. Irreversible — use with caution.</p>
        </div>
      </div>
    )
  }
];

export default function TutorialModal({ onClose }) {
  const [page, setPage] = useState(0);
  const current = sections[page];
  const isFirst = page === 0;
  const isLast = page === sections.length - 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-md bg-card border rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col"
        style={{ maxHeight: "85dvh" }}
      >
        {/* Header */}
        <div className={cn("bg-gradient-to-br shrink-0 p-4 rounded-t-2xl sm:rounded-t-2xl", current.color)}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{current.emoji}</span>
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{page + 1} / {sections.length}</p>
                <h2 className="font-display font-bold text-base leading-tight">{current.title}</h2>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/10 transition-colors text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Progress dots */}
          <div className="flex gap-1 mt-2.5">
            {sections.map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={cn("h-1 rounded-full transition-all", i === page ? "bg-primary w-4" : "bg-muted-foreground/30 w-2")}
              />
            ))}
          </div>
        </div>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {current.content}
        </div>

        {/* Navigation — always visible */}
        <div className="shrink-0 px-4 py-3 border-t flex items-center gap-2 bg-card rounded-b-2xl"
          style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
          <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={isFirst} className="flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          {isLast ? (
            <Button size="sm" onClick={onClose} className="flex-1">Got it! Let's go ⚡</Button>
          ) : (
            <Button size="sm" onClick={() => setPage(p => p + 1)} className="flex-1">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}