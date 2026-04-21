import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import YahooFinance from "yahoo-finance2";
import { detectMarket, type MarketInfo } from "@/lib/stock-service";

const yahooFinance = new YahooFinance();

// Normalize symbol for Yahoo Finance
function normalizeSymbol(symbol: string): string {
  const upperSymbol = symbol.toUpperCase().trim();
  const marketInfo = detectMarket(upperSymbol);
  
  if (marketInfo.type === 'SAUDI') {
    // Yahoo Finance uses .SR for Saudi stocks
    const baseCode = upperSymbol.replace(/\.(SR|SA)$/, '');
    return `${baseCode}.SR`;
  }
  
  return upperSymbol;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");

    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol is required" },
        { status: 400 }
      );
    }

    const marketInfo = detectMarket(symbol);
    const yahooSymbol = normalizeSymbol(symbol);
    
    console.log('API Route: Fetching Yahoo Finance quote for:', yahooSymbol, 'Market:', marketInfo.type);
    
    const result: any = await yahooFinance.quote(yahooSymbol);
    
    if (!result || !result.regularMarketPrice) {
      console.error('No quote data from Yahoo Finance for:', yahooSymbol);
      return NextResponse.json(
        { error: "Ticker not found on Yahoo Finance" },
        { status: 404 }
      );
    }

    const quote = {
      symbol: symbol.toUpperCase().trim(),
      price: result.regularMarketPrice || 0,
      change: result.regularMarketChange || 0,
      changePercent: result.regularMarketChangePercent || 0,
      volume: result.regularMarketVolume || 0,
      latestTradingDay: new Date().toISOString().split('T')[0],
      currency: marketInfo.currency,
      marketType: marketInfo.type,
    };

    console.log('API Route: Quote result:', quote);
    return NextResponse.json(quote);
  } catch (error) {
    console.error("API Route Error fetching quote:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
