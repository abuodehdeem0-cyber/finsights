export type MarketType = 'US' | 'SAUDI' | 'UNKNOWN';

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  latestTradingDay: string;
  currency: string;
  marketType: MarketType;
}

export interface StockOverview {
  symbol: string;
  name: string;
  description: string;
  exchange: string;
  currency: string;
  sector: string;
  industry: string;
  marketCap: number;
  peRatio: number;
  dividendYield: number;
  week52High: number;
  week52Low: number;
  week52Change: number;
  beta: number;
}

export interface MarketInfo {
  type: MarketType;
  currency: string;
  flag: string;
  exchange: string;
  country: string;
}

// Detect market type based on symbol
export function detectMarket(symbol: string): MarketInfo {
  const upperSymbol = symbol.toUpperCase().trim();
  
  // Saudi stocks: 4-digit numeric codes (e.g., 2222, 1120)
  if (/^\d{4}$/.test(upperSymbol) || upperSymbol.endsWith('.SR') || upperSymbol.endsWith('.SA')) {
    const baseCode = upperSymbol.replace(/\.(SR|SA)$/, '');
    return {
      type: 'SAUDI',
      currency: 'SAR',
      flag: '🇸🇦',
      exchange: 'TADAWUL',
      country: 'Saudi Arabia'
    };
  }
  
  return {
    type: 'US',
    currency: 'USD',
    flag: '🇺🇸',
    exchange: upperSymbol,
    country: 'United States'
  };
}

// Normalize symbol for Yahoo Finance
export function normalizeSymbol(symbol: string): string {
  const upperSymbol = symbol.toUpperCase().trim();
  const marketInfo = detectMarket(upperSymbol);
  
  if (marketInfo.type === 'SAUDI') {
    // Yahoo Finance uses .SR for Saudi stocks
    const baseCode = upperSymbol.replace(/\.(SR|SA)$/, '');
    return `${baseCode}.SR`;
  }
  
  return upperSymbol;
}

// Alias for compatibility with analysis page
export const normalizeTicker = normalizeSymbol;

// Market-specific risk factors
export function getMarketRiskFactors(marketType: MarketType, sector?: string): string[] {
  if (marketType === 'SAUDI') {
    return [
      'Oil price correlation exposure',
      'Vision 2030 policy impact',
      'Saudi regulatory environment',
      'Currency (SAR) pegged to USD',
      'Regional geopolitical factors',
      'Liquidity on Tadawul exchange'
    ];
  }
  
  // US market risk factors
  return [
    'Fed interest rate policy impact',
    'Earnings volatility risk',
    'Market correlation exposure',
    'Sector rotation sensitivity',
    'Macroeconomic indicators'
  ];
}

// NOTE: Yahoo Finance API calls are now in server-side API routes only
// Client-side code should call /api/market/* endpoints
