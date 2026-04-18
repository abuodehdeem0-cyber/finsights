"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  Stethoscope,
  Cpu,
  Zap,
  ShoppingCart,
  Landmark,
  Truck,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowRight,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { formatPercentage } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";

const sectors = [
  {
    id: "technology",
    name: "Technology",
    icon: Cpu,
    change: 2.34,
    marketCap: "SAR 890B",
    topStocks: ["7010.SR", "7020.SR", "7030.SR"],
    heatmap: "hot",
    sentiment: "Bullish",
  },
  {
    id: "healthcare",
    name: "Healthcare",
    icon: Stethoscope,
    change: 0.87,
    marketCap: "SAR 245B",
    topStocks: ["2070.SR", "4010.SR", "4170.SR"],
    heatmap: "warm",
    sentiment: "Neutral",
  },
  {
    id: "finance",
    name: "Finance",
    icon: Landmark,
    change: -0.45,
    marketCap: "SAR 1.2T",
    topStocks: ["1120.SR", "1010.SR", "1020.SR"],
    heatmap: "cool",
    sentiment: "Neutral",
  },
  {
    id: "energy",
    name: "Energy",
    icon: Zap,
    change: 1.56,
    marketCap: "SAR 8.5T",
    topStocks: ["2222.SR", "2010.SR", "2030.SR"],
    heatmap: "warm",
    sentiment: "Bullish",
  },
  {
    id: "consumer",
    name: "Consumer",
    icon: ShoppingCart,
    change: -1.23,
    marketCap: "SAR 156B",
    topStocks: ["4001.SR", "4003.SR", "4004.SR"],
    heatmap: "cold",
    sentiment: "Bearish",
  },
  {
    id: "industrial",
    name: "Industrial",
    icon: Truck,
    change: 0.34,
    marketCap: "SAR 445B",
    topStocks: ["1211.SR", "1301.SR", "2220.SR"],
    heatmap: "neutral",
    sentiment: "Neutral",
  },
  {
    id: "realestate",
    name: "Real Estate",
    icon: Building2,
    change: -0.78,
    marketCap: "SAR 89B",
    topStocks: ["4150.SR", "4230.SR", "4040.SR"],
    heatmap: "cool",
    sentiment: "Bearish",
  },
  {
    id: "education",
    name: "Education",
    icon: GraduationCap,
    change: 0.12,
    marketCap: "SAR 12B",
    topStocks: ["4290.SR", "4009.SR"],
    heatmap: "neutral",
    sentiment: "Neutral",
  },
];

const getHeatmapColor = (heatmap: string) => {
  switch (heatmap) {
    case "hot":
      return "from-signal-sell/30 to-signal-sell/10 border-signal-sell/50";
    case "warm":
      return "from-signal-hold/30 to-signal-hold/10 border-signal-hold/50";
    case "cool":
      return "from-noir-crimson-light/30 to-noir-crimson/10 border-noir-crimson-light/50";
    case "cold":
      return "from-noir-gray-dark/30 to-noir-gray-darker/10 border-noir-gray-dark/50";
    default:
      return "from-noir-crimson/20 to-noir-crimson/5 border-noir-crimson/30";
  }
};

const getSentimentColor = (sentiment: string) => {
  switch (sentiment) {
    case "Bullish":
      return "text-signal-buy bg-signal-buy/10";
    case "Bearish":
      return "text-signal-sell bg-signal-sell/10";
    default:
      return "text-signal-hold bg-signal-hold/10";
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4 },
  },
};

