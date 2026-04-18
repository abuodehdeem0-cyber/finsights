"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, AlertCircle, Info } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { Logo } from "@/components/logo";
import { showToast } from "@/components/toast";

function LoginContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, isRTL, locale } = useLanguage();

  // Check for auth required message from middleware redirect
  useEffect(() => {
    const message = searchParams.get("message");
    if (message === "auth_required") {
      setAuthMessage(t.messages.authRequired);
      showToast(t.messages.authRequired, "warning");
    }
  }, [searchParams, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[Login] Form submitted");
    setError("");
    setAuthMessage(null);
    setShake(false);
    
    if (isLoading) {
      console.log("[Login] Already loading, skipping");
      return;
    }
    
    setIsLoading(true);
    console.log("[Login] Calling login API...");

    try {
      const result = await login(email, password);
      console.log("[Login] Result:", result);
      
      if (result.success) {
        console.log("[Login] Success, redirecting...");
        const redirect = searchParams.get("redirect");
        router.push(redirect || `/${locale}/dashboard`);
      } else {
        console.log("[Login] Failed:", result.error);
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setError(result.error || t.messages.loginError);
      }
    } catch (err) {
      console.error("[Login] Error:", err);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setError(t.messages.error);
    } finally {
      console.log("[Login] Setting isLoading to false");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <GlassCard className={`p-8 glow-crimson-lg ${shake ? 'animate-shake' : ''}`}>
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo variant="chart" size="lg" showText={false} />
            </div>
            <h1 className="text-2xl font-bold text-noir-gray mb-2">
              {t.auth.loginTitle}
            </h1>
            <p className="text-noir-gray-dark">
              {t.auth.loginSubtitle}
            </p>
          </div>

          {authMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-yellow-500/20 border border-yellow-500/50 flex items-center gap-3 mb-4"
            >
              <Info className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <p className="text-sm text-yellow-500">{authMessage}</p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-signal-sell/20 border border-signal-sell/50 flex items-center gap-3 mb-4"
            >
              <AlertCircle className="w-5 h-5 text-signal-sell flex-shrink-0" />
              <p className="text-sm text-signal-sell">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-noir-gray mb-2">
                {t.auth.email}
              </label>
              <div className="relative">
                <Mail className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-noir-gray-dark`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isRTL ? "اسم@مثال.com" : "trader@finsight.com"}
                  className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 rounded-lg`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-noir-gray mb-2">
                {t.auth.password}
              </label>
              <div className="relative">
                <Lock className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-noir-gray-dark`} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRTL ? "••••••••" : "••••••••"}
                  className={`w-full ${isRTL ? 'pr-12 pl-12' : 'pl-12 pr-12'} py-3 rounded-lg`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 transform -translate-y-1/2 text-noir-gray-dark hover:text-noir-gray`}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-noir-crimson/30 bg-noir-dark text-noir-crimson focus:ring-noir-crimson"
                />
                <span className={`${isRTL ? 'mr-2' : 'ml-2'} text-noir-gray-dark`}>{t.auth.rememberMe}</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-noir-crimson-light hover:text-noir-gray transition-colors"
              >
                {t.auth.forgotPassword}
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-crimson py-3 rounded-lg font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className={isRTL ? 'mr-2' : 'ml-2'}>
                    {t.auth.signIn}...
                  </span>
                </>
              ) : (
                <>
                  {t.auth.signIn}
                  <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-noir-crimson/30 text-center">
            <p className="text-noir-gray-dark">
              {t.auth.noAccount}{" "}
              <Link
                href="/register"
                className="text-noir-crimson-light hover:text-noir-gray font-medium transition-colors"
              >
                {t.auth.registerButton}
              </Link>
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-noir-crimson" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
