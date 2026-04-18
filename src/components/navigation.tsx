"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  TrendingUp,
  PieChart,
  Grid3X3,
  LogIn,
  UserPlus,
  LogOut,
  User,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLanguage } from "@/lib/language-context";

// Navigation items using translations
const getNavItems = (t: any) => ({
  public: [
    { name: t.nav.dashboard, href: "/", icon: LayoutDashboard },
    { name: t.nav.analysis, href: "/analysis", icon: TrendingUp },
    { name: t.nav.sectors, href: "/sectors", icon: Grid3X3 },
  ],
  auth: [
    { name: t.nav.login, href: "/login", icon: LogIn },
    { name: t.nav.register, href: "/register", icon: UserPlus },
  ],
  private: [
    { name: t.nav.dashboard, href: "/", icon: LayoutDashboard },
    { name: t.nav.analysis, href: "/analysis", icon: TrendingUp },
    { name: t.nav.portfolio, href: "/portfolio", icon: PieChart },
    { name: t.nav.sectors, href: "/sectors", icon: Grid3X3 },
  ],
});

export function Navigation() {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const { isRTL, t, locale } = useLanguage();
  
  const navItemsConfig = getNavItems(t);
  const navItems = user ? navItemsConfig.private : [...navItemsConfig.public, ...navItemsConfig.auth];

  return (
    <motion.nav
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-noir-crimson/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <Logo variant="chart" size="md" showText={true} />
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              // Ensure that paths are localized natively
              const resolvedHref = item.href === "/" ? `/${locale}` : `/${locale}${item.href}`;
              
              // Normalize pathname for active checking
              const isActive = pathname === resolvedHref || pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={resolvedHref}
                  className={cn(
                    "relative px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200",
                    "text-noir-gray-dark hover:text-noir-gray hover:bg-noir-crimson/20",
                    isActive && "text-noir-gray"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-noir-crimson/30 rounded-lg"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </span>
                </Link>
              );
            })}
          </div>

          <div className={`flex items-center ${isRTL ? "space-x-reverse space-x-3" : "space-x-3"}`}>
            <LanguageSwitcher />
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-noir-crimson animate-spin" />
            ) : user ? (
              <div className={`flex items-center ${isRTL ? "space-x-reverse space-x-3" : "space-x-3"}`}>
                <div className={`flex items-center ${isRTL ? "space-x-reverse space-x-2" : "space-x-2"} px-3 py-1.5 rounded-full glass-card`}>
                  <User className="w-4 h-4 text-noir-crimson-light" />
                  <span className="text-sm text-noir-gray">{user.name || user.email}</span>
                </div>
                <button
                  onClick={logout}
                  className={`flex items-center ${isRTL ? "space-x-reverse space-x-2" : "space-x-2"} px-3 py-1.5 rounded-full glass-card hover:bg-signal-sell/20 transition-colors`}
                >
                  <LogOut className="w-4 h-4 text-signal-sell" />
                  <span className="text-sm text-signal-sell">{t.nav.logout}</span>
                </button>
              </div>
            ) : (
              <div className={`flex items-center ${isRTL ? "space-x-reverse space-x-2" : "space-x-2"} px-3 py-1.5 rounded-full glass-card`}>
                <div className="w-2 h-2 rounded-full bg-signal-buy pulse-live" />
                <span className="text-xs text-noir-gray-dark uppercase tracking-wider">
                  {t.nav.live}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-noir-crimson/50 to-transparent" />
    </motion.nav>
  );
}
