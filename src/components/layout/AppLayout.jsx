import React, { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Target,
  BookOpen,
  Swords,
  Mail,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import TutorialModal from "@/components/layout/TutorialModal";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/goals", icon: Target, label: "Goals" },
  { path: "/devotion", icon: BookOpen, label: "Devotion" },
  { path: "/mail", icon: Mail, label: "Mail" },
  { path: "/character", icon: Swords, label: "Character" },
];

const pageVariants = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
};

export default function AppLayout() {
  const location = useLocation();
  const [showTutorial, setShowTutorial] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const { user } = useAuth();

  const loadPendingCount = async () => {
    if (!user) {
      setPendingCount(0);
      return;
    }

    const { count, error } = await supabase
      .from("friendships")
      .select("id", { count: "exact", head: true })
      .eq("addressee_id", user.id)
      .eq("status", "pending");

    if (error) {
      console.error(error);
      return;
    }

    setPendingCount(count || 0);
  };

  useEffect(() => {
    loadPendingCount();
  }, [user?.id]);

  useEffect(() => {
    const handleRefresh = () => {
      loadPendingCount();
    };

    window.addEventListener("friendships-updated", handleRefresh);
    window.addEventListener("focus", handleRefresh);

    return () => {
      window.removeEventListener("friendships-updated", handleRefresh);
      window.removeEventListener("focus", handleRefresh);
    };
  }, [user?.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadPendingCount();
    }, 20000);

    return () => clearInterval(interval);
  }, [user?.id]);

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Desktop top bar */}
      <header className="hidden sm:block sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white text-sm font-bold">⚡</span>
            </div>
            <span className="font-display font-bold text-lg">Salt &amp; Light</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              const isMail = item.path === "/mail";

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "relative select-none flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px]",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>

                  {isMail && pendingCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              );
            })}

            <button
              onClick={() => setShowTutorial(true)}
              className="ml-1 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors min-h-[44px]"
              aria-label="Open tutorial"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile top bar */}
      <header
        className="sm:hidden sticky top-0 z-40 bg-card/90 backdrop-blur-xl border-b px-4 flex items-center justify-between h-12"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <Link
          to="/"
          className="font-display font-bold text-base tracking-tight select-none"
        >
          ⚡ Salt &amp; Light
        </Link>

        <button
          onClick={() => setShowTutorial(true)}
          className="flex items-center gap-1.5 px-3 h-9 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground text-sm font-medium"
          aria-label="Open tutorial"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Help</span>
        </button>
      </header>

      <AnimatePresence>
        {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
      </AnimatePresence>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 pb-[calc(env(safe-area-inset-bottom)+80px)] sm:pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.18, ease: "easeInOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="sm:hidden select-none fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-stretch h-[60px]">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            const isMail = item.path === "/mail";

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative select-none flex-1 flex flex-col items-center justify-center gap-1 min-h-[44px] transition-all",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon
                  className={cn("w-5 h-5 transition-transform", active && "scale-110")}
                />
                <span className="text-[10px] font-medium font-display">{item.label}</span>

                {isMail && pendingCount > 0 && (
                  <span className="absolute top-1.5 right-[28%] inline-flex min-w-4 h-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow">
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}