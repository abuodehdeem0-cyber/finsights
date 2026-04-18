import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  currency: z.enum(["USD", "SAR"]).default("USD"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, currency } = registerSchema.parse(body);

    const supabase = createServerSupabaseClient();

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, currency },
      },
    });

    if (error) {
      console.error("REGISTER ERROR:", error.message);
      if (error.message.includes("already registered")) {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "Registration failed" },
        { status: 500 }
      );
    }

    // Create a profile record in the profiles table
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      email: data.user.email!,
      name,
      currency,
    });

    if (profileError) {
      console.error("PROFILE CREATE ERROR:", profileError.message);
      // Don't fail the registration if profile insert fails — user is already created in Auth
    }

    return NextResponse.json(
      {
        token: data.session?.access_token || null,
        user: {
          id: data.user.id,
          email: data.user.email,
          name,
          currency,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER ERROR:", error);

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
