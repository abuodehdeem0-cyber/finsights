import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import YahooFinance from "yahoo-finance2";
import { detectMarket } from "@/lib/stock-service";

const yahooFinance = new YahooFinance();

// Normalize symbol for Yahoo Finance
function normalizeSymbol(symbol: string): string {
  const upperSymbol = symbol.toUpperCase().trim();
  const marketInfo = detectMarket(upperSymbol);
  
  if (marketInfo.type === 'SAUDI') {
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
    
    console.log('API Route: Fetching Yahoo Finance overview for:', yahooSymbol);
    
    const result: any = await yahooFinance.quoteSummary(yahooSymbol, {
      modules: ['summaryProfile', 'defaultKeyStatistics', 'price']
    });
    
    const profile = result.summaryProfile;
    const stats = result.defaultKeyStatistics;
    const price = result.price;
    
    if (!profile && !price) {
      console.error('No overview data from Yahoo Finance for:', yahooSymbol);
      return NextResponse.json(
        { error: "Ticker not found on Yahoo Finance" },
        { status: 404 }
      );
    }

    const overview = {
      symbol: symbol.toUpperCase().trim(),
      name: price?.longName || price?.shortName || profile?.industry || symbol.toUpperCase(),
      description: profile?.longBusinessSummary || `${marketInfo.country} listed stock`,
      exchange: price?.exchangeName || marketInfo.exchange,
      currency: marketInfo.currency,
      sector: profile?.sector || 'Unknown',
      industry: profile?.industry || 'Unknown',
      marketCap: stats?.marketCap || 0,
      peRatio: stats?.trailingPE || 0,
      dividendYield: (stats?.dividendYield || 0) * 100,
      week52High: stats?.fiftyTwoWeekHigh || 0,
      week52Low: stats?.fiftyTwoWeekLow || 0,
      week52Change: 0,
      beta: stats?.beta || 1,
    };

    return NextResponse.json(overview);
  } catch (error) {
    console.error("Error fetching overview:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
