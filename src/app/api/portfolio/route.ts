import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { z } from "zod";

// Helper to detect if Saudi stock and auto-append .SR
function normalizeSymbol(symbol: string): { symbol: string; currency: string } {
  const clean = symbol.trim().toUpperCase();

  if (clean.endsWith(".SR")) {
    return { symbol: clean, currency: "SAR" };
  }

  if (/^\d{4}$/.test(clean)) {
    return { symbol: `${clean}.SR`, currency: "SAR" };
  }

  return { symbol: clean, currency: "USD" };
}

const portfolioSchema = z.object({
  symbol: z.string().min(1),
  shares: z.number().positive(),
  avgPrice: z.number().positive(),
  currency: z.enum(["USD", "SAR"]).optional(),
});

// Extract user ID from Supabase JWT token in header
async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  const supabase = createServerSupabaseClient();

  // Try Authorization Bearer token first
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (!error && user) return user.id;
  }

  // Fallback: x-user-id header (legacy support)
  return request.headers.get("x-user-id");
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();

    const { data: portfolios, error } = await supabase
      .from("portfolios")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching portfolio:", error.message);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    // Map snake_case DB columns to camelCase for frontend compatibility
    const mapped = (portfolios || []).map((p) => ({
      id: p.id,
      userId: p.user_id,
      symbol: p.symbol,
      shares: p.shares,
      avgPrice: p.avg_price,
      currency: p.currency,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { symbol, shares, avgPrice, currency: inputCurrency } = portfolioSchema.parse(body);

    const { symbol: normalizedSymbol, currency: detectedCurrency } = normalizeSymbol(symbol);
    const finalCurrency = inputCurrency || detectedCurrency;

    const supabase = createServerSupabaseClient();

    const { data: portfolio, error } = await supabase
      .from("portfolios")
      .insert({
        user_id: userId,
        symbol: normalizedSymbol,
        shares,
        avg_price: avgPrice,
        currency: finalCurrency,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating portfolio entry:", error.message);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    return NextResponse.json(
      {
        id: portfolio.id,
        userId: portfolio.user_id,
        symbol: portfolio.symbol,
        shares: portfolio.shares,
        avgPrice: portfolio.avg_price,
        currency: portfolio.currency,
        createdAt: portfolio.created_at,
        updatedAt: portfolio.updated_at,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating portfolio entry:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!userId || !id) {
      return NextResponse.json({ error: "Unauthorized or missing ID" }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();

    const { error } = await supabase
      .from("portfolios")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting portfolio entry:", error.message);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting portfolio entry:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
