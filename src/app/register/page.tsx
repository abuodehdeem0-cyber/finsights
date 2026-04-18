"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, Check, Loader2, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { Logo } from "@/components/logo";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();
  const { t, isRTL } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await register(name, email, password, currency);
    
    setIsLoading(false);
    
    if (result.success) {
      router.push("/"); // Redirect to dashboard
    } else {
      setError(result.error || "Registration failed. Please try again.");
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
        <GlassCard className="p-8 glow-crimson-lg">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo variant="chart" size="lg" showText={false} />
            </div>
            <h1 className="text-2xl font-bold text-noir-gray mb-2">
              {t.auth.registerTitle}
            </h1>
            <p className="text-noir-gray-dark">
              {t.auth.registerSubtitle}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-signal-sell/20 border border-signal-sell/50 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-signal-sell flex-shrink-0" />
              <p className="text-sm text-signal-sell">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-noir-gray mb-2">
                {t.auth.name}
              </label>
              <div className="relative">
                <User className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-noir-gray-dark`} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isRTL ? "محمد أحمد" : "John Doe"}
                  className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 rounded-lg`}
                  required
                />
              </div>
            </div>

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
                  placeholder="••••••••"
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

            <div>
              <label className="block text-sm font-medium text-noir-gray mb-2">
                {t.auth.currency}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCurrency("USD")}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    currency === "USD"
                      ? "border-noir-crimson bg-noir-crimson/20"
                      : "border-noir-crimson/30 hover:border-noir-crimson/50"
                  }`}
                >
                  <div className="font-medium text-noir-gray">USD</div>
                  <div className="text-xs text-noir-gray-dark">$ {isRTL ? "دولار" : "Dollar"}</div>
                  {currency === "USD" && (
                    <Check className="w-4 h-4 text-signal-buy mx-auto mt-1" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency("SAR")}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    currency === "SAR"
                      ? "border-noir-crimson bg-noir-crimson/20"
                      : "border-noir-crimson/30 hover:border-noir-crimson/50"
                  }`}
                >
                  <div className="font-medium text-noir-gray">SAR</div>
                  <div className="text-xs text-noir-gray-dark">ر.س {isRTL ? "ريال" : "Riyal"}</div>
                  {currency === "SAR" && (
                    <Check className="w-4 h-4 text-signal-buy mx-auto mt-1" />
                  )}
                </button>
              </div>
            </div>

            <div className={`flex items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 rounded border-noir-crimson/30 bg-noir-dark text-noir-crimson focus:ring-noir-crimson"
                required
              />
              <label className={`${isRTL ? 'mr-2' : 'ml-2'} text-sm text-noir-gray-dark`}>
                {isRTL ? "أوافق على " : "I agree to the "}
                <Link
                  href="/terms"
                  className="text-noir-crimson-light hover:text-noir-gray"
                >
                  {isRTL ? "شروط الخدمة" : "Terms of Service"}
                </Link>
                {isRTL ? " و" : " and "}
                <Link
                  href="/privacy"
                  className="text-noir-crimson-light hover:text-noir-gray"
                >
                  {isRTL ? "سياسة الخصوصية" : "Privacy Policy"}
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-crimson py-3 rounded-lg font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className={`w-4 h-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t.auth.signUp}...
                </>
              ) : (
                <>
                  {t.auth.signUp}
                  <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-noir-crimson/30 text-center">
            <p className="text-noir-gray-dark">
              {t.auth.hasAccount}{" "}
              <Link
                href="/login"
                className="text-noir-crimson-light hover:text-noir-gray font-medium transition-colors"
              >
                {t.auth.signIn}
              </Link>
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
