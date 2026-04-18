"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useScroll, useTransform, motion } from "framer-motion";
import {
  TrendingUp,
  Brain,
  Shield,
  Globe,
  Zap,
  ChevronRight,
  BarChart3,
  PieChart,
  Activity,
  ArrowRight,
  Sparkles,
  LineChart,
  Target,
  Lock,
  Clock,
  CheckCircle2,
  Play,
  Search,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";

// Animated counter component
function AnimatedCounter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// Particle background component
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
    }> = [];
    
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }
    
    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74, 15, 15, ${p.alpha})`;
        ctx.fill();
      });
      
      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(74, 15, 15, ${0.1 * (1 - dist / 150)})`;
            ctx.stroke();
          }
        });
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { t, locale, isRTL } = useLanguage();
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchSymbol, setSearchSymbol] = useState("");
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const features = [
    {
      icon: Brain,
      title: t.landing?.features?.aiSignals?.title || "AI-Powered Signals",
      description: t.landing?.features?.aiSignals?.desc || "Advanced machine learning algorithms analyze market patterns to generate precise BUY/SELL/HOLD recommendations with confidence scores.",
      color: "from-noir-crimson to-noir-crimson-light",
    },
    {
      icon: Globe,
      title: t.landing?.features?.dualCurrency?.title || "Dual Currency Support",
      description: t.landing?.features?.dualCurrency?.desc || "Seamless USD/SAR currency handling with real-time conversion. Track investments in your preferred currency with native Saudi market support.",
      color: "from-noir-crimson-light to-noir-crimson-glow",
    },
    {
      icon: Shield,
      title: t.landing?.features?.riskManagement?.title || "Risk Quantization",
      description: t.landing?.features?.riskManagement?.desc || "Comprehensive risk assessment with volatility factors, market correlation analysis, and personalized risk tolerance matching.",
      color: "from-noir-crimson-glow to-signal-buy",
    },
    {
      icon: Zap,
      title: t.landing?.features?.realTime?.title || "Real-Time Intelligence",
      description: t.landing?.features?.realTime?.desc || "Live market data from global exchanges with millisecond-level updates. Never miss an opportunity with instant alerts.",
      color: "from-signal-buy to-noir-crimson",
    },
    {
      icon: BarChart3,
      title: t.landing?.features?.portfolio?.title || "Smart Portfolio",
      description: t.landing?.features?.portfolio?.desc || "Track, analyze, and optimize your holdings with AI-driven insights. Visualize allocation, performance, and drift from target weights.",
      color: "from-noir-crimson to-signal-hold",
    },
    {
      icon: Target,
      title: t.landing?.features?.sectorAnalysis?.title || "Sector Intelligence",
      description: t.landing?.features?.sectorAnalysis?.desc || "Industry heatmaps and sentiment indicators. Identify trending sectors before the crowd with predictive analytics.",
      color: "from-signal-hold to-noir-crimson-light",
    },
  ];

  const stats = [
    { value: 99, suffix: "%", label: t.landing?.stats?.accuracy || "Signal Accuracy" },
    { value: 50, suffix: "+", label: t.landing?.stats?.markets || "Global Markets" },
    { value: 10, suffix: "K+", label: t.landing?.stats?.users || "Active Traders" },
    { value: 24, suffix: "/7", label: t.landing?.stats?.support || "AI Support" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground />
      
      {/* Hero Section */}
      <motion.section
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative min-h-screen flex items-center justify-center px-4"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-noir-crimson/10 via-transparent to-transparent" />
        
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-noir-crimson/20 border border-noir-crimson/30 text-noir-gray text-sm">
              <Sparkles className="w-4 h-4 mr-2 text-noir-crimson-light" />
              {t.landing?.badge || "Next-Gen Financial Intelligence"}
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-noir-gray to-noir-gray bg-clip-text text-transparent">
              {t.landing?.hero?.title1 || "Trade Smarter"}
            </span>
            <br />
            <span className="bg-gradient-to-r from-noir-crimson-light to-noir-crimson-light bg-clip-text text-transparent">
              {t.landing?.hero?.title2 || "With AI Precision"}
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-noir-gray-dark mb-8 max-w-3xl mx-auto"
          >
            {t.landing?.hero?.subtitle || "Premium financial terminal with AI-powered investment signals, real-time market data, and dual-currency portfolio tracking for the modern trader."}
          </motion.p>

          {/* AI Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="max-w-2xl mx-auto mb-10"
          >
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (searchSymbol.trim()) {
                  if (user) {
                    router.push(`/${locale}/analysis?ticker=${searchSymbol.trim().toUpperCase()}`);
                  } else {
                    router.push(`/${locale}/register`);
                  }
                }
              }} 
              className="relative group"
            >
              <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-6 h-6 text-noir-gray-dark group-focus-within:text-noir-crimson-light transition-colors`} />
              <input
                type="text"
                value={searchSymbol}
                onChange={(e) => setSearchSymbol(e.target.value)}
                placeholder={t.analysis?.searchPlaceholder || "Search stocks (e.g., AAPL, 2222.SR)"}
                className={`w-full ${isRTL ? 'pr-14 pl-44' : 'pl-14 pr-44'} py-5 rounded-2xl bg-noir-dark/80 border border-noir-crimson/30 text-noir-gray text-lg placeholder:text-noir-gray-darker focus:outline-none focus:border-noir-crimson-light focus:ring-1 focus:ring-noir-crimson-light/50 transition-all backdrop-blur-xl`}
              />
              <button
                type="submit"
                className={`absolute ${isRTL ? 'left-2' : 'right-2'} top-2 bottom-2 px-8 bg-gradient-to-r from-noir-crimson to-noir-crimson-light rounded-xl font-bold text-noir-gray transition-all flex items-center gap-2`}
              >
                <Brain className="w-5 h-5" />
                <span>{t.analysis?.analyzeButton || "Analyze"}</span>
              </button>
            </form>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href={user ? `/${locale}/dashboard` : `/${locale}/register`}
              className="group relative px-8 py-4 bg-gradient-to-r from-noir-crimson to-noir-crimson-light rounded-xl font-semibold text-noir-gray overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                {user ? (t.landing?.cta?.dashboard || "Enter Dashboard") : (t.landing?.cta?.getStarted || "Get Started Free")}
                <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'} group-hover:translate-x-1 transition-transform`} />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-noir-crimson-light to-noir-crimson opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            
            {!user && (
              <Link
                href={`/${locale}/login`}
                className="group px-8 py-4 glass-card rounded-xl font-semibold text-noir-gray hover:bg-noir-crimson/20 transition-all flex items-center"
              >
                <Lock className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'} text-noir-crimson-light`} />
                {t.landing?.cta?.signIn || "Sign In"}
              </Link>
            )}
            
            {user && (
              <Link
                href={`/${locale}/analysis`}
                className="group px-8 py-4 glass-card rounded-xl font-semibold text-noir-gray hover:bg-noir-crimson/20 transition-all flex items-center"
              >
                <Play className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'} text-noir-crimson-light`} />
                {t.landing?.cta?.demo || "Try AI Analysis"}
              </Link>
            )}
          </motion.div>
          
          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex items-center justify-center gap-8 text-noir-gray-darker text-sm"
          >
            <div className="flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-signal-buy" />
              {t.landing?.trust?.noCard || "No credit card required"}
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-signal-buy" />
              {t.landing?.trust?.freeTier || "Free tier available"}
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-signal-buy" />
              {t.landing?.trust?.cancel || "Cancel anytime"}
            </div>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-noir-crimson/30 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-noir-crimson-light"
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Stats Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <GlassCard className="p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-noir-gray to-noir-crimson-light bg-clip-text text-transparent mb-2">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-noir-gray-dark text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-noir-gray to-noir-crimson-light bg-clip-text text-transparent">
                {t.landing?.features?.title || "Everything You Need"}
              </span>
            </h2>
            <p className="text-noir-gray-dark text-lg max-w-2xl mx-auto">
              {t.landing?.features?.subtitle || "Professional-grade tools powered by artificial intelligence for modern investors."}
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={itemVariants}>
                <GlassCard className="h-full p-6 interactive-glow group hover:border-noir-crimson/50 transition-all">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6 text-noir-gray" />
                  </div>
                  <h3 className="text-xl font-semibold text-noir-gray mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-noir-gray-dark leading-relaxed">
                    {feature.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-noir-gray to-noir-crimson-light bg-clip-text text-transparent">
                {t.landing?.howItWorks?.title || "How It Works"}
              </span>
            </h2>
            <p className="text-noir-gray-dark text-lg max-w-2xl mx-auto">
              {t.landing?.howItWorks?.subtitle || "Start trading smarter in three simple steps."}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Lock,
                title: t.landing?.howItWorks?.step1?.title || "Create Account",
                description: t.landing?.howItWorks?.step1?.desc || "Sign up in seconds. Secure authentication with encrypted data protection.",
              },
              {
                step: "02",
                icon: LineChart,
                title: t.landing?.howItWorks?.step2?.title || "Get AI Signals",
                description: t.landing?.howItWorks?.step2?.desc || "Receive real-time BUY/SELL/HOLD recommendations with confidence scores and risk analysis.",
              },
              {
                step: "03",
                icon: TrendingUp,
                title: t.landing?.howItWorks?.step3?.title || "Trade & Track",
                description: t.landing?.howItWorks?.step3?.desc || "Execute trades and monitor your portfolio performance with advanced analytics.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: index === 0 ? -30 : index === 2 ? 30 : 0 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <GlassCard className="h-full p-8 text-center interactive-glow">
                  <div className="text-6xl font-bold text-noir-crimson/20 mb-4">
                    {item.step}
                  </div>
                  <div className="w-16 h-16 rounded-full bg-noir-crimson/20 flex items-center justify-center mx-auto mb-6">
                    <item.icon className="w-8 h-8 text-noir-crimson-light" />
                  </div>
                  <h3 className="text-xl font-semibold text-noir-gray mb-3">
                    {item.title}
                  </h3>
                  <p className="text-noir-gray-dark">
                    {item.description}
                  </p>
                </GlassCard>
                {index < 2 && (
                  <div className={`hidden md:block absolute top-1/2 ${isRTL ? '-left-4' : '-right-4'} transform -translate-y-1/2`}>
                    <ChevronRight className={`w-8 h-8 text-noir-crimson/30 ${isRTL ? 'rotate-180' : ''}`} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Markets Section */}
      <section className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-noir-gray to-noir-crimson-light bg-clip-text text-transparent">
                {t.landing?.markets?.title || "Global Market Coverage"}
              </span>
            </h2>
            <p className="text-noir-gray-dark text-lg max-w-2xl mx-auto">
              {t.landing?.markets?.subtitle || "Access major exchanges worldwide with real-time data and AI-powered insights."}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Saudi Market Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <GlassCard className="h-full p-8 interactive-glow">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-noir-crimson to-noir-crimson-light flex items-center justify-center mr-4">
                    <Globe className="w-7 h-7 text-noir-gray" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-noir-gray">
                      {t.landing?.markets?.saudi?.title || "Saudi Market (TADAWUL)"}
                    </h3>
                    <p className="text-noir-gray-dark">
                      {t.landing?.markets?.saudi?.subtitle || "Native SAR support with local stock coverage"}
                    </p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {(t.landing?.markets?.saudi?.features || [
                    "All TADAWUL listed stocks",
                    "Real-time TASI index tracking",
                    "Saudi Aramco, SABIC, Al Rajhi Bank",
                    "SAR-native portfolio tracking",
                  ]).map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-center text-noir-gray-dark">
                      <CheckCircle2 className="w-5 h-5 mr-3 text-signal-buy flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={user ? `/${locale}/sectors` : `/${locale}/register`}
                  className="mt-6 inline-flex items-center text-noir-crimson-light hover:text-noir-gray transition-colors"
                >
                  {t.landing?.markets?.explore || "Explore Sectors"}
                  <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                </Link>
              </GlassCard>
            </motion.div>

            {/* US Market Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <GlassCard className="h-full p-8 interactive-glow">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-noir-crimson-light to-noir-crimson-glow flex items-center justify-center mr-4">
                    <Activity className="w-7 h-7 text-noir-gray" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-noir-gray">
                      {t.landing?.markets?.us?.title || "US Markets"}
                    </h3>
                    <p className="text-noir-gray-dark">
                      {t.landing?.markets?.us?.subtitle || "NYSE & NASDAQ coverage"}
                    </p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {(t.landing?.markets?.us?.features || [
                    "NYSE & NASDAQ stocks",
                    "S&P 500, NASDAQ, DOW indices",
                    "Major tech and blue-chip stocks",
                    "USD portfolio tracking with SAR conversion",
                  ]).map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-center text-noir-gray-dark">
                      <CheckCircle2 className="w-5 h-5 mr-3 text-signal-buy flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={user ? `/${locale}/analysis` : `/${locale}/register`}
                  className="mt-6 inline-flex items-center text-noir-crimson-light hover:text-noir-gray transition-colors"
                >
                  {t.landing?.markets?.analyze || "Analyze Stocks"}
                  <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                </Link>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials/Trust Section */}
      <section className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-noir-gray to-noir-crimson-light bg-clip-text text-transparent">
                {t.landing?.security?.title || "Enterprise-Grade Security"}
              </span>
            </h2>
            <p className="text-noir-gray-dark text-lg max-w-2xl mx-auto">
              {t.landing?.security?.subtitle || "Your data is protected with the same security standards used by major financial institutions."}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Lock, title: t.landing?.security?.encryption || "256-bit Encryption" },
              { icon: Clock, title: t.landing?.security?.uptime || "99.9% Uptime" },
              { icon: Shield, title: t.landing?.security?.compliance || "SOC 2 Compliant" },
              { icon: Activity, title: t.landing?.security?.monitoring || "24/7 Monitoring" },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-6 text-center interactive-glow">
                  <item.icon className="w-10 h-10 text-noir-crimson-light mx-auto mb-4" />
                  <h4 className="text-noir-gray font-semibold">{item.title}</h4>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <GlassCard className="p-12 md:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-noir-crimson/20 to-transparent" />
              
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-noir-gray to-noir-crimson-light bg-clip-text text-transparent">
                    {t.landing?.cta?.title || "Ready to Trade Smarter?"}
                  </span>
                </h2>
                <p className="text-noir-gray-dark text-lg mb-8 max-w-xl mx-auto">
                  {t.landing?.cta?.subtitle || "Join thousands of traders who have elevated their investment strategy with FinSight AI."}
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href={user ? `/${locale}/dashboard` : `/${locale}/register`}
                    className="px-8 py-4 bg-gradient-to-r from-noir-crimson to-noir-crimson-light rounded-xl font-semibold text-noir-gray transition-all"
                  >
                    {user ? (t.landing?.cta?.goToDashboard || "Go to Dashboard") : (t.landing?.cta?.startFree || "Start Free Trial")}
                  </Link>
                  
                  {!user && (
                    <Link
                      href={`/${locale}/login`}
                      className="px-8 py-4 glass-card rounded-xl font-semibold text-noir-gray hover:bg-noir-crimson/20 transition-all"
                    >
                      {t.landing?.cta?.signIn || "Sign In"}
                    </Link>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-noir-crimson/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-noir-gray font-semibold mb-4">{t.landing?.footer?.product || "Product"}</h4>
              <ul className="space-y-2">
                <li><Link href={user ? `/${locale}/analysis` : `/${locale}/register`} className="text-noir-gray-dark hover:text-noir-gray transition-colors">{t.nav.analysis}</Link></li>
                <li><Link href={user ? `/${locale}/sectors` : `/${locale}/register`} className="text-noir-gray-dark hover:text-noir-gray transition-colors">{t.nav.sectors}</Link></li>
                <li><Link href={user ? `/${locale}/portfolio` : `/${locale}/register`} className="text-noir-gray-dark hover:text-noir-gray transition-colors">{t.nav.portfolio}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-noir-gray font-semibold mb-4">{t.landing?.footer?.account || "Account"}</h4>
              <ul className="space-y-2">
                <li><Link href={`/${locale}/login`} className="text-noir-gray-dark hover:text-noir-gray transition-colors">{t.nav.login}</Link></li>
                <li><Link href={`/${locale}/register`} className="text-noir-gray-dark hover:text-noir-gray transition-colors">{t.nav.register}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-noir-gray font-semibold mb-4">{t.landing?.footer?.support || "Support"}</h4>
              <ul className="space-y-2">
                <li><span className="text-noir-gray-dark">help@finsight.ai</span></li>
                <li><span className="text-noir-gray-dark">24/7 AI Chat</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-noir-gray font-semibold mb-4">{t.landing?.footer?.legal || "Legal"}</h4>
              <ul className="space-y-2">
                <li><span className="text-noir-gray-dark">{t.landing?.footer?.privacy || "Privacy Policy"}</span></li>
                <li><span className="text-noir-gray-dark">{t.landing?.footer?.terms || "Terms of Service"}</span></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-noir-crimson/20 flex flex-col md:flex-row items-center justify-between">
            <p className="text-noir-gray-darker text-sm">
              © 2025 FinSight. {t.landing?.footer?.rights || "All rights reserved."}
            </p>
            <p className="text-noir-gray-darker text-xs mt-2 md:mt-0">
              {t.landing?.footer?.disclaimer || "For educational purposes only. Not financial advice."}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
