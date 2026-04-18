"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  DollarSign,
  Coins,
  RefreshCw,
  X,
  Sparkles,
  AlertTriangle,
  Loader2,
  Search,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { showToast } from "@/components/toast";

interface Holding {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  change: number;
  changePercent: number;
  currency: "USD" | "SAR";
  aiVerdict?: "BUY" | "SELL" | "HOLD";
  aiLogic?: string;
}

interface Position {
  id: string;
  symbol: string;
  shares: number;
  avgPrice: number;
  currency: string;
}

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
    transition: { duration: 0.5 },
  },
};

// Saudi company names
const saudiNames: Record<string, string> = {
  "2222.SR": "Saudi Aramco",
  "2010.SR": "SABIC",
  "2030.SR": "Saudi Electricity",
  "3040.SR": "ACWA Power",
  "7010.SR": "STC",
  "7020.SR": "Mobily",
  "7030.SR": "Zain KSA",
  "7200.SR": "Solutions by STC",
  "1120.SR": "Al Rajhi Bank",
  "1010.SR": "Saudi National Bank",
  "1020.SR": "Riyad Bank",
  "1050.SR": "Alinma Bank",
  "2070.SR": "Dr. Sulaiman Al Habib",
  "1211.SR": "Ma'aden",
  "4001.SR": "Almarai",
  "4150.SR": "Dar Al Arkan",
};

function getCompanyName(symbol: string): string {
  if (symbol.endsWith(".SR")) {
    return saudiNames[symbol] || symbol;
  }
  return symbol;
}

