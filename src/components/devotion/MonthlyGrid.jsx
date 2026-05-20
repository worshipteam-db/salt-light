import React, { useRef, useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { ChevronLeft, ChevronRight, X, BookOpen, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MonthlyGrid({ completedDates = [], devotions = [] }) {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedEntry, setSelectedEntry] = useState(null);
  const exportRef = useRef(null);

  const completedSet = new Set((completedDates || []).filter(Boolean));
  const devotionMap = {};
  (devotions || []).forEach((d) => {
    if (d && d.date) devotionMap[d.date] = d;
  });

  const safeViewDate = viewDate instanceof Date && !isNaN(viewDate) ? viewDate : new Date();
  const monthStart = startOfMonth(safeViewDate);
  const monthEnd = endOfMonth(safeViewDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startOffset = getDay(monthStart);
  const today = format(new Date(), "yyyy-MM-dd");

  const prevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const handleDayClick = (dateStr) => {
    const devotion = devotionMap[dateStr] || null;
    setSelectedEntry({ date: dateStr, devotion });
  };

  const exportDevotion = async () => {
    if (!selectedEntry?.devotion || !exportRef.current) return;

    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(exportRef.current, {
      scale: 2,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const link = document.createElement("a");
    const safeDate = selectedEntry.date || "devotion";
    const title = selectedEntry.devotion.bible_verse || "devotion";
    link.href = canvas.toDataURL("image/png");
    link.download = `devotion-${safeDate}-${title.replace(/[^\w\d-_]+/g, "_")}.png`;
    link.click();
  };

  return (
    <div className="space-y-3">
      {/* Month header */}
      <div className="flex items-center justify-between">
        <span className="font-display font-semibold text-sm">{format(safeViewDate, "MMMM yyyy")}</span>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-1 rounded hover:bg-muted transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={nextMonth} className="p-1 rounded hover:bg-muted transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] text-muted-foreground font-medium py-0.5">
            {d}
          </div>
        ))}
      </div>

      {/* Day boxes */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`offset-${i}`} />
        ))}

        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const done = completedSet.has(dateStr);
          const isToday = dateStr === today;
          const isPast = dateStr < today;

          return (
            <button
              key={dateStr}
              title={format(day, "MMM d")}
              onClick={() => (done || isPast) && handleDayClick(dateStr)}
              className={`
                aspect-square rounded-md flex items-center justify-center text-[10px] font-medium transition-all
                ${
                  done
                    ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/80 cursor-pointer"
                    : isToday
                    ? "border-2 border-primary/40 text-foreground"
                    : isPast
                    ? "bg-muted/50 text-muted-foreground hover:bg-muted cursor-pointer"
                    : "bg-muted/30 text-muted-foreground/50"
                }
              `}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 pt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-primary" />
          <span className="text-xs text-muted-foreground">Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-muted/50" />
          <span className="text-xs text-muted-foreground">Not yet</span>
        </div>
        <span className="text-xs text-muted-foreground ml-auto">Tap a day to view</span>
      </div>

      {/* View modal */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="border rounded-xl overflow-hidden mt-2"
          >
            <div
              className={`px-4 py-3 flex items-center justify-between ${
                selectedEntry.devotion ? "bg-primary/10 border-b border-primary/20" : "bg-muted/50 border-b"
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className={`w-4 h-4 ${selectedEntry.devotion ? "text-primary" : "text-muted-foreground"}`} />
                <span className="font-display font-semibold text-sm">
                  {format(new Date(selectedEntry.date + "T00:00:00"), "EEEE, MMMM d")}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {selectedEntry.devotion && (
                  <button
                    onClick={exportDevotion}
                    className="p-1 rounded hover:bg-muted transition-colors"
                    title="Download devotion image"
                  >
                    <Download className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
                <button onClick={() => setSelectedEntry(null)} className="p-1 rounded hover:bg-muted transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {selectedEntry.devotion ? (
              <div className="p-4 space-y-3 bg-card max-h-72 overflow-y-auto">
                <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium flex-wrap">
                  📖 {selectedEntry.devotion.bible_verse}
                </div>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
                  {selectedEntry.devotion.notes}
                </p>
                {selectedEntry.devotion.xp_earned && (
                  <p className="text-xs text-muted-foreground">+{selectedEntry.devotion.xp_earned} XP earned</p>
                )}
              </div>
            ) : (
              <div className="p-6 bg-card text-center space-y-1">
                <p className="text-muted-foreground text-sm">No entry found for this day.</p>
                <p className="text-xs text-muted-foreground">Daily devotions build your streak! 🔥</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden export card */}
      <div
        ref={exportRef}
        className="fixed left-[-9999px] top-0 w-[900px] p-8 bg-white text-slate-900"
      >
        {selectedEntry?.devotion && (
          <div className="space-y-6">
            <div className="border-b pb-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Salt & Light Devotion
              </p>
              <h2 className="text-3xl font-bold mt-1">{selectedEntry.devotion.bible_verse}</h2>
              <p className="text-sm text-slate-500 mt-2">
                {format(new Date(selectedEntry.date + "T00:00:00"), "EEEE, MMMM d, yyyy")}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  Verse
                </p>
                <p className="text-lg font-medium">{selectedEntry.devotion.bible_verse}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  Notes
                </p>
               <div className="whitespace-pre-wrap text-base leading-8 text-justify hyphens-auto">
  {selectedEntry.devotion.notes}
</div>
              </div>

              {selectedEntry.devotion.xp_earned && (
                <p className="text-sm text-slate-500">
                  +{selectedEntry.devotion.xp_earned} XP earned
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}