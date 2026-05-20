import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Sparkles, X, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { BIBLE_BOOKS } from "@/lib/bibleData";

export default function DevotionForm({
  onSubmit,
  onCancel,
  isSubmitting,
  isEditing,
  initialVerse = "",
  initialNotes = "",
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [showPreview, setShowPreview] = useState(true);
  const [passagePreview, setPassagePreview] = useState("");
  const [passageLoading, setPassageLoading] = useState(false);
  const [passageError, setPassageError] = useState("");

  const today = format(new Date(), "MMMM d, yyyy");

  const parseInitialVerse = () => {
    if (!initialVerse) return { book: "", chapter: "", verseStart: "", verseEnd: "" };
    const match = initialVerse.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
    if (match) {
      return {
        book: match[1],
        chapter: match[2],
        verseStart: match[3],
        verseEnd: match[4] || "",
      };
    }
    return { book: initialVerse, chapter: "", verseStart: "", verseEnd: "" };
  };

  const parsed = parseInitialVerse();
  const [selectedBook, setSelectedBook] = useState(parsed.book);
  const [selectedChapter, setSelectedChapter] = useState(parsed.chapter);
  const [verseStart, setVerseStart] = useState(parsed.verseStart);
  const [verseEnd, setVerseEnd] = useState(parsed.verseEnd);

  const bookData = BIBLE_BOOKS.find((b) => b.name === selectedBook);
  const chapterCount = bookData?.chapters?.length || 0;
  const verseCount =
    bookData && selectedChapter ? bookData.chapters[parseInt(selectedChapter) - 1] || 0 : 0;

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
    return verseEnd
      ? `${selectedBook} ${selectedChapter}:${verseStart}-${verseEnd}`
      : `${selectedBook} ${selectedChapter}:${verseStart}`;
  };

  const verse = getVerseString();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!verse || !notes.trim()) return;
    onSubmit({ verse, notes: notes.trim() });
  };

  const verseOptions = verseCount > 0 ? Array.from({ length: verseCount }, (_, i) => i + 1) : [];

  useEffect(() => {
    let cancelled = false;

    async function fetchPassage() {
      if (!verse) {
        setPassagePreview("");
        setPassageError("");
        setPassageLoading(false);
        return;
      }

      const apiKey = import.meta.env.VITE_API_BIBLE_KEY;
      const bibleId = import.meta.env.VITE_NLT_BIBLE_ID;

      if (!apiKey || !bibleId) {
        setPassagePreview("");
        setPassageError("Missing API.Bible environment variables.");
        setPassageLoading(false);
        return;
      }

      setPassageLoading(true);
      setPassageError("");

      try {
        const url = new URL(`https://rest.api.bible/v1/bibles/${bibleId}/search`);
        url.searchParams.set("query", verse);
        url.searchParams.set("content-type", "html");

        const res = await fetch(url.toString(), {
          headers: {
            "api-key": apiKey,
          },
        });

        if (!res.ok) {
          throw new Error(`Passage lookup failed (${res.status})`);
        }

        const data = await res.json();

        if (cancelled) return;

        const text =
          data?.data?.passages?.[0]?.content ||
          data?.data?.passages?.[0]?.text ||
          data?.data?.verses?.[0]?.content ||
          data?.data?.verses?.[0]?.text ||
          "";

        setPassagePreview(text || "No passage text returned.");
      } catch (err) {
        if (!cancelled) {
          setPassagePreview("");
          setPassageError(err?.message || "Could not load passage.");
        }
      } finally {
        if (!cancelled) setPassageLoading(false);
      }
    }

    const timer = setTimeout(fetchPassage, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [verse]);

  const formattedPassage = passagePreview.replace(
  /<span[^>]*class="v"[^>]*>(\d+)<\/span>/g,
  '<span class="font-semibold text-primary mr-2 inline-block min-w-[1.25rem]">$1</span>'
);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="font-display flex items-center gap-2 text-lg">
              <BookOpen className="w-5 h-5 text-primary" />
              {isEditing ? "Edit Devotion" : "Today's Devotion"}
            </CardTitle>
            <div className="flex items-center gap-2">
              {onCancel && (
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={onCancel}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{today}</p>
        </CardHeader>

        <CardContent className="space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Bible Verse</label>

              <Select value={selectedBook} onValueChange={handleBookChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Book…" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {BIBLE_BOOKS.map((b) => (
                    <SelectItem key={b.name} value={b.name}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedBook && (
                <Select value={selectedChapter} onValueChange={handleChapterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Chapter…" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {Array.from({ length: chapterCount }, (_, i) => i + 1).map((c) => (
                      <SelectItem key={c} value={String(c)}>
                        Chapter {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {selectedChapter && verseCount > 0 && (
                <div className="flex items-center gap-2">
                  <Select
                    value={verseStart}
                    onValueChange={(v) => {
                      setVerseStart(v);
                      setVerseEnd("");
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Verse" />
                    </SelectTrigger>
                    <SelectContent className="max-h-48">
                      {verseOptions.map((v) => (
                        <SelectItem key={v} value={String(v)}>
                          v. {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {verseStart && (
                    <>
                      <span className="text-sm text-muted-foreground shrink-0">to (optional)</span>
                      <Select
                        value={verseEnd || "__none__"}
                        onValueChange={(v) => setVerseEnd(v === "__none__" ? "" : v)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="End verse" />
                        </SelectTrigger>
                        <SelectContent className="max-h-48">
                          <SelectItem value="__none__">—</SelectItem>
                          {verseOptions
                            .filter((v) => v > parseInt(verseStart))
                            .map((v) => (
                              <SelectItem key={v} value={String(v)}>
                                v. {v}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </>
                  )}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-between"
                onClick={() => setShowPreview((s) => !s)}
                disabled={!verse}
              >
                <span className="flex items-center gap-2">
                  {showPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {showPreview ? "Hide Passage Preview" : "Show Passage Preview"}
                </span>
                <span className="text-xs text-muted-foreground">NLT</span>
              </Button>

              <AnimatePresence>
                {showPreview && verse && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -6, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl border bg-muted/20 p-4 space-y-2">
                      <p className="text-sm font-semibold text-foreground">Selected Passage</p>

                      <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium flex-wrap">
                        📖 {verse}
                      </div>

                      {passageLoading ? (
                        <p className="text-sm text-muted-foreground">Loading passage...</p>
                      ) : passageError ? (
                        <p className="text-sm text-red-600">{passageError}</p>
                      ) : (
                       <div className="rounded-xl border bg-muted/20 p-4">
  <div
    className="prose prose-slate max-w-none text-sm leading-7 text-justify"
    dangerouslySetInnerHTML={{
      __html: formattedPassage || "<p>Passage preview will appear here.</p>",
    }}
  />
</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Devotion Notes</label>
              <Textarea
                placeholder="What did God speak to you today? Write your reflections, prayers, or insights..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[420px] resize-y leading-7 text-base p-4"
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