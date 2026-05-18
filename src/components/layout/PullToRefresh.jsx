import React, { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { RefreshCw } from "lucide-react";

const THRESHOLD = 72;

export default function PullToRefresh({ onRefresh, children }) {
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const pullY = useMotionValue(0);
  const opacity = useTransform(pullY, [0, THRESHOLD], [0, 1]);
  const rotate = useTransform(pullY, [0, THRESHOLD], [0, 180]);
  const containerY = useTransform(pullY, [0, THRESHOLD], [0, THRESHOLD]);

  const handleTouchStart = useCallback((e) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (startY.current === null || refreshing) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0 && window.scrollY === 0) {
      pullY.set(Math.min(delta * 0.5, THRESHOLD));
    }
  }, [refreshing, pullY]);

  const handleTouchEnd = useCallback(async () => {
    if (startY.current === null) return;
    startY.current = null;
    if (pullY.get() >= THRESHOLD - 4) {
      setRefreshing(true);
      pullY.set(THRESHOLD);
      await onRefresh();
      setRefreshing(false);
    }
    pullY.set(0);
  }, [pullY, onRefresh]);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      <motion.div
        style={{ opacity }}
        className="absolute left-0 right-0 flex justify-center pointer-events-none z-10"
        style={{ top: -48, opacity }}
      >
        <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <motion.div style={{ rotate }}>
            <RefreshCw className={`w-4 h-4 text-primary ${refreshing ? "animate-spin" : ""}`} />
          </motion.div>
        </div>
      </motion.div>

      {/* Content shifts down */}
      <motion.div style={{ y: containerY }}>
        {children}
      </motion.div>
    </div>
  );
}