import axios from "axios";

const API_KEY = process.env.TWELVE_DATA_API_KEY || 'a70d9f675f58498e9213a4d8624a878e';
const BASE_URL = "https://api.twelvedata.com";

console.log('Twelve Data API Key loaded:', API_KEY ? 'Yes' : 'No');

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

export interface MarketInfo {
  type: MarketType;
  currency: string;
  flag: string;
  exchange: string;
  country: string;
}

// Smart ticker detection
export function detectMarket(symbol: string): MarketInfo {
  const upperSymbol = symbol.toUpperCase().trim();
  
  // Check for Saudi patterns:
  // 1. Pure numeric (e.g., 1120, 2222)
  // 2. Numeric with any suffix (e.g., 2222.SA, 1120.SR, 2222.SABE)
  const isSaudiNumeric = /^\d{3,4}$/.test(upperSymbol);
  const isSaudiWithSuffix = /^\d{3,4}\.[A-Z]{2,4}$/.test(upperSymbol);
  
  if (isSaudiNumeric || isSaudiWithSuffix) {
    const baseCode = upperSymbol.replace(/\.[A-Z]+$/, '');
    return {
      type: 'SAUDI',
      currency: 'SAR',
      flag: '🇸🇦',
      exchange: baseCode,
      country: 'Saudi Arabia'
    };
  }
  
  // Default to US market
  return {
    type: 'US',
    currency: 'USD',
    flag: '🇺🇸',
    exchange: upperSymbol,
    country: 'United States'
  };
}

// Normalize ticker for Twelve Data API
export function normalizeTicker(symbol: string): string {
  const upperSymbol = symbol.toUpperCase().trim();
  const marketInfo = detectMarket(upperSymbol);
  
  if (marketInfo.type === 'SAUDI') {
    // Remove any existing suffix and add .SR for Twelve Data
    const baseCode = upperSymbol.replace(/\.[A-Z]+$/, '');
    return `${baseCode}.SR`;
  }
  
  return upperSymbol;
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

export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const marketInfo = detectMarket(symbol);
    // Twelve Data: Saudi stocks need exchange specified (e.g., 2222:TADAWUL)
    // US stocks don't need exchange
    const baseCode = symbol.toUpperCase().trim().replace(/\.[A-Z]+$/, '');
    const apiSymbol = marketInfo.type === 'SAUDI' ? `${baseCode}:TADAWUL` : baseCode;
    
    console.log('Fetching quote via Twelve Data for:', symbol, 'API symbol:', apiSymbol, 'Market:', marketInfo.type);
    
    const response = await axios.get(`${BASE_URL}/quote`, {
      params: {
        symbol: apiSymbol,
        apikey: API_KEY,
      },
    });

    console.log('Twelve Data response:', JSON.stringify(response.data).substring(0, 300));
    
    const data = response.data;
    if (data.status === 'error' || (!data.close && !data.price)) {
      console.error('No quote data from Twelve Data for:', apiSymbol, 'Error:', data.message || data.code);
      return null;
    }

    return {
      symbol: symbol.toUpperCase().trim(),
      price: parseFloat(data.close) || parseFloat(data.price) || 0,
      change: parseFloat(data.change) || 0,
      changePercent: parseFloat(data.percent_change) || 0,
      volume: parseInt(data.volume) || 0,
      latestTradingDay: data.datetime || data.timestamp || new Date().toISOString().split('T')[0],
      currency: marketInfo.currency,
      marketType: marketInfo.type,
    };
  } catch (error) {
    console.error("Error fetching stock quote from Twelve Data:", error);
    return null;
  }
}

export async function getStockOverview(symbol: string): Promise<StockOverview | null> {
  try {
    const marketInfo = detectMarket(symbol);
    const baseCode = symbol.toUpperCase().trim().replace(/\.[A-Z]+$/, '');
    const apiSymbol = marketInfo.type === 'SAUDI' ? `${baseCode}:TADAWUL` : baseCode;
    
    console.log('Fetching profile via Twelve Data for:', apiSymbol);
    
    const response = await axios.get(`${BASE_URL}/profile`, {
      params: {
        symbol: apiSymbol,
        apikey: API_KEY,
      },
    });

    const data = response.data;
    
    if (data.status === 'error' || !data.name) {
      console.log('No profile data from Twelve Data, using fallback for:', apiSymbol);
      // Fallback to minimal data based on market detection
      return {
        symbol: symbol.toUpperCase().trim(),
        name: symbol.toUpperCase().trim(),
        description: `${marketInfo.country} listed stock`,
        exchange: marketInfo.type === 'SAUDI' ? 'TADAWUL' : 'US',
        currency: marketInfo.currency,
        sector: 'Unknown',
        industry: 'Unknown',
        marketCap: 0,
        peRatio: 0,
        dividendYield: 0,
        week52High: 0,
        week52Low: 0,
        week52Change: 0,
        beta: 1,
      };
    }

    return {
      symbol: symbol.toUpperCase().trim(),
      name: data.name,
      description: data.description || `${marketInfo.country} listed stock`,
      exchange: data.exchange || (marketInfo.type === 'SAUDI' ? 'TADAWUL' : 'US'),
      currency: marketInfo.currency,
      sector: data.sector || data.industry_sector || 'Unknown',
      industry: data.industry || data.industry_group || 'Unknown',
      marketCap: parseInt(data.market_capitalization) || 0,
      peRatio: parseFloat(data.pe_ratio) || 0,
      dividendYield: parseFloat(data.dividend_yield) || 0,
      week52High: parseFloat(data.fifty_two_week_high) || 0,
      week52Low: parseFloat(data.fifty_two_week_low) || 0,
      week52Change: 0,
      beta: parseFloat(data.beta) || 1,
    };
  } catch (error) {
    console.error("Error fetching stock overview from Twelve Data:", error);
    return null;
  }
}

