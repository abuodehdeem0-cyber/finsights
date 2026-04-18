import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

// Sector to stock mapping - All Saudi Companies (Tadawul)
const sectorStocks: Record<string, string[]> = {
  energy: ["2222.SR", "2010.SR", "2030.SR", "3040.SR"],
  technology: ["7010.SR", "7020.SR", "7030.SR", "7200.SR"],
  finance: ["1120.SR", "1010.SR", "1020.SR", "1050.SR"],
  healthcare: ["2070.SR", "4010.SR", "4170.SR", "2080.SR"],
  consumer: ["4001.SR", "4003.SR", "4004.SR", "4191.SR"],
  industrial: ["1211.SR", "1301.SR", "2220.SR", "3005.SR"],
  realestate: ["4150.SR", "4230.SR", "4040.SR", "4320.SR"],
  education: ["4290.SR", "4009.SR"],
};

// Saudi Company names mapping
const companyNames: Record<string, string> = {
  // Energy
  "2222.SR": "Saudi Aramco",
  "2010.SR": "SABIC",
  "2030.SR": "Saudi Electricity",
  "3040.SR": "ACWA Power",
  // Technology
  "7010.SR": "STC (Saudi Telecom)",
  "7020.SR": "Mobily",
  "7030.SR": "Zain KSA",
  "7200.SR": "Solutions by STC",
  // Finance
  "1120.SR": "Al Rajhi Bank",
  "1010.SR": "Saudi National Bank (SNB)",
  "1020.SR": "Riyad Bank",
  "1050.SR": "Alinma Bank",
  // Healthcare
  "2070.SR": "Dr. Sulaiman Al Habib",
  "4010.SR": "Kingdom Hospital",
  "4170.SR": "Saudi Pharmaceutical",
  "2080.SR": "Saudi German Health",
  // Consumer
  "4001.SR": "Almarai",
  "4003.SR": "Saudi Food (Herfy)",
  "4004.SR": "Dan Co",
  "4191.SR": "Saudi Fisheries",
  // Industrial
  "1211.SR": "Ma'aden",
  "1301.SR": "Saudi Cement",
  "2220.SR": "Maraq",
  "3005.SR": "Saudi Industrial Export",
  // Real Estate
  "4150.SR": "Dar Al Arkan",
  "4230.SR": "Retal Urban",
  "4040.SR": "Saudi Real Estate",
  "4320.SR": "Jabal Omar",
  // Education
  "4290.SR": "Taiba",
  "4009.SR": "Al Moammar",
};

// Detect if Saudi stock
function isSaudiStock(symbol: string): boolean {
  return symbol.endsWith(".SR") || /^\d{4,6}$/.test(symbol.split(".")[0]);
}

// Format market cap
function formatMarketCap(value: number | undefined): string {
  if (!value || isNaN(value)) return "N/A";
  
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toFixed(0)}`;
}

// Get AI recommendation from Gemini
async function getAIRecommendation(
  symbol: string,
  price: number,
  change: number,
  changePercent: number,
  companyName: string
): Promise<{ verdict: "BUY" | "SELL" | "HOLD"; logic: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    // Fallback to simple logic if no API key
    if (changePercent > 2) return { verdict: "BUY", logic: "Strong upward momentum indicates bullish trend" };
    if (changePercent < -2) return { verdict: "SELL", logic: "Downward momentum suggests bearish outlook" };
    return { verdict: "HOLD", logic: "Neutral price action, await clearer signals" };
  }

  try {
    const prompt = `Analyze ${companyName} (${symbol}) trading at $${price} with ${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}% change today.

Provide a trading recommendation in this exact format:
VERDICT: [BUY or SELL or HOLD]
LOGIC: [One concise sentence explaining why - max 10 words]

Consider: momentum, recent price action, and general market sentiment. Be decisive.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 100 },
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Gemini API failed");
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Parse response
    const verdictMatch = text.match(/VERDICT:\s*(BUY|SELL|HOLD)/i);
    const logicMatch = text.match(/LOGIC:\s*(.+)/i);
    
    const verdict = (verdictMatch?.[1]?.toUpperCase() as "BUY" | "SELL" | "HOLD") || "HOLD";
    const logic = logicMatch?.[1]?.trim() || "Technical analysis suggests neutral stance";
    
    return { verdict, logic };
  } catch (error) {
    console.error(`AI recommendation failed for ${symbol}:`, error);
    // Fallback
    if (changePercent > 2) return { verdict: "BUY", logic: "Strong upward momentum detected" };
    if (changePercent < -2) return { verdict: "SELL", logic: "Downward pressure evident" };
    return { verdict: "HOLD", logic: "Awaiting clearer market signals" };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sectorId = params.id;
    const symbols = sectorStocks[sectorId];

    if (!symbols) {
      return NextResponse.json(
        { error: "Sector not found" },
        { status: 404 }
      );
    }

    // Fetch all stocks in parallel
    const stockPromises = symbols.map(async (symbol) => {
      try {
        // Fetch quote
        const quote: any = await yahooFinance.quote(symbol);
        
        if (!quote || !quote.regularMarketPrice) {
          return null;
        }

        const price = quote.regularMarketPrice;
        const change = quote.regularMarketChange || 0;
        const changePercent = quote.regularMarketChangePercent || 0;
        const marketCap = quote.marketCap || 0;
        const isSaudi = isSaudiStock(symbol);

        // Get AI recommendation
        const companyName = companyNames[symbol] || symbol;
        const aiRec = await getAIRecommendation(symbol, price, change, changePercent, companyName);

        return {
          symbol,
          name: companyName,
          price,
          change,
          changePercent,
          marketCap: formatMarketCap(marketCap),
          currency: isSaudi ? "SAR" : "USD",
          aiVerdict: aiRec.verdict,
          aiLogic: aiRec.logic,
        };
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error);
        return null;
      }
    });

    const stocks = (await Promise.all(stockPromises)).filter(Boolean);

    if (stocks.length === 0) {
      return NextResponse.json(
        { error: "Failed to fetch stock data" },
        { status: 500 }
      );
    }

    return NextResponse.json({ stocks });
  } catch (error) {
    console.error("Sector API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
