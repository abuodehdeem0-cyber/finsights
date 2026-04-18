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
  DollarSign,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import Link from "next/link";

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

interface SectorInfo {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
}

const sectorMap: Record<string, SectorInfo> = {
  energy: {
    id: "energy",
    name: "Energy",
    icon: Zap,
    description: "Oil, gas, and renewable energy companies",
  },
  technology: {
    id: "technology",
    name: "Technology",
    icon: Cpu,
    description: "Tech giants and semiconductor leaders",
  },
  finance: {
    id: "finance",
    name: "Finance",
    icon: Landmark,
    description: "Banks, investment firms, and financial services",
  },
  healthcare: {
    id: "healthcare",
    name: "Healthcare",
    icon: Stethoscope,
    description: "Pharmaceuticals, biotech, and medical services",
  },
  consumer: {
    id: "consumer",
    name: "Consumer",
    icon: ShoppingCart,
    description: "Retail, e-commerce, and consumer goods",
  },
  industrial: {
    id: "industrial",
    name: "Industrial",
    icon: Truck,
    description: "Manufacturing, logistics, and heavy industry",
  },
  realestate: {
    id: "realestate",
    name: "Real Estate",
    icon: Building2,
    description: "REITs and property investment",
  },
  education: {
    id: "education",
    name: "Education",
    icon: GraduationCap,
    description: "EdTech and learning platforms",
  },
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
  const sectorId = params.id as string;
  
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sector = sectorMap[sectorId];

  useEffect(() => {
    if (!sector) return;

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
        setError("Failed to load sector data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchSectorData();
  }, [sectorId, sector]);

  if (!sector) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <GlassCard className="p-8 text-center">
          <h1 className="text-2xl font-bold text-noir-gray mb-4">
            Sector Not Found
          </h1>
          <Link href="/sectors" className="text-noir-crimson-light hover:underline">
            Back to Sector Hub
          </Link>
        </GlassCard>
      </div>
    );
  }

  const SectorIcon = sector.icon;

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
    if (change > 0) return <TrendingUp className="w-4 h-4 text-signal-buy" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-signal-sell" />;
    return <Minus className="w-4 h-4 text-signal-hold" />;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <Link
          href="/sectors"
          className="inline-flex items-center text-noir-gray-dark hover:text-noir-gray mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sectors
        </Link>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-noir-crimson to-noir-crimsonLight flex items-center justify-center glow-crimson">
            <SectorIcon className="w-8 h-8 text-noir-gray" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-noir-gray">{sector.name}</h1>
            <p className="text-noir-gray-dark">{sector.description}</p>
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <motion.div variants={itemVariants}>
          <GlassCard className="p-8">
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-noir-crimson animate-spin mb-4" />
              <p className="text-noir-gray-dark">Loading sector data...</p>
              <p className="text-sm text-noir-gray-dark/60 mt-2">
                Fetching real-time prices and AI analysis
              </p>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Error State */}
      {error && !loading && (
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6 border-signal-sell/50">
            <p className="text-signal-sell">{error}</p>
          </GlassCard>
        </motion.div>
      )}

      {/* Stocks Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {stocks.map((stock) => (
            <motion.div key={stock.symbol} variants={itemVariants}>
              <GlassCard className="p-5 hover:border-noir-crimson/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-noir-gray">
                      {stock.name}
                    </h3>
                    <span className="text-sm text-noir-gray-dark font-mono">
                      {stock.symbol}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
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
                      {stock.currency === "SAR" ? "ر.س " : "$"}
                      {stock.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-noir-gray-dark">
                    Market Cap: {stock.marketCap}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getVerdictColor(
                      stock.aiVerdict
                    )}`}
                  >
                    {stock.aiVerdict}
                  </span>
                </div>

                <div className="border-t border-noir-crimson/20 pt-4 mb-4">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-noir-crimson-light flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-noir-gray-dark italic">
                      &ldquo;{stock.aiLogic}&rdquo;
                    </p>
                  </div>
                </div>

                <Link
                  href={`/analysis?ticker=${encodeURIComponent(stock.symbol)}`}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-noir-crimson/20 hover:bg-noir-crimson/30 text-noir-crimson-light transition-colors text-sm font-medium"
                >
                  <Search className="w-4 h-4" />
                  Analyze Deeply
                </Link>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
