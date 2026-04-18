"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string | null;
  currency: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, currency: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  forceSignOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load auth state from localStorage on mount
  useEffect(() => {
    console.log("[AuthContext] Initializing auth state...");
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    console.log("[AuthContext] Token found:", !!storedToken);
    console.log("[AuthContext] User found:", !!storedUser);
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("[AuthContext] Restoring session for:", parsedUser.email);
        setToken(storedToken);
        setUser(parsedUser);
        
        // Refresh cookie on root path '/' which covers all subpaths
        const refreshCookie = `token=${storedToken}; path=/; max-age=${60*60*24*7}; SameSite=Lax`;
        document.cookie = refreshCookie;
        console.log("[AuthContext] Cookie refreshed on path='/', covers all i18n routes");
      } catch (e) {
        console.error("[AuthContext] Error parsing stored user:", e);
        // Clear invalid data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    } else {
      console.log("[AuthContext] No stored session found");
    }
    
    setIsLoading(false);
    console.log("[AuthContext] Initialization complete");
  }, []);

  const login = async (email: string, password: string) => {
    console.log("[AuthContext] Login called with email:", email);
    try {
      console.log("[AuthContext] Sending request to /api/auth/login");
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("[AuthContext] Response status:", response.status);
      const data = await response.json();
      console.log("[AuthContext] Response data:", data);

      if (!response.ok) {
        console.log("[AuthContext] Login failed:", data.error);
        return { success: false, error: data.error || "Invalid credentials" };
      }

      // Store auth state
      console.log("[AuthContext] Storing auth state");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Set cookie on root path '/' which automatically covers ALL subpaths (/en/, /ar/, etc.)
      // This is the key fix for i18n session persistence
      const cookieValue = `token=${data.token}; path=/; max-age=${60*60*24*7}; SameSite=Lax`;
      document.cookie = cookieValue;
      console.log("[AuthContext] Cookie set on path='/', covers all routes including /en/ and /ar/");
      
      setToken(data.token);
      setUser(data.user);
      
      console.log("[AuthContext] Login successful");
      return { success: true };
    } catch (error) {
      console.error("[AuthContext] Login error:", error);
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const register = async (name: string, email: string, password: string, currency: string) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, currency }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          return { success: false, error: "An account with this email already exists" };
        }
        if (data.details) {
          const firstError = data.details[0];
          return { success: false, error: `${firstError.path}: ${firstError.message}` };
        }
        return { success: false, error: data.error || "Registration failed" };
      }

      // Store auth state
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Set cookie on root path '/' which automatically covers ALL subpaths (/en/, /ar/, etc.)
      const cookieValue = `token=${data.token}; path=/; max-age=${60*60*24*7}; SameSite=Lax`;
      document.cookie = cookieValue;
      
      setToken(data.token);
      setUser(data.user);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const logout = (force = false) => {
    console.log("[AuthContext] Logging out...", force ? "(forced)" : "");
    
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Clear all possible cookies
    const cookieNames = ["token", "next-auth.session-token", "__Secure-next-auth.session-token"];
    cookieNames.forEach(name => {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `${name}=; path=/en; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `${name}=; path=/ar; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    });
    
    console.log("[AuthContext] All cookies cleared");
    
    setToken(null);
    setUser(null);
    
    // Force reload to clear any stale state
    if (force) {
      window.location.href = "/en/login";
    } else {
      router.push("/");
    }
  };
  
  // Force sign out utility - clears everything and reloads
  const forceSignOut = () => {
    console.log("[AuthContext] FORCE SIGN OUT initiated");
    
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    console.log("[AuthContext] localStorage cleared");
    
    // Clear all possible cookies on all paths
    const cookieNames = ["token", "next-auth.session-token", "__Secure-next-auth.session-token"];
    const paths = ["/", "/en", "/ar", "/en/portfolio", "/ar/portfolio"];
    
    cookieNames.forEach(name => {
      paths.forEach(path => {
        document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      });
      // Also try domain-level clearing
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    });
    
    console.log("[AuthContext] All cookies cleared on all paths");
    
    // Clear state
    setToken(null);
    setUser(null);
    
    // Redirect to root /login
    console.log("[AuthContext] Redirecting to /login");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, forceSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Fallback when AuthProvider is not yet mounted
    // This allows components to render during initial mount
    console.log("[AuthContext] Using fallback (provider not mounted yet)");
    return {
      user: null,
      token: null,
      isLoading: true,
      login: async (email: string, password: string) => {
        console.log("[AuthContext Fallback] Direct login attempt");
        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            return { success: false, error: data.error || "Invalid credentials" };
          }

          // Store auth state directly in localStorage
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          
          // Also set cookie for middleware - root path covers all i18n routes
          if (typeof document !== "undefined") {
            document.cookie = `token=${data.token}; path=/; max-age=${60*60*24*7}; SameSite=Lax`;
          }
          
          return { success: true };
        } catch (error) {
          return { success: false, error: "Network error. Please try again." };
        }
      },
      register: async (name: string, email: string, password: string, currency: string) => {
        console.log("[AuthContext Fallback] Direct register attempt");
        try {
          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, currency }),
          });

          const data = await response.json();

          if (!response.ok) {
            return { success: false, error: data.error || "Registration failed" };
          }

          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          
          return { success: true };
        } catch (error) {
          return { success: false, error: "Network error. Please try again." };
        }
      },
      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (typeof document !== "undefined") {
          document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
      },
      forceSignOut: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (typeof document !== "undefined") {
          // Clear all cookies on all paths
          ["/", "/en", "/ar"].forEach(path => {
            document.cookie = `token=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          });
          // Redirect to root /login
          window.location.href = "/login";
        }
      },
    };
  }
  return context;
}

// Helper function to get auth headers for API calls
export function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Helper to check if user is authenticated
export function isAuthenticated() {
  return !!localStorage.getItem("token");
}

// Protected route wrapper component
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-noir-crimson border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

export default AuthContext;
