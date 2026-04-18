import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (uses service role for admin operations)
export function createServerSupabaseClient(token?: string) {
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
    
  const options: any = {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  };

  if (token) {
    options.global = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }

  return createClient(supabaseUrl, serviceRoleKey, options);
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
