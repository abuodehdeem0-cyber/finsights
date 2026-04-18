import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  console.log("[API Login] Request received");
  try {
    const body = await request.json();
    console.log("[API Login] Request body:", { email: body.email });

    const { email, password } = loginSchema.parse(body);
    console.log("[API Login] Schema validation passed");

    const supabase = createServerSupabaseClient();

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      console.log("[API Login] Supabase auth error:", error?.message);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log("[API Login] Auth successful, fetching profile...");

    // Fetch the user profile from our profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    const userProfile = {
      id: data.user.id,
      email: data.user.email!,
      name: profile?.name || data.user.user_metadata?.name || null,
      currency: profile?.currency || "USD",
    };

    console.log("[API Login] Sending success response");
    return NextResponse.json({
      token: data.session?.access_token,
      user: userProfile,
    });
  } catch (error) {
    console.error("[API Login] ERROR:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error", message: String(error) },
      { status: 500 }
    );
  }
}
