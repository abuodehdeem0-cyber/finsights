import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
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

    const user = await prisma.user.findUnique({
      where: { email },
    });
    console.log("[API Login] User lookup result:", user ? "Found" : "Not found");

    if (!user) {
      console.log("[API Login] User not found");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log("[API Login] Comparing passwords...");
    const isValid = await bcrypt.compare(password, user.password);
    console.log("[API Login] Password valid:", isValid);

    if (!isValid) {
      console.log("[API Login] Invalid password");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log("[API Login] Generating JWT token...");
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.NEXTAUTH_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );
    console.log("[API Login] Token generated successfully");

    console.log("[API Login] Sending success response");
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        currency: user.currency,
      },
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
