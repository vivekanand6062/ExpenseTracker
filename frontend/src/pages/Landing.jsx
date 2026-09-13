import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Layers,
  PieChart as PieChartIcon,
  CheckCircle2,
  Lock,
  ChevronRight,
  Compass,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import BrandLogo from '../components/BrandLogo';
import { useAuth } from '../context/useAuth';

const SAMPLE_CHART_DATA = [
  { month: 'May', income: 78000, expense: 32000 },
  { month: 'Jun', income: 84000, expense: 34500 },
  { month: 'Jul', income: 81000, expense: 29000 },
  { month: 'Aug', income: 92000, expense: 38000 },
  { month: 'Sep', income: 97500, expense: 34400 },
];

const AI_SAMPLE_QUESTIONS = [
  {
    q: 'Where did I spend the most this month?',
    a: 'Housing & Rent accounted for 64% (₹22,000) of your total monthly outflow, followed by Groceries at 20% (₹6,800).',
    badge: 'Category Breakdown',
  },
  {
    q: 'How has my spending changed?',
    a: 'Your discretionary dining & entertainment dropped by 18% compared to August, improving your net savings surplus to 65%.',
    badge: 'Trend Delta',
  },
  {
    q: 'What are my biggest expense categories?',
    a: 'Top 3: 1) Housing (₹22k), 2) Essentials & Groceries (₹6.8k), 3) Utilities & High-speed Internet (₹2.4k).',
    badge: 'Ranked Spending',
  },
  {
    q: 'Summarize my finances this month.',
    a: 'Health Score: 90/100 (Excellent). Inflow ₹97,500 vs Outflow ₹34,400. You are comfortably on track with an optimal 65% savings rate.',
    badge: 'Executive Summary',
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedAiIdx, setSelectedAiIdx] = useState(0);

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-slate-900 flex flex-col selection:bg-teal-500/20 selection:text-teal-900">
      {/* 1. TOP STICKY NAVIGATION */}
      <header className="sticky top-0 z-50 bg-[#fcfbf9]/85 backdrop-blur-md border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <BrandLogo size="md" variant="compact" />

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-teal-700 transition">
              Expense Intelligence
            </a>
            <a href="#ai-insights" className="hover:text-teal-700 transition">
              AI Insights
            </a>
            <a href="#trends" className="hover:text-teal-700 transition">
              Spending Trends
            </a>
            <a href="#assistant" className="hover:text-teal-700 transition">
              AI Assistant
            </a>
            <a href="#privacy" className="hover:text-teal-700 transition">
              Privacy
            </a>
          </nav>

          {/* Auth Action Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-md shadow-teal-900/15 transition cursor-pointer"
              >
                <span>Go to Command Center</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-teal-800 hover:bg-slate-100/80 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition"
                >
                  <span>Start tracking for free</span>
                  <ArrowRight size={13} />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-14 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-teal-200/30 via-emerald-100/20 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold tracking-wider uppercase mb-6"
          >
            <Sparkles size={13} className="text-teal-600" />
            <span>AI-POWERED PERSONAL FINANCE</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]"
          >
            Understand your money.{' '}
            <span className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Build your future.
            </span>
          </motion.h1>

          {/* Supporting Text */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed"
          >
            ArthSetu AI turns everyday spending into clear financial insights, helping you track
            expenses, understand patterns, and make smarter decisions with your money.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5"
          >
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-bold shadow-lg shadow-teal-900/15 hover:shadow-teal-900/25 transition cursor-pointer"
            >
              <span>Start tracking for free</span>
              <ArrowRight size={16} />
            </Link>

            <a
              href="#preview"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold shadow-2xs transition"
            >
              <Compass size={16} className="text-teal-700" />
              <span>Explore ArthSetu AI</span>
            </a>
          </motion.div>

          {/* Supporting Microcopy */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500"
          >
            <ShieldCheck size={14} className="text-teal-600" />
            <span>Private by design • Built for smarter financial decisions</span>
          </motion.div>

          {/* 3. LIVE INTERACTIVE PRODUCT PREVIEW MOCKUP */}
          <motion.div
            id="preview"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="mt-14 rounded-3xl bg-white border border-slate-200/90 shadow-2xl p-5 sm:p-7 text-left relative overflow-hidden"
          >
            {/* Mock Window Controls Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-[11px] font-semibold text-slate-400 ml-2">
                  ArthSetu AI — Command Center
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200/70 text-[11px] font-bold">
                <Sparkles size={12} />
                <span>Live Analytics Sync</span>
              </div>
            </div>

            {/* Quick KPI Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-[#fcfbf9] border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-500 block">Total Net Balance</span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 block">
                  ₹ 63,100
                </span>
                <span className="text-[10px] text-teal-700 font-semibold mt-1 inline-flex items-center gap-1">
                  <TrendingUp size={11} />
                  <span>Optimal Surplus</span>
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#fcfbf9] border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-500 block">Monthly Inflows</span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 block">
                  ₹ 97,500
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-flex items-center gap-1">
                  <ArrowDownLeft size={11} />
                  <span>Salary + Freelance</span>
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#fcfbf9] border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-500 block">Monthly Outflows</span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 block">
                  ₹ 34,400
                </span>
                <span className="text-[10px] text-rose-500 font-semibold mt-1 inline-flex items-center gap-1">
                  <ArrowUpRight size={11} />
                  <span>4 Active Categories</span>
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#fcfbf9] border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-500 block">Health Score</span>
                <span className="text-xl sm:text-2xl font-black text-teal-700 tracking-tight mt-1 block">
                  90 / 100
                </span>
                <span className="text-[10px] text-teal-800 font-bold uppercase mt-1 block">
                  Excellent Trajectory
                </span>
              </div>
            </div>

            {/* Interactive Preview Chart */}
            <div className="h-56 sm:h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SAMPLE_CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="landingTeal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="landingRose" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    formatter={(val) => [`₹${Number(val).toLocaleString()}`, '']}
                    contentStyle={{
                      backgroundColor: '#090d12',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#landingTeal)" />
                  <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#landingRose)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. EXPENSE INTELLIGENCE & FINANCIAL OVERVIEW */}
      <section id="features" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/70">
              EXPENSE INTELLIGENCE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-4">
              Know where your money actually goes.
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
              Turn everyday transactions into a clear picture of your spending. ArthSetu AI bridges
              raw numbers with intelligent categorization and live budget safeguards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl bg-[#fcfbf9] border border-slate-200/80 hover:border-teal-500/40 transition shadow-2xs">
              <div className="h-10 w-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-4">
                <Layers size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Smart Categorization</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Less manual work. Cleaner finances. 17 pre-configured financial categories (Groceries, Utilities, Housing, Subscriptions) plus unlimited personal custom tags.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl bg-[#fcfbf9] border border-slate-200/80 hover:border-teal-500/40 transition shadow-2xs">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                <TrendingUp size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Live Budget Tracking</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Define monthly or weekly targets. Our backend joins budget limits with active transaction spending in real time, alerting you before you overspend.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl bg-[#fcfbf9] border border-slate-200/80 hover:border-teal-500/40 transition shadow-2xs">
              <div className="h-10 w-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-4">
                <PieChartIcon size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Complete Financial Overview</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                See the complete picture, not isolated transactions. Evaluate cash flow trends, savings percentages, and multi-month trajectories at a glance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. AI FINANCIAL INSIGHTS (Gemini 2.5 / 3.6 Flash) */}
      <section id="ai-insights" className="py-20 bg-[#090d12] text-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-300 border border-white/15 text-xs font-bold">
                <Sparkles size={13} className="text-teal-400" />
                <span>AI FINANCIAL INTELLIGENCE</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Your finances, explained.
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                ArthSetu AI analyzes your financial activity and surfaces meaningful patterns so you
                spend less time interpreting data and more time building capital.
              </p>

              <div className="space-y-3 pt-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-teal-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300">
                    <strong>Health-Score Gauge (0–100):</strong> Instant benchmark of monthly savings rate and cashflow resilience.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-teal-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300">
                    <strong>4 Ranked Savings Tips:</strong> Category-specific reductions showing exact estimated ₹ monthly savings.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-teal-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300">
                    <strong>Budget Verdicts:</strong> Automated status audits giving specific guidance when approaching limits.
                  </span>
                </div>
              </div>
            </div>

            {/* AI Report Showcase Card */}
            <div className="w-full lg:w-[480px] p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                  September Summary
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-black">
                  Score: 90/100
                </span>
              </div>
              <h4 className="text-lg font-extrabold text-white">Optimal Savings Trajectory</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                During September, you earned ₹97,500 and spent ₹34,400, resulting in an exceptional net savings rate of 65%.
              </p>
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
                <span className="text-[11px] font-bold text-teal-300 block">Top Recommendation</span>
                <p className="text-xs text-slate-300">
                  Batch grocery purchases and review subscriptions to free up another ₹2,400 monthly for index investing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CONVERSATIONAL AI ASSISTANT SHOWCASE */}
      <section id="assistant" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/70">
              CONVERSATIONAL INTELLIGENCE
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Ask your money anything.
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2">
              Select an example question to see how ArthSetu AI interprets your financial dataset:
            </p>
          </div>

          {/* Interactive Question Selector Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {AI_SAMPLE_QUESTIONS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedAiIdx(idx)}
                className={`p-4 rounded-2xl text-left border transition cursor-pointer flex items-center justify-between ${
                  selectedAiIdx === idx
                    ? 'bg-teal-50/80 border-teal-500 shadow-xs'
                    : 'bg-[#fcfbf9] border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block mb-1">
                    {item.badge}
                  </span>
                  <span className="text-xs font-bold text-slate-800">{item.q}</span>
                </div>
                <ChevronRight
                  size={16}
                  className={`transition ${selectedAiIdx === idx ? 'text-teal-700 translate-x-1' : 'text-slate-400'}`}
                />
              </button>
            ))}
          </div>

          {/* AI Response Display Box */}
          <div className="p-6 rounded-3xl bg-[#090d12] text-white border border-slate-800 shadow-md flex items-start gap-4">
            <div className="h-9 w-9 rounded-xl bg-teal-600/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles size={18} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-teal-400 block uppercase tracking-wider mb-1">
                ArthSetu AI Response
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {AI_SAMPLE_QUESTIONS[selectedAiIdx].a}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PRIVACY & SECURITY PROMISE */}
      <section id="privacy" className="py-16 bg-[#fcfbf9] border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-teal-100 text-teal-800 mb-2">
            <Lock size={22} />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Financial Information Requires Trust.
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
            ArthSetu AI is engineered with stateless JWT sessions, robust bcrypt.js password hashing,
            and isolated database scoping. We do not sell your personal data or partner with ad brokers.
          </p>
        </div>
      </section>

      {/* 8. FINAL CTA SECTION */}
      <section className="py-20 bg-gradient-to-b from-white to-[#fcfbf9] border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Your money already tells a story.{' '}
            <span className="text-teal-700 block mt-1">ArthSetu AI helps you understand it.</span>
          </h2>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            Bridge the gap between raw transactions and smarter wealth-building decisions today.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-extrabold shadow-xl shadow-teal-900/20 transition cursor-pointer"
            >
              <span>Start tracking for free</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="mt-auto py-10 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <BrandLogo size="sm" variant="compact" />
          <p>© {new Date().getFullYear()} ArthSetu AI. Understand your money. Build your future.</p>
          <div className="flex items-center gap-5 font-semibold">
            <Link to="/login" className="hover:text-teal-700 transition">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-teal-700 transition">
              Create Account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
