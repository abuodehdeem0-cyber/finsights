import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Helper to detect if Saudi stock and auto-append .SR
function normalizeSymbol(symbol: string): { symbol: string; currency: string } {
  const clean = symbol.trim().toUpperCase();
  
  // If already has .SR suffix
  if (clean.endsWith(".SR")) {
    return { symbol: clean, currency: "SAR" };
  }
  
  // If 4 digits (Saudi Tadawul format)
  if (/^\d{4}$/.test(clean)) {
    return { symbol: `${clean}.SR`, currency: "SAR" };
  }
  
  // Default to USD for US/international stocks
  return { symbol: clean, currency: "USD" };
}

const portfolioSchema = z.object({
  symbol: z.string().min(1),
  shares: z.number().positive(),
  avgPrice: z.number().positive(),
  currency: z.enum(["USD", "SAR"]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const portfolios = await prisma.portfolio.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(portfolios);
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { symbol, shares, avgPrice, currency: inputCurrency } = portfolioSchema.parse(body);

    // Auto-detect currency and normalize symbol
    const { symbol: normalizedSymbol, currency: detectedCurrency } = normalizeSymbol(symbol);
    const finalCurrency = inputCurrency || detectedCurrency;

    const portfolio = await prisma.portfolio.create({
      data: {
        userId,
        symbol: normalizedSymbol,
        shares,
        avgPrice,
        currency: finalCurrency,
      },
    });

    return NextResponse.json(portfolio, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating portfolio entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!userId || !id) {
      return NextResponse.json(
        { error: "Unauthorized or missing ID" },
        { status: 401 }
      );
    }

    await prisma.portfolio.delete({
      where: { id, userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting portfolio entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
