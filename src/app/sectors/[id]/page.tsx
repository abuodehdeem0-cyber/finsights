"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Search,
  Loader2,
  Building2,
  Stethoscope,
  Cpu,
  Zap,
  ShoppingCart,
  Landmark,
  Truck,
  GraduationCap,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: string;
  currency: string;
  aiVerdict: "BUY" | "SELL" | "HOLD";
  aiLogic: string;
}

const sectorIcons: Record<string, React.ElementType> = {
  energy: Zap,
  technology: Cpu,
  finance: Landmark,
  healthcare: Stethoscope,
  consumer: ShoppingCart,
  industrial: Truck,
  realestate: Building2,
  education: GraduationCap,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function SectorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, isRTL, locale } = useLanguage();
  const sectorId = params.id as string;
  
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // @ts-expect-error - dynamic sector key lookup
  const sectorName = t.sectors?.[sectorId];
  // @ts-expect-error - dynamic sector key lookup
  const sectorDescription = t.sectors?.descriptions?.[sectorId];
  const SectorIcon = sectorIcons[sectorId];

  useEffect(() => {
    if (!sectorName) return;

    async function fetchSectorData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/sectors/${sectorId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch sector data");
        }
        
        const data = await response.json();
        setStocks(data.stocks);
      } catch (err) {
        setError(t.analysis?.errors?.fetchFailed || "Failed to load sector data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchSectorData();
  }, [sectorId, sectorName, t.analysis?.errors?.fetchFailed]);

  if (!sectorName || (!loading && !SectorIcon)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <GlassCard className="p-8 text-center">
          <h1 className="text-2xl font-bold text-noir-gray mb-4">
            {t.sectorHub?.sectorNotFound || "Sector Not Found"}
          </h1>
          <Link href={`/${locale}/sectors`} className="text-noir-crimson-light hover:underline">
            {t.sectorHub?.backToHub || "Back to Sector Hub"}
          </Link>
        </GlassCard>
      </div>
    );
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "BUY":
        return "bg-signal-buy/20 text-signal-buy border-signal-buy/50";
      case "SELL":
        return "bg-signal-sell/20 text-signal-sell border-signal-sell/50";
      default:
        return "bg-signal-hold/20 text-signal-hold border-signal-hold/50";
    }
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className={`w-4 h-4 text-signal-buy ${isRTL ? 'ml-1' : 'mr-1'}`} />;
    if (change < 0) return <TrendingDown className={`w-4 h-4 text-signal-sell ${isRTL ? 'ml-1' : 'mr-1'}`} />;
    return <Minus className={`w-4 h-4 text-signal-hold ${isRTL ? 'ml-1' : 'mr-1'}`} />;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      key={locale} // Re-animate on locale change
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <Link
          href={`/${locale}/sectors`}
          className={`inline-flex items-center text-noir-gray-dark hover:text-noir-gray mb-4 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
          {t.sectorHub?.backToSectors || "Back to Sectors"}
        </Link>
        
        <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-noir-crimson to-noir-crimson-light flex items-center justify-center glow-crimson flex-shrink-0">
            <SectorIcon className="w-8 h-8 text-noir-gray" />
          </div>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h1 className="text-3xl font-bold text-noir-gray">{sectorName}</h1>
            <p className="text-noir-gray-dark">{sectorDescription}</p>
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <motion.div variants={itemVariants}>
          <GlassCard className="p-8">
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-noir-crimson animate-spin mb-4" />
              <p className="text-noir-gray-dark">{t.sectorHub?.loadingSectorData || "Loading..."}</p>
              <p className="text-sm text-noir-gray-dark/60 mt-2 text-center">
                {t.sectorHub?.fetchingRealTime || "Fetching real-time data..."}
              </p>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Error State */}
      {error && !loading && (
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6 border-signal-sell/50 text-center">
            <p className="text-signal-sell">{error}</p>
          </GlassCard>
        </motion.div>
      )}

      {/* Stocks Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {stocks.map((stock) => (
            <motion.div key={stock.symbol} variants={itemVariants}>
              <GlassCard className="p-5 hover:border-noir-crimson/50 transition-all h-full flex flex-col">
                <div className={`flex items-start justify-between mb-4 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                  <div>
                    <h3 className="text-lg font-semibold text-noir-gray">
                      {stock.name}
                    </h3>
                    <span className="text-sm text-noir-gray-dark font-mono">
                      {stock.symbol}
                    </span>
                  </div>
                  <div className={isRTL ? 'text-left' : 'text-right'}>
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {getTrendIcon(stock.change)}
                      <span
                        className={
                          stock.change >= 0
                            ? "text-signal-buy font-medium"
                            : "text-signal-sell font-medium"
                        }
                      >
                        {stock.change >= 0 ? "+" : ""}
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                    <span className="text-sm text-noir-gray-dark">
                      {stock.currency === "SAR" ? (isRTL ? "ر.س " : "SAR ") : "$"}
                      {stock.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-sm text-noir-gray-dark">
                    {(t.stock?.marketCap || "Market Cap")}: {stock.marketCap}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getVerdictColor(
                      stock.aiVerdict
                    )}`}
                  >
                    {stock.aiVerdict === "BUY" ? (t.intelligence?.buySignal || "BUY") :
                     stock.aiVerdict === "SELL" ? (t.intelligence?.sellSignal || "SELL") :
                     (t.intelligence?.holdSignal || "HOLD")}
                  </span>
                </div>

                <div className="border-t border-noir-crimson/20 pt-4 mb-4 mt-auto">
                  <div className={`flex items-start gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <Sparkles className="w-4 h-4 text-noir-crimson-light flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-noir-gray-dark italic">
                      &ldquo;{stock.aiLogic}&rdquo;
                    </p>
                  </div>
                </div>

                <Link
                  href={`/${locale}/analysis?ticker=${encodeURIComponent(stock.symbol)}`}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-noir-crimson/20 hover:bg-noir-crimson/30 text-noir-crimson-light transition-colors text-sm font-medium ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <Search className="w-4 h-4" />
                  {t.sectorHub?.analyzeDeeply || "Analyze Deeply"}
                </Link>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
