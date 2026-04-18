"use client";

import { useState, FormEvent, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { motion } from "framer-motion";
import {
  Search,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Shield,
  Zap,
  Activity,
  BarChart3,
  Brain,
  Clock,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import {
  formatCurrency,
  formatPercentage,
  calculateRiskLevel,
  getSignalColor,
  getConfidenceColor,
} from "@/lib/utils";
import { 
  detectMarket, 
  normalizeTicker, 
  getMarketRiskFactors,
  type MarketType,
  type MarketInfo 
} from "@/lib/stock-service";
// API helper functions
async function fetchQuote(symbol: string) {
  try {
    const res = await fetch(`/api/market/quote?symbol=${encodeURIComponent(symbol)}`);
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    console.error('Fetch quote error:', e);
    return null;
  }
}

async function fetchOverview(symbol: string) {
  try {
    const res = await fetch(`/api/market/overview?symbol=${encodeURIComponent(symbol)}`);
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    console.error('Fetch overview error:', e);
    return null;
  }
}

async function fetchSearch(keywords: string) {
  try {
    const res = await fetch(`/api/market/search?keywords=${encodeURIComponent(keywords)}`);
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    console.error('Fetch search error:', e);
    return [];
  }
}


interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
}

interface AnalysisResult {
  symbol: string;
  name: string;
  price: number;
  change: number;
  signal: "BUY" | "SELL" | "HOLD";
  confidence: number;
  riskLevel: "Low" | "Medium" | "High";
  riskFactors: string[];
  targetPrice: number;
  stopLoss: number;
  reasoning: string[];
  sector: string;
  marketCap: string;
  currency: string;
  marketType: MarketType;
  marketInfo: MarketInfo;
}

// Smart input validation
function validateInput(input: string, t: any): { isValid: boolean; normalizedSymbol: string; error?: string } {
  const trimmed = input.trim().toUpperCase();
  
  if (!trimmed) {
    return { isValid: false, normalizedSymbol: '', error: t.analysis.errors.noSymbol };
  }
  
  // Check for Saudi numeric codes (3-4 digits) - e.g., 1120, 2222
  if (/^\d{3,4}$/.test(trimmed)) {
    return { isValid: true, normalizedSymbol: trimmed };
  }
  
  // Check for Saudi with any suffix (e.g., 1120.SA, 2222.SR, 1120.SABE)
  if (/^\d{3,4}\.[A-Z]{2,4}$/.test(trimmed)) {
    return { isValid: true, normalizedSymbol: trimmed };
  }
  
  // Check for standard ticker symbols (1-5 letters) - e.g., AAPL, TSLA
  if (/^[A-Z]{1,5}$/.test(trimmed)) {
    return { isValid: true, normalizedSymbol: trimmed };
  }
  
  return {
    isValid: false,
    normalizedSymbol: '',
    error: t.analysis.errors.invalidSymbol
  };
}

async function analyzeStock(symbol: string, t: any): Promise<AnalysisResult | null> {
  try {
    const marketInfo = detectMarket(symbol);
    const [quote, overview] = await Promise.all([
      fetchQuote(symbol),
      fetchOverview(symbol)
    ]);

    // Must have real quote data
    if (!quote || !quote.price) {
      console.error('No real data available for:', symbol);
      return null;
    }

    const volatility = Math.abs(quote.changePercent) * 2;
    const risk = calculateRiskLevel(volatility);

    let signal: "BUY" | "SELL" | "HOLD";
    let confidence: number;

    if (quote.changePercent > 2 && risk.level === "Low") {
      signal = "BUY";
      confidence = 75 + Math.random() * 20;
    } else if (quote.changePercent < -2 && risk.level === "High") {
      signal = "SELL";
      confidence = 70 + Math.random() * 20;
    } else {
      signal = "HOLD";
      confidence = 50 + Math.random() * 25;
    }

    const beta = overview?.beta || 1;
    const sector = overview?.sector || t.analysis.unknown;
    const name = overview?.name || symbol;
    const currency = quote.currency || marketInfo.currency;
    const marketCapBillions = overview?.marketCap ? (overview.marketCap / 1e9).toFixed(2) : "N/A";

    // Get market-specific risk factors
    const marketSpecificRisks = getMarketRiskFactors(marketInfo.type, sector);
    
    // Combine generic and market-specific risks
    const allRiskFactors = [
      ...risk.factors.slice(0, 2),
      ...marketSpecificRisks.slice(0, 3)
    ].slice(0, 4);

    // Market-specific reasoning (translated)
    const positiveTrend = quote.changePercent >= 0;
    const baseReasoning = [
      t.analysis.reasoning.priceMomentum
        .replace('{trend}', positiveTrend ? t.analysisDetails.bullish : t.analysisDetails.bearish)
        .replace('{value}', formatPercentage(quote.changePercent)),
      t.analysis.reasoning.sectorStrength
        .replace('{sector}', sector)
        .replace('{trend}', positiveTrend ? t.analysis.reasoning.strength : t.analysis.reasoning.consolidation),
    ];

    if (marketInfo.type === 'SAUDI') {
      baseReasoning.push(
        t.analysis.reasoning.tadawulLiquidity,
        t.analysis.reasoning.vision2030
      );
    } else {
      baseReasoning.push(
        t.analysis.reasoning.betaIndicator
          .replace('{value}', beta.toFixed(2))
          .replace('{level}', beta > 1 ? t.analysis.reasoning.higher : t.analysis.reasoning.lower),
        t.analysis.reasoning.volumeTrend
          .replace('{value}', (quote.volume / 1e6).toFixed(1))
          .replace('{trend}', positiveTrend ? t.analysis.reasoning.supportsUptrend : t.analysis.reasoning.indicatesCaution)
      );
    }

    return {
      symbol: quote.symbol,
      name,
      price: quote.price,
      change: quote.changePercent,
      signal,
      confidence: Math.round(confidence),
      riskLevel: risk.level,
      riskFactors: allRiskFactors,
      targetPrice: quote.price * (1 + (signal === "BUY" ? 0.1 : signal === "SELL" ? -0.05 : 0.02)),
      stopLoss: quote.price * (1 - (signal === "BUY" ? 0.05 : signal === "SELL" ? 0.08 : 0.03)),
      reasoning: baseReasoning,
      sector,
      marketCap: overview?.marketCap ? `$${marketCapBillions}B` : t.analysis.notAvailable,
      currency,
      marketType: marketInfo.type,
      marketInfo,
    };
  } catch (error) {
    console.error("Error fetching analysis:", error);
    return null;
  }
}

function AnalysisPage() {
  const { t, isRTL, locale } = useLanguage();
  const searchParams = useSearchParams();
  const [symbol, setSymbol] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Handle ticker from URL query param
  useEffect(() => {
    const tickerFromUrl = searchParams.get("ticker");
    if (tickerFromUrl && initialLoad) {
      setSymbol(tickerFromUrl);
      setInitialLoad(false);
      // Auto-trigger analysis after a short delay
      setTimeout(() => {
        handleAnalyze(tickerFromUrl);
      }, 100);
    }
  }, [searchParams, initialLoad]);

  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setSearching(true);
    try {
      const results = await fetchSearch(query);
      setSearchResults(results);
      setShowDropdown(results.length > 0);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (symbol.length >= 2 && !analysis) {
        handleSearch(symbol);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [symbol, handleSearch, analysis]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectStock = (result: SearchResult) => {
    setSymbol(result.symbol);
    setSearchResults([]);
    setShowDropdown(false);
    setError(null);
  };

  const handleAnalyze = async (e: FormEvent | string) => {
    let ticker: string;
    
    if (typeof e === "string") {
      ticker = e;
    } else {
      e.preventDefault();
      const validation = validateInput(symbol, t);
      if (!validation.isValid) {
        setError(validation.error || null);
        return;
      }
      ticker = validation.normalizedSymbol;
    }
    
    setError(null);
    setAnalysis(null);
    setShowDropdown(false);

    const marketInfo = detectMarket(ticker);
    console.log(loading ? t.analysis.analyzing : t.analysis.analyzeButton, ':', ticker, 'Market:', marketInfo.type, 'Currency:', marketInfo.currency);

    setLoading(true);
    
    try {
      const result = await analyzeStock(ticker, t);
      console.log('Analysis result:', result);
      if (result) {
        setAnalysis(result);
      } else {
        setError(t.analysis.errors.noData);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(t.analysis.errors.fetchFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-noir-gray mb-2">{t.analysis.title}</h1>
        <p className="text-noir-gray/70">{t.analysis.subtitle}</p>
      </div>

      <div className="mb-8">
        <GlassCard className="p-6">
          <form onSubmit={handleAnalyze} className="flex gap-4 search-container">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-noir-gray-dark" />
              <input
                type="text"
                value={symbol}
                onChange={(e) => {
                  const value = e.target.value;
                  setSymbol(value);
                  if (error) setError(null);
                  if (analysis) setAnalysis(null);
                }}
                placeholder={t.analysis.searchPlaceholder}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-noir-dark/50 border border-noir-crimson/30 text-noir-gray placeholder:text-noir-gray-darker focus:outline-none focus:border-noir-crimson-light"
                disabled={loading}
              />
              
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-noir-dark border border-noir-crimson/30 rounded-lg shadow-xl max-h-64 overflow-y-auto z-50">
                  {searching && (
                    <div className="p-3 text-noir-gray-dark text-sm text-center">
                      {t.common.loading}
                    </div>
                  )}
                  {searchResults.map((result, index) => (
                    <button
                      key={`${result.symbol}-${index}`}
                      type="button"
                      onClick={() => handleSelectStock(result)}
                      className="w-full px-4 py-3 text-left hover:bg-noir-crimson/20 transition-colors border-b border-noir-crimson/10 last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-noir-gray">{result.symbol}</span>
                          <span className="text-noir-gray-dark ml-2 text-sm">{result.name}</span>
                        </div>
                        <div className="text-xs text-noir-gray-darker">
                          {result.region} • {result.currency}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-crimson px-8 py-3 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] justify-center"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-noir-gray border-t-transparent rounded-full animate-spin" />
                  <span>{t.common.analyzing}</span>
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  <span>{t.analysis.analyzeButton}</span>
                </>
              )}
            </button>
          </form>
          
          {error && (
            <div className="mt-4 flex items-center gap-2 text-signal-sell bg-signal-sell/10 p-3 rounded-lg">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </GlassCard>
      </div>

      {analysis && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard className="p-6 glow-crimson">
              <div className="text-center mb-6">
                {/* Market Flag and Info */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl">{analysis.marketInfo.flag}</span>
                  <h2 className="text-3xl font-bold text-noir-gray">
                    {analysis.symbol}
                  </h2>
                  <span className={`text-xs px-2 py-1 rounded font-semibold ${
                    analysis.marketType === 'SAUDI'
                      ? 'bg-green-900/50 text-green-400 border border-green-700'
                      : 'bg-blue-900/50 text-blue-400 border border-blue-700'
                  }`}>
                    {analysis.marketType === 'SAUDI' ? '🇸🇦 ' : '🇺🇸 '}{analysis.marketInfo.country}
                  </span>
                </div>
                <p className="text-noir-gray-dark mb-1">{analysis.name}</p>
                <p className="text-xs text-noir-gray-darker mb-4">
                  {/* @ts-expect-error - dynamic sector key lookup */}
                  {t.sectors[analysis.sector?.toLowerCase().replace(/\s+/g, '')] || analysis.sector} • {analysis.marketInfo.exchange}
                </p>
                
                {/* Price with Currency */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-noir-gray">
                      {analysis.currency === 'SAR' ? analysis.price.toFixed(2) : formatCurrency(analysis.price)}
                    </span>
                    <span className="text-sm text-noir-gray-dark ml-1">{analysis.currency}</span>
                  </div>
                  <span className={`text-sm font-semibold ${analysis.change >= 0 ? 'text-signal-buy' : 'text-signal-sell'}`}>
                    {analysis.change >= 0 ? '+' : ''}{formatPercentage(analysis.change)}
                  </span>
                </div>
                
                <div className={`inline-flex items-center px-6 py-3 rounded-lg font-bold text-lg ${
                  analysis.signal === 'BUY' ? 'bg-signal-buy' :
                  analysis.signal === 'SELL' ? 'bg-signal-sell' : 'bg-signal-hold'
                } text-black`}>
                  {analysis.signal === "BUY" && <TrendingUp className="w-5 h-5 mr-2" />}
                  {analysis.signal === "SELL" && <TrendingDown className="w-5 h-5 mr-2" />}
                  {analysis.signal === "HOLD" && <Activity className="w-5 h-5 mr-2" />}
                  {analysis.signal === "BUY" ? t.analysis.buy :
                   analysis.signal === "SELL" ? t.analysis.sell :
                   t.analysis.hold}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between p-3 rounded bg-noir-dark/50">
                  <span className="text-noir-gray-dark">{t.analysisDetails.confidence}</span>
                  <span className={`font-bold ${getConfidenceColor(analysis.confidence)}`}>
                    {analysis.confidence}%
                  </span>
                </div>

                <div className="flex justify-between p-3 rounded bg-noir-dark/50">
                  <span className="text-noir-gray-dark">{t.analysis.riskLevel}</span>
                  <span className={`font-bold ${
                    analysis.riskLevel === "Low" ? "text-signal-buy" :
                    analysis.riskLevel === "Medium" ? "text-signal-hold" : "text-signal-sell"
                  }`}>
                    {analysis.riskLevel === "Low" ? t.analysis.low :
                     analysis.riskLevel === "Medium" ? t.analysis.medium :
                     t.analysis.high}
                  </span>
                </div>

                <div className="flex justify-between p-3 rounded bg-noir-dark/50">
                  <span className="text-noir-gray/70">{t.analysis.marketCap}</span>
                  <span className="font-bold text-noir-gray">{analysis.marketCap}</span>
                </div>

                <div className="flex justify-between p-3 rounded bg-noir-dark/50">
                  <span className="text-noir-gray/70">{t.analysis.targetPrice}</span>
                  <span className="font-bold text-signal-buy">
                    {analysis.currency === 'SAR' ? analysis.targetPrice.toFixed(2) : formatCurrency(analysis.targetPrice)}
                    <span className="text-xs text-noir-gray-dark ml-1">{analysis.currency}</span>
                  </span>
                </div>

                <div className="flex justify-between p-3 rounded bg-noir-dark/50">
                  <span className="text-noir-gray/70">{t.analysis.stopLoss}</span>
                  <span className="font-bold text-signal-sell">
                    {analysis.currency === 'SAR' ? analysis.stopLoss.toFixed(2) : formatCurrency(analysis.stopLoss)}
                    <span className="text-xs text-noir-gray-dark ml-1">{analysis.currency}</span>
                  </span>
                </div>
              </div>
            </GlassCard>

            <div className="lg:col-span-2 space-y-6">
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-noir-gray flex items-center gap-2">
                    <Target className="w-5 h-5 text-noir-crimson-light" />
                    {t.analysisDetails.riskAnalysisFactors}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    analysis.marketType === 'SAUDI'
                      ? 'bg-green-900/30 text-green-400 border border-green-700/50'
                      : 'bg-blue-900/30 text-blue-400 border border-blue-700/50'
                  }`}>
                    {analysis.marketInfo.flag} {analysis.marketType === 'SAUDI' ? t.analysisDetails.tadawul : t.analysisDetails.usMarkets}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysis.riskFactors.map((factor, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded bg-noir-dark/30">
                      <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        analysis.riskLevel === "Low" ? "text-signal-buy" :
                        analysis.riskLevel === "Medium" ? "text-signal-hold" : "text-signal-sell"
                      }`} />
                      <span className="text-sm text-noir-gray">{factor}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-noir-gray mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-noir-crimson-light" />
                  {t.analysisDetails.aiReasoning}
                </h3>
                <div className="space-y-3">
                  {analysis.reasoning.map((reason, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded bg-noir-dark/30">
                      <Zap className="w-5 h-5 mt-0.5 text-noir-crimson-light flex-shrink-0" />
                      <span className="text-sm text-noir-gray">{reason}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GlassCard className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-noir-crimson/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-noir-crimson-light" />
                  </div>
                  <div>
                    <div className="text-sm text-noir-gray-dark">{t.analysisDetails.portfolioFit}</div>
                    <div className="font-semibold text-noir-gray">
                      {analysis.riskLevel === "Low" ? t.analysisDetails.excellent : analysis.riskLevel === "Medium" ? t.analysisDetails.moderate : t.analysisDetails.poor}
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-noir-crimson/20 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-noir-crimson-light" />
                  </div>
                  <div>
                    <div className="text-sm text-noir-gray-dark">{t.analysisDetails.sentiment}</div>
                    <div className="font-semibold text-noir-gray">
                      {analysis.signal === "BUY" ? t.analysisDetails.bullish : analysis.signal === "SELL" ? t.analysisDetails.bearish : t.analysisDetails.neutralSentiment}
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-noir-crimson/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-noir-crimson-light" />
                  </div>
                  <div>
                    <div className="text-sm text-noir-gray-dark">{t.analysisDetails.timeframe}</div>
                    <div className="font-semibold text-noir-gray">{t.analysisDetails.shortTerm}</div>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrapper with Suspense for useSearchParams
export default function AnalysisPageWrapper() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-noir-crimson border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    }>
      <AnalysisPage />
    </Suspense>
  );
}
