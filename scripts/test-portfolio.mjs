import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// Manually read .env.local
const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = Object.fromEntries(
  envContent
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("🔍 Supabase URL:", url);
console.log("🔑 Service Role Key (first 30 chars):", serviceKey?.substring(0, 30));
console.log("🔑 Anon Key (first 30 chars):", anonKey?.substring(0, 30));
console.log("✅ Keys are different:", serviceKey !== anonKey);

// Test 1: Admin client (service role)
console.log("\n--- Test 1: Admin client SELECT from portfolios ---");
const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await admin.from("portfolios").select("*").limit(5);
if (error) {
  console.error("❌ Admin SELECT failed:", error.code, error.message);
} else {
  console.log("✅ Admin SELECT succeeded! Rows returned:", data.length);
}

// Test 2: Admin client INSERT
console.log("\n--- Test 2: Admin client INSERT into portfolios ---");

// First get a real user ID from auth.users
const { data: users, error: usersError } = await admin.auth.admin.listUsers();
if (usersError) {
  console.error("❌ Could not list users:", usersError.message);
  process.exit(1);
}

if (!users.users || users.users.length === 0) {
  console.error("❌ No users found in Supabase Auth. Make sure you are signed up.");
  process.exit(1);
}

const testUserId = users.users[0].id;
console.log("👤 Using user ID:", testUserId);

const { data: inserted, error: insertError } = await admin
  .from("portfolios")
  .insert({
    user_id: testUserId,
    symbol: "TEST",
    shares: 1,
    avg_price: 1,
    currency: "USD",
  })
  .select()
  .single();

if (insertError) {
  console.error("❌ Admin INSERT failed:", insertError.code, insertError.message, insertError.details, insertError.hint);
} else {
  console.log("✅ Admin INSERT succeeded! ID:", inserted.id);

  // Clean up test row
  await admin.from("portfolios").delete().eq("id", inserted.id);
  console.log("🗑️  Test row cleaned up.");
}
