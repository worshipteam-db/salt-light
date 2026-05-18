import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { BIBLE_BOOKS } from "@/lib/bibleData";

export default function DevotionForm({ onSubmit, onCancel, isSubmitting, isEditing, initialVerse = "", initialNotes = "" }) {
  const [notes, setNotes] = useState(initialNotes);
  const today = format(new Date(), "MMMM d, yyyy");

  // Parse initial verse into parts (e.g. "John 3:16" or "Psalm 23:1-3")
  const parseInitialVerse = () => {
    if (!initialVerse) return { book: "", chapter: "", verseStart: "", verseEnd: "" };
    const match = initialVerse.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
    if (match) return { book: match[1], chapter: match[2], verseStart: match[3], verseEnd: match[4] || "" };
    return { book: initialVerse, chapter: "", verseStart: "", verseEnd: "" };
  };

  const parsed = parseInitialVerse();
  const [selectedBook, setSelectedBook] = useState(parsed.book);
  const [selectedChapter, setSelectedChapter] = useState(parsed.chapter);
  const [verseStart, setVerseStart] = useState(parsed.verseStart);
  const [verseEnd, setVerseEnd] = useState(parsed.verseEnd);

  const bookData = BIBLE_BOOKS.find(b => b.name === selectedBook);
  const chapterCount = bookData?.chapters?.length || 0;
  const verseCount = bookData && selectedChapter ? bookData.chapters[parseInt(selectedChapter) - 1] || 0 : 0;

  const handleBookChange = (val) => {
    setSelectedBook(val);
    setSelectedChapter("");
    setVerseStart("");
    setVerseEnd("");
  };

  const handleChapterChange = (val) => {
    setSelectedChapter(val);
    setVerseStart("");
    setVerseEnd("");
  };

  const getVerseString = () => {
    if (!selectedBook || !selectedChapter || !verseStart) return "";
    return verseEnd ? `${selectedBook} ${selectedChapter}:${verseStart}-${verseEnd}` : `${selectedBook} ${selectedChapter}:${verseStart}`;
  };

  const verse = getVerseString();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!verse || !notes.trim()) return;
    onSubmit({ verse, notes: notes.trim() });
  };

  const verseOptions = verseCount > 0 ? Array.from({ length: verseCount }, (_, i) => i + 1) : [];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-display flex items-center gap-2 text-lg">
              <BookOpen className="w-5 h-5 text-primary" />
              {isEditing ? "Edit Devotion" : "Today's Devotion"}
            </CardTitle>
            {onCancel && (
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={onCancel}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{today}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Verse selection — Book → Chapter → Verse */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Bible Verse</label>

              {/* Book */}
              <Select value={selectedBook} onValueChange={handleBookChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Book…" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {BIBLE_BOOKS.map(b => (
                    <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Chapter */}
              {selectedBook && (
                <Select value={selectedChapter} onValueChange={handleChapterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Chapter…" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {Array.from({ length: chapterCount }, (_, i) => i + 1).map(c => (
                      <SelectItem key={c} value={String(c)}>Chapter {c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Verse range */}
              {selectedChapter && verseCount > 0 && (
                <div className="flex items-center gap-2">
                  <Select value={verseStart} onValueChange={(v) => { setVerseStart(v); setVerseEnd(""); }}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Verse" />
                    </SelectTrigger>
                    <SelectContent className="max-h-48">
                      {verseOptions.map(v => (
                        <SelectItem key={v} value={String(v)}>v. {v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {verseStart && (
                    <>
                      <span className="text-sm text-muted-foreground shrink-0">to (optional)</span>
                      <Select value={verseEnd} onValueChange={setVerseEnd}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="End verse" />
                        </SelectTrigger>
                        <SelectContent className="max-h-48">
                          <SelectItem value={null}>—</SelectItem>
                          {verseOptions.filter(v => v > parseInt(verseStart)).map(v => (
                            <SelectItem key={v} value={String(v)}>v. {v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  )}
                </div>
              )}

              {/* Preview */}
              {verse && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 text-sm font-medium text-primary">
                  📖 {verse}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Devotion Notes</label>
              <Textarea
                placeholder="What did God speak to you today? Write your reflections, prayers, or insights..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[140px] resize-none"
              />
            </div>

            <Button
              type="submit"
              className="w-full font-display"
              disabled={!verse || !notes.trim() || isSubmitting}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Complete Devotion"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}