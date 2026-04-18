"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  BarChart3,
  Globe,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { MarketChart } from "@/components/market-chart";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";

interface MarketIndex {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
  volume: string;
  currency: string;
  loading?: boolean;
}

interface PortfolioSummary {
  totalValue: number;
  dailyPnL: number;
  dailyPnLPercent: number;
  stocksValue: number;
  cashValue: number;
  loading: boolean;
}

interface ChartDataPoint {
  time: string;
  value: number;
  high?: number;
  low?: number;
  volume?: number;
}

// Index configurations with correct Yahoo Finance symbols
const INDEX_CONFIGS = [
  { name: "S&P 500", symbol: "^GSPC", currency: "USD" },
  { name: "NASDAQ", symbol: "^IXIC", currency: "USD" },
  { name: "DOW", symbol: "^DJI", currency: "USD" },
  { name: "TASI", symbol: "^TASI.SR", currency: "SAR" },
];

// Saudi top movers for Saudi market focus
const SAUDI_TOP_MOVERS = [
  { symbol: "2222.SR", name: "Saudi Aramco" },
  { symbol: "2010.SR", name: "SABIC" },
  { symbol: "1120.SR", name: "Al Rajhi Bank" },
  { symbol: "7010.SR", name: "STC" },
];

const TIMEFRAMES = ["1D", "1W", "1M", "1Y"] as const;
type Timeframe = typeof TIMEFRAMES[number];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.02 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2 },
  },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  
  // Market indices state
  const [indices, setIndices] = useState<MarketIndex[]>(
    INDEX_CONFIGS.map(cfg => ({ 
      name: cfg.name, 
      symbol: cfg.symbol, 
      value: 0, 
      change: 0, 
      changePercent: 0, 
      volume: "-",
      currency: cfg.currency,
      loading: true 
    }))
  );
  
  // Chart state
  const [timeframe, setTimeframe] = useState<Timeframe>("1D");
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartSymbol, setChartSymbol] = useState("^GSPC");
  
  // Top movers state
  const [topMovers, setTopMovers] = useState<Array<{
    symbol: string;
    name: string;
    price: number;
    change: number;
    loading?: boolean;
  }>>(SAUDI_TOP_MOVERS.map(s => ({ ...s, price: 0, change: 0, loading: true })));
  
  // Portfolio summary state
  const [portfolio, setPortfolio] = useState<PortfolioSummary>({
    totalValue: 0,
    dailyPnL: 0,
    dailyPnLPercent: 0,
    stocksValue: 0,
    cashValue: 24500, // Mock cash value
    loading: true,
  });

  // Fetch market indices
  const fetchIndices = useCallback(async () => {
    const updatedIndices = await Promise.all(
      INDEX_CONFIGS.map(async (config) => {
        try {
          const res = await fetch(`/api/market/quote?symbol=${encodeURIComponent(config.symbol)}`);
          if (res.ok) {
            const data = await res.json();
            return {
              name: config.name,
              symbol: config.symbol,
              value: data.price || 0,
              change: data.change || 0,
              changePercent: data.changePercent || 0,
              volume: data.volume ? formatVolume(data.volume) : "-",
              currency: config.currency,
              loading: false,
            };
          }
        } catch (error) {
          console.error(`Error fetching ${config.name}:`, error);
        }
        return {
          name: config.name,
          symbol: config.symbol,
          value: 0,
          change: 0,
          changePercent: 0,
          volume: "-",
          currency: config.currency,
          loading: false,
        };
      })
    );
    setIndices(updatedIndices);
  }, []);

  // Fetch chart data based on timeframe
  const fetchChartData = useCallback(async (tf: Timeframe, symbol: string = "^GSPC") => {
    setChartLoading(true);
    console.log(`[Chart Debug] Fetching data for ${symbol}, timeframe: ${tf}`);
    try {
      const res = await fetch(`/api/market/historical?symbol=${encodeURIComponent(symbol)}&timeframe=${tf}`);
      console.log(`[Chart Debug] Response status: ${res.status}`);
      
      if (res.ok) {
        const data = await res.json();
        console.log(`[Chart Debug] Response data:`, data);
        
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          console.log(`[Chart Debug] Setting chart data with ${data.data.length} points`);
          setChartData(data.data);
          setChartSymbol(symbol);
        } else {
          console.warn(`[Chart Debug] No data returned or empty array`);
          setChartData([]);
        }
      } else {
        console.error(`[Chart Debug] HTTP error: ${res.status}`);
        const errorText = await res.text();
        console.error(`[Chart Debug] Error response:`, errorText);
      }
    } catch (error) {
      console.error("[Chart Debug] Error fetching chart data:", error);
    } finally {
      setChartLoading(false);
    }
  }, []);

  // Fetch top movers
  const fetchTopMovers = useCallback(async () => {
    const updated = await Promise.all(
      SAUDI_TOP_MOVERS.map(async (stock) => {
        try {
          const res = await fetch(`/api/market/quote?symbol=${encodeURIComponent(stock.symbol)}`);
          if (res.ok) {
            const data = await res.json();
            return {
              ...stock,
              price: data.price || 0,
              change: data.changePercent || 0,
              loading: false,
            };
          }
        } catch (error) {
          console.error(`Error fetching ${stock.symbol}:`, error);
        }
        return { ...stock, price: 0, change: 0, loading: false };
      })
    );
    setTopMovers(updated);
  }, []);

  // Fetch portfolio summary
  const fetchPortfolioSummary = useCallback(async () => {
    if (!user) {
      setPortfolio(p => ({ ...p, loading: false }));
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/portfolio", {
        headers: { 
          "x-user-id": user.id, 
          "Authorization": `Bearer ${token}` 
        },
      });
      
      if (res.ok) {
        const positions = await res.json();
        
        let totalValue = 0;
        let dailyPnL = 0;
        
        // Fetch current prices for all positions
        const positionsWithPrices = await Promise.all(
          positions.map(async (pos: any) => {
            try {
              const quoteRes = await fetch(`/api/market/quote?symbol=${encodeURIComponent(pos.symbol)}`);
              if (quoteRes.ok) {
                const quote = await quoteRes.json();
                const currentPrice = quote.price || pos.avgPrice;
                const prevClose = quote.price - quote.change; // Approximate previous close
                const positionValue = pos.shares * currentPrice;
                const positionDailyPnL = pos.shares * quote.change;
                
                // Convert to USD if needed
                const conversionRate = pos.currency === "SAR" ? 1/3.75 : 1;
                totalValue += positionValue * conversionRate;
                dailyPnL += positionDailyPnL * conversionRate;
                
                return { ...pos, currentPrice };
              }
            } catch (error) {
              console.error(`Error fetching price for ${pos.symbol}:`, error);
            }
            return pos;
          })
        );
        
        const totalPnLPercent = totalValue > 0 ? (dailyPnL / totalValue) * 100 : 0;
        
        setPortfolio({
          totalValue,
          dailyPnL,
          dailyPnLPercent: totalPnLPercent,
          stocksValue: totalValue,
          cashValue: 24500, // Keep mock cash for now
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      setPortfolio(p => ({ ...p, loading: false }));
    }
  }, [user]);

  // Format volume helper
  function formatVolume(vol: number): string {
    if (vol >= 1000000000) return (vol / 1000000000).toFixed(1) + "B";
    if (vol >= 1000000) return (vol / 1000000).toFixed(1) + "M";
    if (vol >= 1000) return (vol / 1000).toFixed(1) + "K";
    return vol.toString();
  }

  // Initial data fetch
  useEffect(() => {
    fetchIndices();
    fetchChartData(timeframe);
    fetchTopMovers();
    fetchPortfolioSummary();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchIndices();
      fetchTopMovers();
      fetchPortfolioSummary();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [fetchIndices, fetchChartData, fetchTopMovers, fetchPortfolioSummary]);

  // Refetch chart when timeframe changes
  useEffect(() => {
    fetchChartData(timeframe, chartSymbol);
  }, [timeframe, chartSymbol, fetchChartData]);

  // Handle index click to change chart
  const handleIndexClick = (symbol: string) => {
    setChartSymbol(symbol);
    fetchChartData(timeframe, symbol);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-bold text-noir-gray mb-2">
          {t.dashboardPage.title}
        </h1>
        <p className="text-noir-gray-dark">
          {t.dashboardPage.subtitle}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {indices.map((index) => (
          <motion.div 
            key={index.name} 
            variants={itemVariants}
            onClick={() => handleIndexClick(index.symbol)}
            className="cursor-pointer"
          >
            <GlassCard className={`p-4 interactive-glow transition-all ${chartSymbol === index.symbol ? 'ring-2 ring-noir-crimson' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-noir-gray-dark">{index.name}</span>
                <Globe className="w-4 h-4 text-noir-crimson-light" />
              </div>
              <div className="text-2xl font-bold text-noir-gray mb-1">
                {index.loading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-noir-crimson" />
                ) : (
                  formatCurrency(index.value, index.currency as "USD" | "SAR")
                )}
              </div>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                {!index.loading && (
                  <>
                    {index.change >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-signal-buy" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-signal-sell" />
                    )}
                    <span
                      className={
                        index.change >= 0 ? "text-signal-buy" : "text-signal-sell"
                      }
                    >
                      {formatPercentage(index.changePercent)}
                    </span>
                    <span className="text-xs text-noir-gray-darker">
                      {t.dashboardPage.vol}: {index.volume}
                    </span>
                  </>
                )}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-noir-gray flex items-center">
                <Activity className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'} text-noir-crimson-light`} />
                {t.dashboardPage.marketPerformance}
              </h2>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {TIMEFRAMES.map((period) => (
                    <button
                      key={period}
                      onClick={() => setTimeframe(period)}
                      disabled={chartLoading}
                      className={`px-3 py-1 text-xs rounded-md transition-all ${
                        timeframe === period
                          ? "bg-noir-crimson text-noir-gray"
                          : "bg-noir-crimson/20 text-noir-gray-dark hover:bg-noir-crimson/40"
                      } ${chartLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {chartLoading && timeframe === period ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        period
                      )}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => fetchChartData(timeframe, chartSymbol)}
                  disabled={chartLoading}
                  className="p-1.5 rounded-md hover:bg-noir-crimson/20 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 text-noir-gray-dark ${chartLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            <MarketChart 
              data={chartData} 
              symbol={chartSymbol}
              loading={chartLoading}
              color="#6b1515"
            />
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <GlassCard className="p-6 h-full">
            <h2 className="text-lg font-semibold text-noir-gray mb-4 flex items-center">
              <BarChart3 className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'} text-noir-crimson-light`} />
              {t.dashboardPage.topMovers}
            </h2>
            <div className="space-y-4">
              {topMovers.map((stock) => (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between p-3 rounded-lg bg-noir-dark/50 hover:bg-noir-crimson/10 transition-colors cursor-pointer"
                >
                  <div>
                    <div className="font-medium text-noir-gray">
                      {stock.symbol}
                    </div>
                    <div className="text-xs text-noir-gray-dark">
                      {stock.name}
                    </div>
                  </div>
                  <div className="text-right">
                    {stock.loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-noir-crimson ml-auto" />
                    ) : (
                      <>
                        <div className="font-medium text-noir-gray">
                          {formatCurrency(stock.price, "SAR")}
                        </div>
                        <div
                          className={
                            stock.change >= 0
                              ? "text-xs text-signal-buy"
                              : "text-xs text-signal-sell"
                          }
                        >
                          {stock.change >= 0 ? "+" : ""}
                          {stock.change.toFixed(2)}%
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-noir-gray flex items-center">
              <DollarSign className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'} text-noir-crimson-light`} />
              {t.dashboardPage.portfolioSummary}
            </h2>
            <div className="flex items-center space-x-4">
            {portfolio.loading ? (
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                <Loader2 className="w-5 h-5 animate-spin text-noir-crimson" />
                <span className="text-noir-gray-dark">{t.dashboardPage.loadingPortfolio}</span>
              </div>
            ) : (
              <>
                <div className="text-right">
                  <div className="text-sm text-noir-gray-dark">{t.dashboard.totalValue}</div>
                  <div className="text-2xl font-bold text-noir-gray">
                    {formatCurrency(portfolio.totalValue)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-noir-gray-dark">{t.dashboard.dailyPL}</div>
                  <div className={`text-lg font-semibold ${portfolio.dailyPnL >= 0 ? 'text-signal-buy' : 'text-signal-sell'}`}>
                    {portfolio.dailyPnL >= 0 ? '+' : ''}
                    {formatCurrency(portfolio.dailyPnL)} ({formatPercentage(portfolio.dailyPnLPercent)})
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {portfolio.loading ? (
            <div className="col-span-3 flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-noir-crimson" />
            </div>
          ) : (
            [
              { label: t.dashboard.cash, value: portfolio.cashValue, color: "bg-noir-gray-darker" },
              { label: t.dashboard.stocks, value: portfolio.stocksValue, color: "bg-noir-crimson" },
              { label: t.dashboard.other, value: 0, color: "bg-noir-crimson-light" },
            ].map((item) => {
              const total = portfolio.totalValue + portfolio.cashValue;
              const percentage = total > 0 ? (item.value / total) * 100 : 0;
              return (
                <div key={item.label} className="text-center">
                  <div className="h-2 rounded-full mb-2 bg-noir-dark overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    />
                  </div>
                  <div className="text-sm text-noir-gray-dark">{item.label}</div>
                  <div className="font-medium text-noir-gray">
                    {formatCurrency(item.value)}
                  </div>
                  <div className="text-xs text-noir-gray-darker">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              );
            })
          )}
        </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