export default function SectorHubPage() {
  const { t, isRTL, locale } = useLanguage();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-bold text-noir-gray mb-2">
          {t.sectorHub.title}
        </h1>
        <p className="text-noir-gray-dark">
          {t.sectorHub.subtitle}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sectors.map((sector) => {
          const Icon = sector.icon;
          return (
            <motion.div key={sector.id} variants={itemVariants}>
              <Link href={`/${locale}/sectors/${sector.id}`}>
                <GlassCard
                  className={`p-5 bg-gradient-to-br ${getHeatmapColor(
                    sector.heatmap
                  )} interactive-glow cursor-pointer h-full hover:scale-[1.02] transition-transform`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-noir-dark/50 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-noir-crimson-light" />
                    </div>
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(
                          sector.sentiment
                        )}`}
                      >
                        {sector.sentiment === "Bullish" ? t.intelligence.bullish :
                         sector.sentiment === "Bearish" ? t.intelligence.bearish :
                         t.intelligence.neutral}
                      </span>
                      <ArrowRight className={`w-4 h-4 text-noir-gray-dark ${isRTL ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-noir-gray mb-2">
                    {/* @ts-expect-error - dynamic sector key lookup */}
                    {t.sectors[sector.id] || sector.name}
                  </h3>

                  <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {sector.change >= 0 ? (
                        <TrendingUp className={`w-4 h-4 text-signal-buy ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      ) : (
                        <TrendingDown className={`w-4 h-4 text-signal-sell ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      )}
                      <span
                        className={
                          sector.change >= 0
                            ? "text-signal-buy font-medium"
                            : "text-signal-sell font-medium"
                        }
                      >
                        {formatPercentage(sector.change)}
                      </span>
                    </div>
                    <span className="text-sm text-noir-gray-dark">
                      {sector.marketCap}
                    </span>
                  </div>

                  <div className="border-t border-noir-crimson/20 pt-3">
                    <div className="text-xs text-noir-gray-dark mb-2">
                      {t.sectorHub.topMovers}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sector.topStocks.map((stock) => (
                        <span
                          key={stock}
                          className="px-2 py-1 rounded bg-noir-dark/50 text-xs text-noir-gray"
                        >
                          {stock}
                        </span>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <motion.div variants={itemVariants} className="mt-8">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-noir-gray mb-4 flex items-center">
            <Activity className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'} text-noir-crimson-light`} />
            {t.sectorHub.sectorRotation}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg bg-noir-dark/30">
              <div className="text-sm text-noir-gray-dark mb-2">
                {t.sectorHub.leadingSectors} 🇸🇦
              </div>
              <div className="space-y-2">
                {[
                  { key: "energy", name: "Energy" },
                  { key: "technology", name: "Technology" },
                  { key: "healthcare", name: "Healthcare" }
                ].map((sector) => (
                  <div
                    key={sector.key}
                    className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    {/* @ts-expect-error - dynamic sector key lookup */}
                    <span className="text-noir-gray">{t.sectors[sector.key] || sector.name}</span>
                    <div className="w-24 h-2 bg-noir-dark rounded-full overflow-hidden">
                      <div className="h-full bg-signal-buy rounded-full" style={{ width: `${Math.random() * 40 + 60}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-noir-dark/30">
              <div className="text-sm text-noir-gray-dark mb-2">
                {t.sectorHub.laggingSectors} 🇸🇦
              </div>
              <div className="space-y-2">
                {[
                  { key: "consumer", name: "Consumer" },
                  { key: "realestate", name: "Real Estate" },
                  { key: "education", name: "Education" }
                ].map((sector) => (
                  <div
                    key={sector.key}
                    className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    {/* @ts-expect-error - dynamic sector key lookup */}
                    <span className="text-noir-gray">{t.sectors[sector.key] || sector.name}</span>
                    <div className="w-24 h-2 bg-noir-dark rounded-full overflow-hidden">
                      <div className="h-full bg-signal-sell rounded-full" style={{ width: `${Math.random() * 30 + 20}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-noir-dark/30">
              <div className="text-sm text-noir-gray-dark mb-2">
                {t.sectorHub.marketBreadth}
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-signal-buy mb-1">
                  68%
                </div>
                <div className="text-sm text-noir-gray-dark">
                  {t.sectorHub.advancingVsDeclining}
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
