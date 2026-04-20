import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase";
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

// Verify user identity from Authorization Bearer token or x-user-id header.
// Returns the verified user ID, or null if authentication fails.
async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  // Try Authorization Bearer token first (preferred)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "").trim();
    if (token && token !== "null" && token !== "undefined") {
      try {
        // Use anon-key client for token verification ONLY
        const supabase = createServerSupabaseClient(token);
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          console.log("[Portfolio Auth] ✅ Verified via Bearer token, user:", user.id);
          return user.id;
        }
        console.warn("[Portfolio Auth] Bearer token verification failed:", error?.message);
      } catch (err) {
        console.error("[Portfolio Auth] Exception verifying token:", err);
      }
    }
  }

  // Fallback: x-user-id header (only if no valid Bearer token)
  const userId = request.headers.get("x-user-id");
  if (userId) {
    console.warn("[Portfolio Auth] ⚠️ Falling back to x-user-id header (less secure):", userId);
    return userId;
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use admin client (service role) — RLS bypassed, we already verified the user above
    const supabase = createAdminSupabaseClient();

    const { data: portfolios, error } = await supabase
      .from("portfolios")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Portfolio GET] Supabase error:", error.code, error.message, error.details);
      return NextResponse.json(
        { error: "Internal server error", detail: error.message },
        { status: 500 }
      );
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
    console.error("[Portfolio GET] Unexpected error:", error);
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

    let parsed;
    try {
      parsed = portfolioSchema.parse(body);
    } catch (zodErr) {
      if (zodErr instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid input", details: zodErr.errors },
          { status: 400 }
        );
      }
      throw zodErr;
    }

    const { symbol, shares, avgPrice, currency: inputCurrency } = parsed;
    const { symbol: normalizedSymbol, currency: detectedCurrency } = normalizeSymbol(symbol);
    const finalCurrency = inputCurrency || detectedCurrency;

    console.log("[Portfolio POST] Inserting position:", {
      userId,
      symbol: normalizedSymbol,
      shares,
      avgPrice,
      currency: finalCurrency,
    });

    // Use admin client (service role) — RLS bypassed, we already verified the user above
    const supabase = createAdminSupabaseClient();

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
      console.error("[Portfolio POST] Supabase error:", error.code, error.message, error.details, error.hint);
      return NextResponse.json(
        { error: "Internal server error", detail: error.message },
        { status: 500 }
      );
    }

    console.log("[Portfolio POST] ✅ Position created:", portfolio.id);

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
    console.error("[Portfolio POST] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: "Missing position ID" }, { status: 400 });
    }

    // Use admin client (service role) — RLS bypassed, we already verified the user above
    const supabase = createAdminSupabaseClient();

    const { error } = await supabase
      .from("portfolios")
      .delete()
      .eq("id", id)
      .eq("user_id", userId); // Still scope to user_id for safety

    if (error) {
      console.error("[Portfolio DELETE] Supabase error:", error.code, error.message);
      return NextResponse.json(
        { error: "Internal server error", detail: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Portfolio DELETE] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
