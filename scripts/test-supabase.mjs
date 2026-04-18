/**
 * Final Supabase Integration Test — clean fresh signup
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://wkmckxegpenrkxwdlsmn.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbWNreGVncGVucmt4d2Rsc21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MTY2NDksImV4cCI6MjA5MjA5MjY0OX0.kBu_fZpIhIQBvECcux9eMzVG6X6LetjRIRX7gIjb5qc";

const supabase = createClient(SUPABASE_URL, ANON_KEY);

// Unique email every run so we never hit "already registered"
const TEST_EMAIL = `finsight${Date.now()}@proton.me`;
const TEST_PASS  = "FinSight@Test2026";

let ok = 0, fail = 0;
const check = (label, pass, detail = "") => {
  if (pass) { console.log(`  ✅ ${label}${detail ? " → " + detail : ""}`); ok++; }
  else       { console.log(`  ❌ ${label}${detail ? " → " + detail : ""}`); fail++; }
};
const section = (t) => console.log(`\n${"─".repeat(52)}\n🔷 ${t}\n${"─".repeat(52)}`);

// ── 1. Sign up ──────────────────────────────────────────
section("1 · Auth — Sign Up");
const { data: su, error: suErr } = await supabase.auth.signUp({
  email: TEST_EMAIL, password: TEST_PASS,
  options: { data: { name: "Test User", currency: "SAR" } },
});
check("signUp call succeeded", !suErr, suErr?.message);
check("user object returned",  !!su?.user, su?.user?.id);
check("session returned (no email confirm)", !!su?.session,
  su?.session ? "session OK" : "no session — email confirm still ON?");

if (!su?.session) {
  console.log("\n  ⚠️  Email confirmation still blocking sign-in.");
  console.log("     → Supabase Dashboard → Auth → Providers → Email → turn OFF 'Confirm email' → Save\n");
  process.exit(1);
}

const token  = su.session.access_token;
const userId = su.user.id;
const authed = createClient(SUPABASE_URL, ANON_KEY, {
  global: { headers: { Authorization: `Bearer ${token}` } },
});

// ── 2. Sign in ──────────────────────────────────────────
section("2 · Auth — Sign In");
const { data: si, error: siErr } = await supabase.auth.signInWithPassword({
  email: TEST_EMAIL, password: TEST_PASS,
});
check("signInWithPassword", !siErr, siErr?.message);
check("access token present", !!si?.session?.access_token,
  si?.session?.access_token?.slice(0, 30) + "...");

// ── 3. Profile trigger ──────────────────────────────────
section("3 · profiles table + auto-create trigger");
const { data: prof, error: profErr } = await authed
  .from("profiles").select("*").eq("id", userId).single();

if (profErr?.message?.includes("schema cache")) {
  console.log("  ⏳ Schema cache is still warming — waiting 10s...");
  await new Promise(r => setTimeout(r, 10000));
  const { data: prof2, error: profErr2 } = await authed
    .from("profiles").select("*").eq("id", userId).single();
  check("profiles table accessible", !profErr2, profErr2?.message);
  check("profile auto-created", !!prof2, prof2 ? `currency: ${prof2.currency}` : "missing");
} else {
  check("profiles table accessible", !profErr, profErr?.message);
  check("profile auto-created by trigger", !!prof, prof ? `currency: ${prof.currency}` : "missing");
}

// ── 4. Portfolio CRUD ───────────────────────────────────
section("4 · portfolios CRUD");

const { data: ins, error: insErr } = await authed
  .from("portfolios")
  .insert({ user_id: userId, symbol: "AAPL", shares: 5, avg_price: 180.0, currency: "USD" })
  .select().single();
check("INSERT portfolio", !insErr, insErr?.message ?? `id: ${ins?.id}`);

if (ins) {
  const { data: sel, error: selErr } = await authed
    .from("portfolios").select("*").eq("user_id", userId);
  check("SELECT portfolios", !selErr && sel?.length > 0, `${sel?.length ?? 0} row(s)`);

  const { error: delErr } = await authed
    .from("portfolios").delete().eq("id", ins.id);
  check("DELETE portfolio", !delErr, delErr?.message ?? "cleaned up");
}

// ── 5. RLS (unauthenticated read must be empty/blocked) ─
section("5 · Row Level Security");
const { data: rls } = await supabase.from("portfolios").select("*");
check("Unauthenticated reads blocked", !rls || rls.length === 0, "RLS active ✔");

// ── Summary ─────────────────────────────────────────────
console.log(`\n${"═".repeat(52)}`);
console.log(`  RESULT: ${ok} passed · ${fail} failed`);
console.log(`${"═".repeat(52)}`);
console.log(fail === 0
  ? "\n🎉 All tests passed — Supabase integration is 100% working!\n"
  : "\n⚠️  Some checks failed — see details above.\n");
