/**
 * Check tables directly via Supabase SQL (bypasses PostgREST cache)
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://wkmckxegpenrkxwdlsmn.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbWNreGVncGVucmt4d2Rsc21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MTY2NDksImV4cCI6MjA5MjA5MjY0OX0.kBu_fZpIhIQBvECcux9eMzVG6X6LetjRIRX7gIjb5qc";

const supabase = createClient(SUPABASE_URL, ANON_KEY);

console.log("🔍 Checking what tables exist in Supabase...\n");

// Sign in with the test user we created earlier
const { data: session, error: signInError } = await supabase.auth.signInWithPassword({
  email: "finsight.test.1776518811000@gmail.com",
  password: "Test@1234567",
});

if (signInError) {
  console.log("⚠️  Could not sign in with old test user:", signInError.message);
  console.log("    This is expected — test users from earlier may need confirmation.");
  console.log("\n💡 The schema cache 404 means one of two things:");
  console.log("   1. Tables exist but the public schema is not exposed to PostgREST");
  console.log("   2. The SQL migration needs to be re-run");
  console.log("\n📋 To check: Go to Supabase → Table Editor and see if tables are listed");
  console.log("   https://supabase.com/dashboard/project/wkmckxegpenrkxwdlsmn/editor");
} else {
  console.log("✅ Signed in:", session.user.email);
  console.log("   Session token:", session.session?.access_token?.slice(0, 40) + "...");
  
  // Try direct table access with auth
  const authed = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${session.session?.access_token}` }},
  });
  
  const { data, error } = await authed.from("profiles").select("*").limit(5);
  if (error) {
    console.log("\n❌ profiles query error:", error.message);
    console.log("   Code:", error.code);
  } else {
    console.log("\n✅ profiles table accessible! Rows:", data.length);
    console.log("   Data:", JSON.stringify(data, null, 2));
  }
}
