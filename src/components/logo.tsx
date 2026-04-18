"use client";

import { motion } from "framer-motion";

interface LogoProps {
  variant?: "candlestick" | "bull" | "chart";
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { container: "w-8 h-8", icon: 20, text: "text-lg" },
  md: { container: "w-10 h-10", icon: 24, text: "text-xl" },
  lg: { container: "w-16 h-16", icon: 36, text: "text-2xl" },
};

// Option 1: Rising Candlestick Chart
function CandlestickIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* First candle - green bullish */}
      <rect x="4" y="14" width="4" height="10" fill="#22c55e" rx="0.5" />
      <rect x="5" y="10" width="2" height="4" fill="#22c55e" />
      <rect x="5" y="24" width="2" height="3" fill="#22c55e" />
      
      {/* Second candle - larger green bullish */}
      <rect x="12" y="8" width="4" height="14" fill="#22c55e" rx="0.5" />
      <rect x="13" y="4" width="2" height="4" fill="#22c55e" />
      <rect x="13" y="22" width="2" height="4" fill="#22c55e" />
      
      {/* Third candle - red to green transition (doji-like) */}
      <rect x="20" y="12" width="4" height="8" fill="#ef4444" rx="0.5" />
      <rect x="21" y="8" width="2" height="4" fill="#ef4444" />
      <rect x="21" y="20" width="2" height="4" fill="#ef4444" />
      
      {/* Trend line */}
      <path
        d="M6 18 L14 14 L22 16"
        stroke="#ef4444"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Upward arrow */}
      <path
        d="M24 14 L28 10 M28 10 L28 14 M28 10 L24 10"
        stroke="#ef4444"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// Option 2: Stylized Bull (Bull Market)
function BullIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Bull head silhouette */}
      <path
        d="M8 20 C8 16, 10 12, 14 12 C16 12, 18 13, 20 14 L24 12 L26 14 L24 16 C26 18, 26 22, 22 24 C18 26, 12 26, 8 20 Z"
        fill="url(#bullGradient)"
        stroke="#ef4444"
        strokeWidth="1.5"
      />
      
      {/* Horns */}
      <path
        d="M14 12 C12 8, 10 6, 8 8 M20 14 C22 10, 24 8, 26 10"
        stroke="#ef4444"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Eye */}
      <circle cx="16" cy="17" r="1.5" fill="#1a1a1a" />
      
      {/* Nostril */}
      <ellipse cx="23" cy="19" rx="1" ry="0.8" fill="#1a1a1a" />
      
      {/* Upward trend integrated */}
      <path
        d="M4 24 L10 18 L16 20 L24 12"
        stroke="#22c55e"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      
      <defs>
        <linearGradient id="bullGradient" x1="8" y1="12" x2="26" y2="24">
          <stop offset="0%" stopColor="#6b1515" />
          <stop offset="100%" stopColor="#a91d1d" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Option 3: Abstract Upward Trending Chart (Recommended)
function ChartIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Grid lines - subtle */}
      <path
        d="M4 8 L28 8 M4 16 L28 16 M4 24 L28 24"
        stroke="#3a1515"
        strokeWidth="0.5"
        strokeDasharray="2 2"
      />
      
      {/* Main trend line - rising */}
      <path
        d="M6 22 L12 18 L18 20 L26 10"
        stroke="url(#trendGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Data points */}
      <circle cx="6" cy="22" r="2.5" fill="#6b1515" stroke="#ef4444" strokeWidth="1.5" />
      <circle cx="12" cy="18" r="2.5" fill="#8a1c1c" stroke="#ef4444" strokeWidth="1.5" />
      <circle cx="18" cy="20" r="2.5" fill="#a91d1d" stroke="#ef4444" strokeWidth="1.5" />
      <circle cx="26" cy="10" r="3" fill="#ef4444" stroke="#ff5555" strokeWidth="2" />
      
      {/* Upward arrow at the end */}
      <path
        d="M24 6 L28 6 L28 10"
        stroke="#ff5555"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M28 6 L22 12"
        stroke="#ff5555"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Glow effect circle behind */}
      <circle cx="16" cy="16" r="14" fill="url(#glowGradient)" opacity="0.3" />
      
      <defs>
        <linearGradient id="trendGradient" x1="6" y1="22" x2="26" y2="10">
          <stop offset="0%" stopColor="#6b1515" />
          <stop offset="50%" stopColor="#a91d1d" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
        <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#6b1515" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function Logo({ variant = "chart", size = "md", showText = true, className = "" }: LogoProps) {
  const sizeConfig = sizes[size];
  
  const IconComponent = {
    candlestick: CandlestickIcon,
    bull: BullIcon,
    chart: ChartIcon,
  }[variant];

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <motion.div
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`${sizeConfig.container} rounded-xl bg-gradient-to-br from-noir-crimson to-noir-crimsonLight flex items-center justify-center glow-crimson relative overflow-hidden`}
      >
        {/* Animated glow background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-noir-crimson-light/30 to-transparent"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Icon */}
        <div className="relative z-10">
          <IconComponent size={sizeConfig.icon} />
        </div>
        
        {/* Outer glow effect on hover */}
        <div className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300 shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
      </motion.div>
      
      {showText && (
        <motion.span 
          className={`font-semibold text-gradient-crimson ${sizeConfig.text}`}
          whileHover={{ x: 2 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          FinSight
        </motion.span>
      )}
    </div>
  );
}

// Standalone icon for favicon or small uses
export function LogoIcon({ variant = "chart", size = 32, className = "" }: { variant?: "candlestick" | "bull" | "chart"; size?: number; className?: string }) {
  const IconComponent = {
    candlestick: CandlestickIcon,
    bull: BullIcon,
    chart: ChartIcon,
  }[variant];

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 bg-noir-crimson/20 rounded-lg blur-xl" />
      <div className="relative">
        <IconComponent size={size} />
      </div>
    </div>
  );
}