export default function PortfolioPage() {
  const { user, isLoading: authLoading, forceSignOut } = useAuth();
  const router = useRouter();
  const { isRTL, t } = useLanguage();
  const [currency, setCurrency] = useState<"USD" | "SAR">("USD");
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  
  // Timeout for auth loading
  const [authTimeout, setAuthTimeout] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  
  // Ensure client-side only rendering for RTL
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Modal form state
  const [newSymbol, setNewSymbol] = useState("");
  const [newShares, setNewShares] = useState("");
  const [newAvgPrice, setNewAvgPrice] = useState("");
  const [newCurrency, setNewCurrency] = useState<"USD" | "SAR">("USD");
  const [addingPosition, setAddingPosition] = useState(false);
  const [addError, setAddError] = useState("");

  // Auth timeout - if auth takes too long, show retry option
  useEffect(() => {
    if (authLoading) {
      // Always show skeleton for at least 1 second for smooth UX
      const skeletonTimer = setTimeout(() => {
        setShowSkeleton(false);
      }, 1000);
      
      // Show error after 5 seconds
      const errorTimer = setTimeout(() => {
        console.log("[Portfolio] Auth loading timeout reached");
        setAuthTimeout(true);
        setLoadError(t.messages.tryAgain || "Loading took too long. Please try again.");
      }, 5000);
      
      return () => {
        clearTimeout(skeletonTimer);
        clearTimeout(errorTimer);
      };
    } else {
      // Auth resolved - hide skeleton smoothly
      setTimeout(() => setShowSkeleton(false), 500);
    }
  }, [authLoading, t]);

  // Client-side auth protection - wait for auth to resolve, don't redirect during loading
  useEffect(() => {
    // Wait for auth to finish loading - DO NOT redirect while auth is resolving
    if (authLoading) {
      console.log("[Portfolio] Auth still loading, waiting...");
      return;
    }
    
    // Auth has finished loading - check result
    if (!user) {
      console.log("[Portfolio] No authenticated user found");
      // Only redirect if we haven't already timed out (timeout has its own UI)
      if (!authTimeout) {
        console.log("[Portfolio] Redirecting to login");
        showToast(t.messages.authRequired, "warning");
        const locale = isRTL ? 'ar' : 'en';
        const currentPath = window.location.pathname;
        router.push(`/${locale}/login?message=auth_required&redirect=${encodeURIComponent(currentPath)}`);
      }
    } else {
      console.log("[Portfolio] User authenticated:", user.email);
      // Clear any previous load errors
      setLoadError(null);
    }
  }, [user, authLoading, router, isRTL, t, authTimeout]);

  // Fetch positions from database - ENHANCED DEBUGGING
  const fetchPositions = useCallback(async () => {
    console.log("[Portfolio] ==========================================");
    console.log("[Portfolio] FETCH POSITIONS CALLED");
    console.log("[Portfolio] User:", user?.email || "null");
    console.log("[Portfolio] User ID:", user?.id || "null");
    
    if (!user) {
      console.error("[Portfolio] ❌ No user, cannot fetch positions");
      setLoadError(isRTL ? "لم يتم تسجيل الدخول" : "Not logged in");
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      console.log("[Portfolio] Token from localStorage:", token ? `Found (${token.substring(0, 20)}...)` : "❌ NOT FOUND");
      console.log("[Portfolio] User ID for header:", user.id);
      
      const requestHeaders = {
        "x-user-id": user.id,
        "Authorization": `Bearer ${token || ""}`,
        "Content-Type": "application/json"
      };
      console.log("[Portfolio] Request headers:", JSON.stringify(requestHeaders, null, 2));
      
      console.log("[Portfolio] Making fetch request to /api/portfolio...");
      const response = await fetch("/api/portfolio", {
        method: "GET",
        headers: requestHeaders,
      });
      
      console.log("[Portfolio] Response received:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (response.ok) {
        const contentType = response.headers.get("content-type");
        console.log("[Portfolio] Content-Type:", contentType);
        
        let data;
        try {
          data = await response.json();
          console.log("[Portfolio] ✅ JSON parsed successfully");
        } catch (parseError) {
          console.error("[Portfolio] ❌ JSON parse error:", parseError);
          const text = await response.text();
          console.error("[Portfolio] Raw response:", text.substring(0, 500));
          setLoadError(isRTL 
            ? "خطأ في تحليل البيانات (JSON). تحقق من وحدة التحكم." 
            : "JSON parse error. Check console.");
          setLoading(false);
          return;
        }
        
        console.log("[Portfolio] ✅ Positions loaded:", Array.isArray(data) ? data.length : "invalid data", data);
        setPositions(Array.isArray(data) ? data : []);
        setLoadError(null);
      } else if (response.status === 401) {
        console.error("[Portfolio] ❌ 401 UNAUTHORIZED - Session expired or invalid token");
        console.log("[Portfolio] Token that failed:", token?.substring(0, 30));
        setLoadError(isRTL ? "انتهت صلاحية الجلسة (401). يرجى تسجيل الدخول." : "Session expired (401). Please login.");
        // Clear stale localStorage
        console.log("[Portfolio] Clearing stale localStorage due to 401");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        forceSignOut();
      } else {
        const errorText = await response.text();
        console.error("[Portfolio] ❌ HTTP Error:", response.status, response.statusText);
        console.error("[Portfolio] Error response body:", errorText.substring(0, 500));
        
        if (response.status >= 500) {
          setLoadError(isRTL 
            ? `خطأ في الخادم (${response.status}). قاعدة البيانات قد تكون معطلة.` 
            : `Server error (${response.status}). Database may be down.`);
        } else {
          setLoadError(`${isRTL ? "خطأ" : "Error"} ${response.status}: ${errorText.substring(0, 100)}`);
        }
      }
    } catch (error) {
      console.error("[Portfolio] ❌ FETCH EXCEPTION:", error);
      console.error("[Portfolio] Error name:", (error as Error).name);
      console.error("[Portfolio] Error message:", (error as Error).message);
      console.error("[Portfolio] Error stack:", (error as Error).stack);
      
      setLoadError(isRTL 
        ? `خطأ شبكة: ${(error as Error).message}` 
        : `Network error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
      console.log("[Portfolio] ==========================================");
    }
  }, [user, isRTL, forceSignOut]);

  // Fetch live prices and enrich holdings
  const fetchLivePrices = useCallback(async () => {
    console.log("[Portfolio] Fetching live prices for", positions.length, "positions");
    
    if (positions.length === 0) {
      console.log("[Portfolio] No positions, clearing holdings");
      setHoldings([]);
      setLoading(false);
      return;
    }

    setRefreshing(true);
    
    try {
      const enrichedHoldings: Holding[] = await Promise.all(
        positions.map(async (pos) => {
          try {
            // Fetch current price
            console.log(`[Portfolio] Fetching quote for ${pos.symbol}`);
            const res = await fetch(`/api/market/quote?symbol=${encodeURIComponent(pos.symbol)}`);
            const data = res.ok ? await res.json() : null;
            
            if (!res.ok) {
              console.warn(`[Portfolio] Failed to fetch ${pos.symbol}:`, res.status);
            }
            
            const currentPrice = data?.price || pos.avgPrice;
            const change = data?.change || 0;
            const changePercent = data?.changePercent || 0;
            
            // Get AI recommendation
            const pnl = (currentPrice - pos.avgPrice) / pos.avgPrice * 100;
            let aiVerdict: "BUY" | "SELL" | "HOLD" = "HOLD";
            let aiLogic = "Neutral market signals";
            
            if (pnl > 10) {
              aiVerdict = "SELL";
              aiLogic = "Take profits on strong gains";
            } else if (pnl < -15) {
              aiVerdict = "BUY";
              aiLogic = "Average down on oversold conditions";
            } else if (pnl > 0 && changePercent > 0) {
              aiVerdict = "HOLD";
              aiLogic = "Momentum positive, maintain position";
            } else if (pnl < 0 && changePercent < 0) {
              aiVerdict = "HOLD";
              aiLogic = "Avoid panic selling during weakness";
            }
            
            return {
              id: pos.id,
              symbol: pos.symbol,
              name: getCompanyName(pos.symbol),
              shares: pos.shares,
              avgPrice: pos.avgPrice,
              currentPrice,
              change,
              changePercent,
              currency: pos.currency as "USD" | "SAR",
              aiVerdict,
              aiLogic,
            };
          } catch (error) {
            console.error(`Error fetching ${pos.symbol}:`, error);
            return {
              id: pos.id,
              symbol: pos.symbol,
              name: getCompanyName(pos.symbol),
              shares: pos.shares,
              avgPrice: pos.avgPrice,
              currentPrice: pos.avgPrice,
              change: 0,
              changePercent: 0,
              currency: pos.currency as "USD" | "SAR",
              aiVerdict: "HOLD",
              aiLogic: "Data unavailable",
            };
          }
        })
      );
      
      setHoldings(enrichedHoldings);
    } catch (error) {
      console.error("Error enriching holdings:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [positions]);

  // Initial load
  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  // Fetch prices when positions change
  useEffect(() => {
    fetchLivePrices();
  }, [fetchLivePrices]);

  // Auto-detect currency from symbol
  useEffect(() => {
    const clean = newSymbol.trim();
    if (/^\d{4}$/.test(clean) || clean.endsWith(".SR")) {
      setNewCurrency("SAR");
    } else if (clean.length > 0 && !clean.endsWith(".SR")) {
      setNewCurrency("USD");
    }
  }, [newSymbol]);

  const calculateValue = (holding: Holding) => {
    const value = holding.shares * holding.currentPrice;
    if (currency === holding.currency) return value;
    if (currency === "USD" && holding.currency === "SAR") return value / 3.75;
    if (currency === "SAR" && holding.currency === "USD") return value * 3.75;
    return value;
  };

  const calculateCost = (holding: Holding) => {
    const cost = holding.shares * holding.avgPrice;
    if (currency === holding.currency) return cost;
    if (currency === "USD" && holding.currency === "SAR") return cost / 3.75;
    if (currency === "SAR" && holding.currency === "USD") return cost * 3.75;
    return cost;
  };

  const totalValue = holdings.reduce((sum, h) => sum + calculateValue(h), 0);
  const totalCost = holdings.reduce((sum, h) => sum + calculateCost(h), 0);
  const totalPnL = totalValue - totalCost;
  const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;
  
  const dayPnL = holdings.reduce((sum, h) => {
    const dayChange = h.shares * h.change;
    if (currency === h.currency) return sum + dayChange;
    if (currency === "USD" && h.currency === "SAR") return sum + dayChange / 3.75;
    if (currency === "SAR" && h.currency === "USD") return sum + dayChange * 3.75;
    return sum + dayChange;
  }, 0);
  const dayPnLPercent = totalCost > 0 ? (dayPnL / totalCost) * 100 : 0;

  const handleAddPosition = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    
    if (!user) {
      setAddError("Please login first");
      return;
    }
    
    if (!newSymbol || !newShares || !newAvgPrice) {
      setAddError("All fields are required");
      return;
    }
    
    setAddingPosition(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol: newSymbol,
          shares: parseFloat(newShares),
          avgPrice: parseFloat(newAvgPrice),
          currency: newCurrency,
        }),
      });
      
      if (response.ok) {
        setShowModal(false);
        setNewSymbol("");
        setNewShares("");
        setNewAvgPrice("");
        setNewCurrency("USD");
        fetchPositions();
      } else {
        const data = await response.json();
        setAddError(data.error || "Failed to add position");
      }
    } catch (error) {
      setAddError("Network error");
    } finally {
      setAddingPosition(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    
    setDeleteLoading(id);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/portfolio?id=${id}`, {
        method: "DELETE",
        headers: {
          "x-user-id": user.id,
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        setPositions(positions.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error("Error deleting position:", error);
    } finally {
      setDeleteLoading(null);
    }
  };

  const getVerdictColor = (verdict?: string) => {
    switch (verdict) {
      case "BUY": return "bg-signal-buy/20 text-signal-buy border-signal-buy/50";
      case "SELL": return "bg-signal-sell/20 text-signal-sell border-signal-sell/50";
      default: return "bg-signal-hold/20 text-signal-hold border-signal-hold/50";
    }
  };

  // Show skeleton loading state while checking auth - DO NOT redirect during loading
  if (authLoading || showSkeleton) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error Message only shown after timeout */}
          {authTimeout && (
            <div className="mb-8 p-6 glass-card rounded-xl border border-signal-sell/30">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-signal-sell/20 flex items-center justify-center mb-4">
                  <span className="text-signal-sell text-2xl">!</span>
                </div>
                <h3 className="text-lg font-semibold text-noir-gray mb-2">
                  {loadError || (isRTL ? "فشل التحميل" : "Failed to Load")}
                </h3>
                <p className="text-sm text-noir-gray-dark mb-4 max-w-md">
                  {isRTL 
                    ? "حدث خطأ في تحميل البيانات. يمكنك المحاولة مرة أخرى أو تسجيل الخروج وإعادة تسجيل الدخول."
                    : "There was an error loading your data. You can try again, or sign out and sign back in."}
                </p>
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="btn-crimson px-6 py-2 rounded-lg"
                  >
                    {t.messages?.tryAgain || "Retry"}
                  </button>
                  <button
                    onClick={clearDataAndReload}
                    className="px-6 py-2 rounded-lg border border-signal-hold/50 text-signal-hold hover:bg-signal-hold/20"
                  >
                    {isRTL ? "مسح البيانات وإعادة المحاولة" : "Clear Data & Reload"}
                  </button>
                  <button
                    onClick={() => router.push(`/${isRTL ? 'ar' : 'en'}/login`)}
                    className="px-6 py-2 rounded-lg border border-noir-crimson/30 text-noir-gray hover:bg-noir-crimson/20"
                  >
                    {t.nav?.login || "Go to Login"}
                  </button>
                  <button
                    onClick={forceSignOut}
                    className="px-6 py-2 rounded-lg border border-signal-sell/50 text-signal-sell hover:bg-signal-sell/20"
                  >
                    {isRTL ? "تسجيل الخروج الإجباري" : "Force Sign Out"}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Skeleton Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-noir-crimson/20 rounded animate-pulse" />
              <div className="h-4 w-64 bg-noir-crimson/10 rounded animate-pulse" />
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-noir-crimson/20 rounded-lg animate-pulse" />
              <div className="h-10 w-24 bg-noir-crimson/20 rounded-lg animate-pulse" />
            </div>
          </div>
          
          {/* Skeleton Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6 rounded-xl">
                <div className="h-4 w-24 bg-noir-crimson/20 rounded mb-4 animate-pulse" />
                <div className="h-8 w-32 bg-noir-crimson/30 rounded animate-pulse" />
              </div>
            ))}
          </div>
          
          {/* Skeleton Table */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-noir-crimson/20">
              <div className="h-6 w-32 bg-noir-crimson/20 rounded animate-pulse" />
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 border-b border-noir-crimson/10 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-noir-crimson/20 rounded-lg animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-noir-crimson/20 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-noir-crimson/10 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-4 w-20 bg-noir-crimson/20 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Will be redirected by useEffect, but show loading state just in case
  if (!user && !authTimeout) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-noir-crimson border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-noir-gray-dark animate-pulse mb-4">{t.messages.loading}</p>
          <p className="text-sm text-noir-gray-dark/60 max-w-xs mx-auto">
            {isRTL 
              ? "جاري التحقق من الجلسة... إذا استمر هذا، انقر على \"تسجيل الخروج الإجباري\" أدناه."
              : "Verifying session... If this persists, click 'Force Sign Out' below."}
          </p>
          <button
            onClick={forceSignOut}
            className="mt-6 px-4 py-2 rounded-lg border border-signal-sell/50 text-signal-sell hover:bg-signal-sell/20 text-sm"
          >
            {isRTL ? "تسجيل الخروج الإجباري" : "Force Sign Out"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-noir-gray">
              {t.portfolio?.title || "Portfolio"}
            </h1>
            <p className="text-noir-gray-dark">
              {t.portfolio?.subtitle || "Track your investments with dual-currency support"}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => fetchLivePrices()}
              disabled={refreshing}
              className="p-2 rounded-lg glass-card hover:bg-noir-crimson/20 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 text-noir-crimson-light ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <div className="glass-card rounded-lg p-1 flex">
              <button
                onClick={() => setCurrency("USD")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  currency === "USD"
                    ? "bg-noir-crimson text-noir-gray"
                    : "text-noir-gray-dark hover:text-noir-gray"
                }`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setCurrency("SAR")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  currency === "SAR"
                    ? "bg-noir-crimson text-noir-gray"
                    : "text-noir-gray-dark hover:text-noir-gray"
                }`}
              >
                SAR (ر.س)
              </button>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="btn-crimson px-4 py-2 rounded-lg flex items-center"
            >
              <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t.portfolio?.addPosition || "Add Position"}
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div variants={itemVariants}>
            <GlassCard className="p-6 glow-crimson">
              <div className="flex items-center justify-between mb-4">
                <span className="text-noir-gray-dark">{t.portfolio?.title || 'Total Value'}</span>
                <Wallet className="w-5 h-5 text-noir-crimson-light" />
              </div>
              <div className="text-3xl font-bold text-noir-gray">
                {formatCurrency(totalValue, currency)}
              </div>
              <div className="text-sm text-noir-gray-dark mt-1">
                {positions.length} {positions.length !== 1 ? (t.common?.positions || 'positions') : (t.common?.position || 'position')}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-noir-gray-dark">{t.portfolio?.totalPL || "Total P/L"}</span>
                {totalPnL >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-signal-buy" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-signal-sell" />
                )}
              </div>
              <div
                className={`text-3xl font-bold ${
                  totalPnL >= 0 ? "text-signal-buy" : "text-signal-sell"
                }`}
              >
                {totalPnL >= 0 ? "+" : ""}
                {formatCurrency(totalPnL, currency)}
              </div>
              <div
                className={`text-sm mt-1 ${
                  totalPnL >= 0 ? "text-signal-buy" : "text-signal-sell"
                }`}
              >
                {formatPercentage(totalPnLPercent)}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-noir-gray-dark">{t.portfolio?.dayPL || "Day P/L"}</span>
                <RefreshCw className="w-5 h-5 text-noir-crimson-light" />
              </div>
              <div className={`text-3xl font-bold ${dayPnL >= 0 ? "text-signal-buy" : "text-signal-sell"}`}>
                {dayPnL >= 0 ? "+" : ""}
                {formatCurrency(dayPnL, currency)}
              </div>
              <div className={`text-sm mt-1 ${dayPnL >= 0 ? "text-signal-buy" : "text-signal-sell"}`}>
                {formatPercentage(dayPnLPercent)}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        <motion.div variants={itemVariants}>
          <GlassCard className="overflow-hidden">
          <div className="p-6 border-b border-noir-crimson/30">
            <h2 className="text-lg font-semibold text-noir-gray">
              {t.portfolio?.holdings || 'Holdings'}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="bg-noir-dark/50">
                  <th className={`p-4 text-sm font-medium text-noir-gray-dark w-[18%] ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t.portfolio?.symbol || 'Symbol'}
                  </th>
                  <th className={`p-4 text-sm font-medium text-noir-gray-dark w-[10%] ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t.portfolio?.shares || 'Shares'}
                  </th>
                  <th className={`p-4 text-sm font-medium text-noir-gray-dark w-[12%] ${isRTL ? 'text-left' : 'text-right'}`}>
                    {t.portfolio?.avgPrice || 'Avg Price'}
                  </th>
                  <th className={`p-4 text-sm font-medium text-noir-gray-dark w-[12%] ${isRTL ? 'text-left' : 'text-right'}`}>
                    {t.portfolio?.currentPrice || 'Current'}
                  </th>
                  <th className={`p-4 text-sm font-medium text-noir-gray-dark w-[12%] ${isRTL ? 'text-left' : 'text-right'}`}>
                    {t.portfolio?.value || 'Value'}
                  </th>
                  <th className={`p-4 text-sm font-medium text-noir-gray-dark w-[14%] ${isRTL ? 'text-left' : 'text-right'}`}>
                    {t.portfolio?.dayChange || 'Day Change'}
                  </th>
                  <th className={`p-4 text-sm font-medium text-noir-gray-dark w-[14%] text-center`}>
                    {t.portfolio?.totalReturn || 'Total Return'}
                  </th>
                  <th className={`p-4 text-sm font-medium text-noir-gray-dark w-[8%] text-center`}>
                    {t.portfolio?.actions || 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding) => {
                  const value = calculateValue(holding);
                  const cost = calculateCost(holding);
                  const pnl = value - cost;
                  const pnlPercent = ((holding.currentPrice - holding.avgPrice) / holding.avgPrice) * 100;

                  return (
                    <tr
                      key={holding.id}
                      className="border-b border-noir-crimson/10 hover:bg-noir-crimson/5 transition-colors"
                    >
                      <td className={`p-4 w-[18%] ${isRTL ? 'text-right' : 'text-left'}`}>
                        <div className="font-medium text-noir-gray">
                          {holding.symbol}
                        </div>
                        <div className="text-sm text-noir-gray-dark">
                          {holding.name}
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs bg-noir-crimson/20 text-noir-gray-dark mt-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Coins className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                          {holding.currency}
                        </span>
                      </td>
                      <td className={`p-4 text-noir-gray w-[10%] ${isRTL ? 'text-right' : 'text-left'}`}>
                        {holding.shares.toLocaleString()}
                      </td>
                      <td className={`p-4 text-noir-gray w-[12%] ${isRTL ? 'text-left' : 'text-right'}`}>
                        {formatCurrency(holding.avgPrice, holding.currency)}
                      </td>
                      <td className={`p-4 text-noir-gray w-[12%] ${isRTL ? 'text-left' : 'text-right'}`}>
                        {formatCurrency(holding.currentPrice, holding.currency)}
                      </td>
                      <td className={`p-4 font-medium text-noir-gray w-[12%] ${isRTL ? 'text-left' : 'text-right'}`}>
                        {formatCurrency(value, currency)}
                      </td>
                      <td className={`p-4 w-[14%] ${isRTL ? 'text-left' : 'text-right'}`}>
                        <div
                          className={
                            pnl >= 0 ? "text-signal-buy" : "text-signal-sell"
                          }
                        >
                          {pnl >= 0 ? "+" : ""}
                          {formatCurrency(pnl, currency)}
                        </div>
                        <div
                          className={`text-sm ${
                            pnlPercent >= 0
                              ? "text-signal-buy"
                              : "text-signal-sell"
                          }`}
                        >
                          {formatPercentage(pnlPercent)}
                        </div>
                      </td>
                      <td className="p-4 w-[14%] text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getVerdictColor(holding.aiVerdict)}`}>
                            {holding.aiVerdict === "BUY" ? t.intelligence?.buySignal || "BUY" :
                             holding.aiVerdict === "SELL" ? t.intelligence?.sellSignal || "SELL" :
                             holding.aiVerdict === "HOLD" ? t.intelligence?.holdSignal || "HOLD" :
                             holding.aiVerdict}
                          </span>
                          <span className="text-xs text-noir-gray-dark max-w-[120px] truncate" title={holding.aiLogic}>
                            {holding.aiLogic}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 w-[8%] text-center">
                        <button 
                          onClick={() => handleDelete(holding.id)}
                          disabled={deleteLoading === holding.id}
                          className="p-2 rounded-lg hover:bg-signal-sell/20 text-signal-sell transition-colors disabled:opacity-50"
                        >
                          {deleteLoading === holding.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {loading && (
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 text-noir-crimson animate-spin mx-auto mb-4" />
                <p className="text-noir-gray-dark">{t.portfolio?.loadingPortfolio || 'Loading your portfolio...'}</p>
              </div>
            )}
            
            {!loading && holdings.length === 0 && (
              <div className="p-8 text-center">
                <Wallet className="w-12 h-12 text-noir-gray-dark mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-noir-gray">
                  {t.portfolio?.holdings || 'Holdings'}
                </h2>
                <button 
                  onClick={() => setShowModal(true)}
                  className="text-noir-crimson-light hover:underline"
                >
                  {t.portfolio?.addPosition || 'Add Position'}
                </button>
              </div>
            )}
          </div>
          </GlassCard>
        </motion.div>
// ... (rest of the code remains the same)
      </motion.div>

      {/* Add Position Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-noir-gray">{t.portfolio?.addPosition || 'Add Position'}</h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-noir-crimson/20 transition-colors"
                >
                  <X className="w-5 h-5 text-noir-gray-dark" />
                </button>
              </div>
              
              <form onSubmit={handleAddPosition} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-noir-gray-dark mb-2">
                    {t.portfolio?.tickerSymbol || 'Ticker Symbol'}
                  </label>
                  <div className="relative">
                    <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-noir-gray-dark`} />
                    <input
                      type="text"
                      value={newSymbol}
                      onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                      placeholder={t.portfolio?.tickerPlaceholder || 'e.g. 2222 (Saudi) or AAPL (US)'}
                      className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 rounded-lg bg-noir-dark/50 border border-noir-crimson/30 text-noir-gray placeholder:text-noir-gray-darker focus:outline-none focus:border-noir-crimson-light`}
                    />
                  </div>
                  <p className="text-xs text-noir-gray-dark mt-1">
                    {t.portfolio?.autoDetect || '4-digit numbers auto-detect as Saudi stocks (.SR)'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-noir-gray-dark mb-2">
                      {t.portfolio?.shares || 'Shares'}
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={newShares}
                      onChange={(e) => setNewShares(e.target.value)}
                      placeholder="100"
                      className="w-full px-4 py-3 rounded-lg bg-noir-dark/50 border border-noir-crimson/30 text-noir-gray placeholder:text-noir-gray-darker focus:outline-none focus:border-noir-crimson-light"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-noir-gray-dark mb-2">
                      {t.portfolio?.avgBuyPrice || 'Avg Buy Price'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newAvgPrice}
                      onChange={(e) => setNewAvgPrice(e.target.value)}
                      placeholder="29.50"
                      className="w-full px-4 py-3 rounded-lg bg-noir-dark/50 border border-noir-crimson/30 text-noir-gray placeholder:text-noir-gray-darker focus:outline-none focus:border-noir-crimson-light"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-noir-gray-dark mb-2">
                    {t.portfolio?.currency || 'Currency'}
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewCurrency("USD")}
                      className={`flex-1 py-2 rounded-lg border transition-all ${
                        newCurrency === "USD"
                          ? "bg-noir-crimson border-noir-crimson text-noir-gray"
                          : "border-noir-crimson/30 text-noir-gray-dark hover:border-noir-crimson"
                      }`}
                    >
                      USD ($)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewCurrency("SAR")}
                      className={`flex-1 py-2 rounded-lg border transition-all ${
                        newCurrency === "SAR"
                          ? "bg-noir-crimson border-noir-crimson text-noir-gray"
                          : "border-noir-crimson/30 text-noir-gray-dark hover:border-noir-crimson"
                      }`}
                    >
                      SAR (ر.س)
                    </button>
                  </div>
                </div>
                
                {addError && (
                  <div className="p-3 rounded-lg bg-signal-sell/10 border border-signal-sell/30 text-signal-sell text-sm">
                    {addError}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={addingPosition}
                  className="w-full btn-crimson py-3 rounded-lg font-medium flex items-center justify-center"
                >
                  {addingPosition ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t.portfolio?.adding || 'Adding...'}
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      {t.portfolio?.addPosition || 'Add Position'}
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
