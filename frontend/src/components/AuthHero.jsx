import { motion } from 'framer-motion';
import {
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Lock,
  ArrowDownLeft,
  ArrowUpRight,
  Target,
} from 'lucide-react';
import BrandLogo from './BrandLogo';

const AuthHero = ({
  headline = 'Understand your money.',
  subheadline = 'Build your future.',
}) => {
  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-gradient-to-br from-[#090d12] via-[#042f2e] to-[#0b131a] text-white flex flex-col justify-between p-8 lg:p-14 selection:bg-teal-500 selection:text-white">
      {/* Ambient Teal/Mint Glow Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          x: [0, 25, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-[-10%] right-[-5%] w-[450px] h-[450px] rounded-full bg-teal-600/25 blur-[130px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1.1, 1, 1.1],
          x: [0, -20, 0],
          y: [0, 25, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-700/20 blur-[140px] pointer-events-none"
      />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Top Header Badge & Brand */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 flex items-center justify-between"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-teal-200">
          <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
          <Sparkles size={13} className="text-teal-300" />
          <span>ArthSetu Financial Intelligence</span>
        </div>

        <div className="hidden xl:flex items-center gap-2 text-xs text-teal-100/80 bg-white/5 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/10">
          <Lock size={13} className="text-teal-400" />
          <span>Private by Design</span>
        </div>
      </motion.div>

      {/* Centerpiece: Interactive Financial Showcase */}
      <div className="relative z-10 my-auto py-10 flex flex-col items-center">
        {/* Floating AI Health Chip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: [0, -6, 0] }}
          transition={{
            opacity: { duration: 0.6 },
            y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="self-end mr-4 sm:mr-12 mb-[-18px] z-20"
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#090d12]/90 backdrop-blur-xl border border-teal-500/30 text-white shadow-2xl text-xs font-medium">
            <div className="h-7 w-7 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Sparkles size={14} />
            </div>
            <div>
              <span className="text-[10px] text-teal-300 block uppercase font-bold tracking-wider">
                Financial Health
              </span>
              <span className="font-extrabold text-white text-xs">Score: 90/100 (Excellent)</span>
            </div>
          </div>
        </motion.div>

        {/* Main Glass Financial Terminal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="w-full max-w-[440px] rounded-3xl bg-slate-900/85 backdrop-blur-2xl border border-white/15 p-6 sm:p-7 shadow-2xl space-y-6 relative"
        >
          {/* Brand Mark in Hero Card */}
          <div className="flex items-center justify-between">
            <BrandLogo size="sm" variant="compact" textColor="text-white" />
            <span className="px-2.5 py-1 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/25 text-[10px] font-extrabold uppercase tracking-wider">
              Live Monitor
            </span>
          </div>

          {/* Balance & Inflow Summary */}
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">
              Surplus Capital Position
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                ₹ 63,100
              </span>
              <span className="text-xs font-bold text-teal-400 bg-teal-500/20 px-2 py-0.5 rounded-md">
                +65% Saved
              </span>
            </div>
          </div>

          {/* Dynamic Inflow vs Outflow Mini-Bars */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <ArrowDownLeft size={14} className="text-teal-400" />
                <span>Monthly Inflow</span>
              </div>
              <span className="text-base font-black text-white">₹ 97,500</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <ArrowUpRight size={14} className="text-rose-400" />
                <span>Controlled Outflow</span>
              </div>
              <span className="text-base font-black text-white">₹ 34,400</span>
            </div>
          </div>

          {/* Visual SVG Trend Sparkline */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Cashflow Trajectory</span>
              <span className="text-teal-300 font-bold">Optimal Growth</span>
            </div>
            <svg viewBox="0 0 380 70" className="w-full h-14 overflow-visible">
              <defs>
                <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 50 Q 70 45, 120 32 T 240 28 T 320 18 T 380 8 L 380 70 L 0 70 Z"
                fill="url(#heroGradient)"
              />
              <path
                d="M 0 50 Q 70 45, 120 32 T 240 28 T 320 18 T 380 8"
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </motion.div>

        {/* Floating Bottom Target Chip */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: [0, 6, 0] }}
          transition={{
            opacity: { duration: 0.6 },
            y: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="self-start ml-4 sm:ml-12 mt-[-18px] z-20"
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#090d12]/90 backdrop-blur-xl border border-teal-500/30 text-white shadow-2xl text-xs font-medium">
            <div className="h-7 w-7 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Target size={14} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">
                Budget Autopilot
              </span>
              <span className="font-extrabold text-teal-300 text-xs">All 4 Categories On Track</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Typography & Brand Tagline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-10 max-w-xl space-y-3"
      >
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
          {headline} <span className="text-teal-400 block">{subheadline}</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300/80 leading-relaxed font-normal">
          ArthSetu AI acts as an intelligent bridge between everyday financial data and smarter
          long-term wealth creation. Experience real-time budgeting and AI spending intelligence.
        </p>
      </motion.div>
    </div>
  );
};

export default AuthHero;
