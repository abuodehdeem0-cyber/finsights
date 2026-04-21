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

// Get period parameters based on timeframe
function getPeriodParams(timeframe: string) {
  const now = new Date();
  let period1: Date;
  let interval: string;
  
  switch (timeframe) {
    case "1D":
      period1 = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
      interval = "5m";
      break;
    case "1W":
      period1 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      interval = "1h";
      break;
    case "1M":
      period1 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      interval = "1d";
      break;
    case "1Y":
      period1 = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      interval = "1wk";
      break;
    default:
      period1 = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
      interval = "5m";
  }
  
  return { period1, period2: now, interval };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol") || "^GSPC"; // Default to S&P 500
    const timeframe = searchParams.get("timeframe") || "1D";

    const marketInfo = detectMarket(symbol);
    const yahooSymbol = normalizeSymbol(symbol);
    
    console.log('Historical API: Fetching', yahooSymbol, 'timeframe:', timeframe);
    
    const { period1, period2, interval } = getPeriodParams(timeframe);
    
    const result: any = await yahooFinance.chart(yahooSymbol, {
      period1: period1.toISOString().split('T')[0],
      period2: period2.toISOString().split('T')[0],
      interval: interval as any,
    });
    
    if (!result || !result.quotes || result.quotes.length === 0) {
      console.error('No historical data from Yahoo Finance for:', yahooSymbol);
      return NextResponse.json(
        { error: "No historical data available" },
        { status: 404 }
      );
    }

    // Format data for chart
    const chartData = result.quotes.map((quote: any) => {
      const date = new Date(quote.date);
      let timeLabel: string;
      
      if (timeframe === "1D") {
        timeLabel = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      } else if (timeframe === "1W" || timeframe === "1M") {
        timeLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        timeLabel = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      }
      
      return {
        time: timeLabel,
        value: quote.close || quote.adjclose || 0,
        high: quote.high || 0,
        low: quote.low || 0,
        volume: quote.volume || 0,
      };
    }).filter((item: any) => item.value > 0);

    const response = {
      symbol: symbol.toUpperCase(),
      timeframe,
      currency: marketInfo.currency,
      data: chartData,
      meta: {
        previousClose: result.meta?.previousClose || 0,
        regularMarketPrice: result.meta?.regularMarketPrice || 0,
      }
    };

    console.log('Historical API: Returning', chartData.length, 'data points');
    return NextResponse.json(response);
  } catch (error) {
    console.error("Historical API Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
