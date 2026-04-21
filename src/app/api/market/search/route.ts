import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keywords = searchParams.get("keywords");

    if (!keywords) {
      return NextResponse.json(
        { error: "Keywords are required" },
        { status: 400 }
      );
    }

    console.log('API Route: Searching Yahoo Finance for:', keywords);
    
    const results: any = await yahooFinance.search(keywords);
    
    if (!results || !results.quotes) {
      return NextResponse.json([]);
    }
    
    const mapped = results.quotes.slice(0, 8).map((quote: any) => {
      const isSaudi = quote.exchange === 'SAU' || quote.exchange === 'TADAWUL' || /^\d{4}$/.test(quote.symbol);
      return {
        symbol: quote.symbol,
        name: quote.longname || quote.shortname || quote.symbol,
        type: quote.quoteType || 'Equity',
        region: isSaudi ? 'Saudi Arabia' : (quote.exchange || 'United States'),
        currency: isSaudi ? 'SAR' : 'USD',
      };
    });

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Error searching stocks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
