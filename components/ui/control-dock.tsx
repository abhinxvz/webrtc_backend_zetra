"use client";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import React from "react";

interface ControlDockProps {
  children: React.ReactNode;
  className?: string;
}

export const ControlDock = ({ children, className }: ControlDockProps) => {
  return (
    <div className="fixed bottom-3 sm:bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-2">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 30,
        }}
        className={cn(
          "bg-black/80 backdrop-blur-lg border border-white/20 rounded-full",
          "px-3 sm:px-6 py-2.5 sm:py-4 shadow-2xl pointer-events-auto",
          "flex items-center justify-center gap-2 sm:gap-3 max-w-[calc(100vw-1rem)] overflow-x-auto",
          className
        )}
      >
        {children}
      </motion.div>
    </div>
  );
};

export const DockDivider = () => {
  return <div className="w-px h-10 bg-white/20" />;
};
