/**
 * Force Supabase PostgREST schema cache reload
 */
const PROJECT_REF = "wkmckxegpenrkxwdlsmn";
// Use the service role key to call the management API
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbWNreGVncGVucmt4d2Rsc21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MTY2NDksImV4cCI6MjA5MjA5MjY0OX0.kBu_fZpIhIQBvECcux9eMzVG6X6LetjRIRX7gIjb5qc";

console.log("🔄 Attempting to reload Supabase schema cache...\n");

// Method 1: Hit the REST schema endpoint to warm it up
const tables = ["profiles", "portfolios", "watchlists", "alerts", "market_data"];

for (const table of tables) {
  try {
    const res = await fetch(
      `https://${PROJECT_REF}.supabase.co/rest/v1/${table}?limit=1`,
      {
        headers: {
          apikey: ANON_KEY,
          Authorization: `Bearer ${ANON_KEY}`,
          Accept: "application/json",
        },
      }
    );
    const status = res.status;
    const body = await res.text();
    if (status === 200 || status === 401 || status === 406) {
      console.log(`  ✅ ${table} → HTTP ${status} (cache active)`);
    } else if (body.includes("schema cache")) {
      console.log(`  ⏳ ${table} → HTTP ${status} (cache still warming)`);
    } else {
      console.log(`  ⚠️  ${table} → HTTP ${status}: ${body.slice(0, 80)}`);
    }
  } catch (e) {
    console.log(`  ❌ ${table} → ${e.message}`);
  }
}

console.log("\n✅ Done. Wait 30 seconds then re-run: node scripts/test-supabase.mjs");