export async function getIntradayData(symbol: string, interval: string = "5min") {
  try {
    const marketInfo = detectMarket(symbol);
    const baseCode = symbol.toUpperCase().trim().replace(/\.[A-Z]+$/, '');
    const apiSymbol = marketInfo.type === 'SAUDI' ? `${baseCode}:TADAWUL` : baseCode;
    
    const response = await axios.get(`${BASE_URL}/time_series`, {
      params: {
        symbol: apiSymbol,
        interval: interval,
        apikey: API_KEY,
        outputsize: 100,
      },
    });

    const data = response.data;
    if (data.status === 'error' || !data.values) return null;

    return data.values.map((item: any) => ({
      timestamp: item.datetime,
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      close: parseFloat(item.close),
      volume: parseInt(item.volume),
    }));
  } catch (error) {
    console.error("Error fetching intraday data from Twelve Data:", error);
    return null;
  }
}

export async function searchStocks(keywords: string) {
  try {
    console.log('Searching via Twelve Data for:', keywords);
    
    const response = await axios.get(`${BASE_URL}/symbol_search`, {
      params: {
        symbol: keywords,
        apikey: API_KEY,
      },
    });

    console.log('Twelve Data search response:', JSON.stringify(response.data).substring(0, 300));
    
    const data = response.data;
    if (data.status === 'error' || !data.data) {
      console.log('No search results from Twelve Data');
      return [];
    }
    
    const matches = data.data || [];
    console.log('Found matches:', matches.length);
    
    return matches.slice(0, 8).map((match: any) => ({
      symbol: match.symbol,
      name: match.instrument_name || match.name || match.symbol,
      type: match.instrument_type || 'Equity',
      region: match.exchange || (match.symbol.includes('.SR') || match.symbol.includes('SA') ? 'Saudi Arabia' : 'United States'),
      currency: match.currency || (match.symbol.includes('.SR') || match.symbol.includes('SA') ? 'SAR' : 'USD'),
    }));
  } catch (error) {
    console.error("Error searching stocks via Twelve Data:", error);
    return [];
  }
}

// Market-specific risk factors
export function getMarketRiskFactors(marketType: MarketType, sector?: string): string[] {
  if (marketType === 'SAUDI') {
    return [
      'Oil price correlation exposure',
      'Vision 2030 policy impact',
      'Saudi Riyal peg to USD risk',
      'Local market liquidity considerations',
      'Regional geopolitical factors',
    ];
  }
  
  // US Market risk factors
  return [
    'Federal Reserve interest rate policy',
    'Inflation and macroeconomic trends',
    sector?.includes('Tech') ? 'Tech sector volatility' : 'Sector rotation risk',
    'Market liquidity and depth',
    'Regulatory environment changes',
  ];
}

// Mock data for development/demo purposes
export function getMockQuote(symbol: string): StockQuote {
  const marketInfo = detectMarket(symbol);
  
  return {
    symbol,
    price: 150 + Math.random() * 100,
    change: (Math.random() - 0.5) * 10,
    changePercent: (Math.random() - 0.5) * 5,
    volume: Math.floor(Math.random() * 10000000),
    latestTradingDay: new Date().toISOString().split("T")[0],
    currency: marketInfo.currency,
    marketType: marketInfo.type,
  };
}

export function getMockOverview(symbol: string): StockOverview {
  const marketInfo = detectMarket(symbol);
  const sectors = marketInfo.type === 'SAUDI' 
    ? ["Energy", "Financials", "Materials", "Industrials", "Consumer"] 
    : ["Technology", "Healthcare", "Finance", "Energy", "Consumer"];
  
  return {
    symbol,
    name: `${symbol} ${marketInfo.type === 'SAUDI' ? 'Company' : 'Corporation'}`,
    description: `Leading ${symbol} company in ${marketInfo.country}.`,
    exchange: marketInfo.type === 'SAUDI' ? 'TADAWUL' : 'NASDAQ',
    currency: marketInfo.currency,
    sector: sectors[Math.floor(Math.random() * sectors.length)],
    industry: "General",
    marketCap: Math.floor(Math.random() * 1000000000000),
    peRatio: 15 + Math.random() * 30,
    dividendYield: Math.random() * 0.05,
    week52High: 200 + Math.random() * 100,
    week52Low: 50 + Math.random() * 50,
    week52Change: (Math.random() - 0.5) * 50,
    beta: 0.5 + Math.random() * 1.5,
  };
}
