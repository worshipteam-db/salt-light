import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Target, Swords, BookOpen, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import TutorialModal from "@/components/layout/TutorialModal";

const navItems = [
{ path: "/", icon: LayoutDashboard, label: "Dashboard" },
{ path: "/goals", icon: Target, label: "Goals" },
{ path: "/devotion", icon: BookOpen, label: "Devotion" },
{ path: "/character", icon: Swords, label: "Character" }];

const pageVariants = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 }
};

const ROOT_ROUTES = ["/", "/goals", "/character"];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isRoot = ROOT_ROUTES.includes(location.pathname);
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      style={{ paddingTop: "env(safe-area-inset-top)" }}>
      
      {/* Desktop top bar — hidden on mobile */}
      <header className="hidden sm:block sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white text-sm font-bold">⚡</span>
            </div>
            <span className="font-display font-bold text-lg">QuestLog</span>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) =>
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "select-none flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px]",
                location.pathname === item.path ?
                "bg-primary/10 text-primary" :
                "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}>
              
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            )}
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
      <header className="sm:hidden sticky top-0 z-40 bg-card/90 backdrop-blur-xl border-b px-4 flex items-center justify-between h-12"
        style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <Link to="/" className="font-display font-bold text-base tracking-tight select-none">
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

      

      {/* Page content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 pb-[calc(env(safe-area-inset-bottom)+80px)] sm:pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.18, ease: "easeInOut" }}>
            
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="sm:hidden select-none fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        
        <div className="flex items-stretch h-[60px]">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "select-none flex-1 flex flex-col items-center justify-center gap-1 min-h-[44px] transition-all",
                  active ? "text-primary" : "text-muted-foreground"
                )}>
                
                <item.icon className={cn("w-5 h-5 transition-transform", active && "scale-110")} />
                <span className="text-[10px] font-medium font-display">{item.label}</span>
              </Link>);

          })}
        </div>
      </nav>
    </div>);

}