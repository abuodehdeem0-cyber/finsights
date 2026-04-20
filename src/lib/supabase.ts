import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client for AUTH VERIFICATION only (uses anon key + user JWT)
export function createServerSupabaseClient(token?: string) {
  const options: any = {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  };

  if (token) {
    options.global = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  // Use anon key — only for verifying tokens via supabase.auth.getUser()
  return createClient(supabaseUrl, supabaseAnonKey, options);
}

// Admin Supabase client — uses SERVICE ROLE KEY, bypasses RLS entirely.
// Use this AFTER you have verified the user's identity via getUserIdFromRequest().
// NEVER expose this client to the browser.
export function createAdminSupabaseClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to your .env.local and Vercel environment variables."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Database types matching our schema
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string | null;
          currency?: string;
          updated_at?: string;
        };
      };
      portfolios: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          shares: number;
          avg_price: number;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          symbol: string;
          shares: number;
          avg_price: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          shares?: number;
          avg_price?: number;
          currency?: string;
          updated_at?: string;
        };
      };
      watchlists: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          target_price: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          symbol: string;
          target_price?: number | null;
          notes?: string | null;
        };
        Update: {
          target_price?: number | null;
          notes?: string | null;
        };
      };
      alerts: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          condition: string;
          price: number;
          is_active: boolean;
          created_at: string;
          triggered_at: string | null;
        };
        Insert: {
          user_id: string;
          symbol: string;
          condition: string;
          price: number;
          is_active?: boolean;
        };
        Update: {
          is_active?: boolean;
          triggered_at?: string | null;
        };
      };
    };
  };
};
