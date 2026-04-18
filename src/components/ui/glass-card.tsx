"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  hover?: boolean;
}

export function GlassCard({
  children,
  className,
  glow = false,
  hover = true,
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -1 } : undefined}
      className={cn(
        "glass-card rounded-xl",
        glow && "glow-crimson",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
