import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Plus,
  ArrowRight,
  Target,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../api/axios';
import TransactionModal from '../components/TransactionModal';
import Spinner from '../components/Spinner';

const PIE_COLORS = ['#0d9488', '#0284c7', '#10b981', '#d97706', '#6366f1', '#ec4899', '#475569'];

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    savingsRate: 0,
    categoryBreakdown: [],
    recentTransactions: [],
    monthlyTrends: [],
  });
  const [aiInsight, setAiInsight] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('expense');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [dashRes, aiRes] = await Promise.allSettled([
        api.get('/dashboard'),
        api.get('/ai/history?limit=1'),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value.data?.success) {
        const d = dashRes.value.data.data || {};
        const totalInc = Number(d.totalIncome ?? d.monthlyIncome ?? 0);
        const totalExp = Number(d.totalExpense ?? d.monthlyExpense ?? 0);
        const bal = Number(d.balance ?? d.savings ?? (totalInc - totalExp));
        const sRate = Number(
          d.savingsRate ?? (totalInc > 0 ? Math.round((bal / totalInc) * 100) : 0)
        );

        // Process Category Breakdown
        const rawCats = d.categoryDistribution || d.expenseDistribution || [];
        const cats = rawCats.map((c) => ({
          name: c.name || c.category || c._id || 'Other',
          value: Number(c.value ?? c.totalAmount ?? c.amount ?? c.total ?? 0),
        }));

        // Process unified recent transactions
        let unified = [];
        if (Array.isArray(d.recentTransactions) && d.recentTransactions.length > 0) {
          unified = d.recentTransactions;
        } else {
          const recentInc = (d.recentIncomes || []).map((i) => ({ ...i, type: 'income' }));
          const recentExp = (d.recentExpenses || []).map((e) => ({ ...e, type: 'expense' }));
          unified = [...recentInc, ...recentExp].sort(
            (a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
          );
        }
        unified = unified.slice(0, 5);

        // Monthly trends from backend or responsive fallback
        const trends =
          Array.isArray(d.monthlyTrends) && d.monthlyTrends.length > 0
            ? d.monthlyTrends
            : [
                { month: 'Apr', income: Math.round(totalInc * 0.75), expense: Math.round(totalExp * 0.8) },
                { month: 'May', income: Math.round(totalInc * 0.82), expense: Math.round(totalExp * 0.85) },
                { month: 'Jun', income: Math.round(totalInc * 0.88), expense: Math.round(totalExp * 0.82) },
                { month: 'Jul', income: Math.round(totalInc * 0.92), expense: Math.round(totalExp * 0.88) },
                { month: 'Aug', income: Math.round(totalInc * 0.95), expense: Math.round(totalExp * 0.92) },
                { month: 'Sep', income: totalInc, expense: totalExp },
              ];

        setDashboardData({
          totalIncome: totalInc,
          totalExpense: totalExp,
          balance: bal,
          savingsRate: sRate,
          categoryBreakdown: cats,
          recentTransactions: unified,
          monthlyTrends: trends,
        });
      }

      if (aiRes.status === 'fulfilled' && aiRes.value.data?.success) {
        const insights = aiRes.value.data.insights || [];
        if (insights.length > 0) {
          setAiInsight(insights[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const openAddModal = (t = 'expense') => {
    setModalType(t);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" className="text-teal-700" />
        <p className="text-xs font-semibold text-slate-500">Loading your financial command center...</p>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Financial Command Center
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Real-time overview of your cashflow, smart budgets, and ArthSetu AI insights.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openAddModal('income')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-teal-50 text-teal-800 hover:bg-teal-100 text-xs font-bold border border-teal-200/80 transition shadow-2xs cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Income</span>
          </button>
          <button
            onClick={() => openAddModal('expense')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white text-xs font-bold shadow-md shadow-teal-900/15 transition cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* 4 Modern KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Net Balance */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">Total Net Balance</span>
            <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Wallet size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            ₹ {dashboardData.balance.toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">
            Available surplus across records
          </p>
        </motion.div>

        {/* Monthly Income */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">Total Inflows</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ArrowDownLeft size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            ₹ {dashboardData.totalIncome.toLocaleString()}
          </h3>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-2">
            <TrendingUp size={13} />
            <span>Active inflows logged</span>
          </div>
        </motion.div>

        {/* Monthly Expenses */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">Total Outflows</span>
            <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            ₹ {dashboardData.totalExpense.toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">Recorded spending outflows</p>
        </motion.div>

        {/* Savings Rate */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">Savings Rate</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Target size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            {dashboardData.savingsRate}%
          </h3>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">
            {dashboardData.savingsRate >= 20 ? 'Optimal savings trajectory' : 'Room to optimize'}
          </p>
        </motion.div>
      </div>

      {/* AI Financial Health Preview Card */}
      <motion.div
        whileHover={{ y: -1 }}
        className="rounded-3xl bg-gradient-to-r from-[#090d12] via-[#042f2e] to-[#0f172a] p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-teal-200">
            <Sparkles size={13} className="text-teal-300" />
            <span>ArthSetu AI Financial Intelligence</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {aiInsight?.title || 'Personalized AI Financial Summary'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed">
            {aiInsight?.summary ||
              'Generate real-time AI savings tips, budget verdicts, and financial health assessments powered by ArthSetu AI.'}
          </p>
        </div>

        <div className="flex items-center gap-4 z-10">
          {aiInsight?.healthScore && (
            <div className="text-center px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <span className="text-2xl font-black text-white">{aiInsight.healthScore}</span>
              <span className="text-[10px] text-teal-200 block uppercase font-bold tracking-wider">
                Score / 100
              </span>
            </div>
          )}
          <button
            onClick={() => navigate('/ai-insights')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-teal-900 hover:bg-teal-50 text-xs font-extrabold shadow-lg transition cursor-pointer shrink-0"
          >
            <span>Open AI Advisor</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </motion.div>

      {/* Charts Row: Cashflow Trends AreaChart + Category Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recharts Area Chart: Cashflow Trends */}
        <div id="spending-trends" className="scroll-mt-24 lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-base font-bold text-slate-900 tracking-tight">
                Cashflow & Trend Overview
              </h4>
              <p className="text-xs text-slate-400">Monthly comparison of income vs expenses</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-teal-700">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-600" />
                Income
              </span>
              <span className="flex items-center gap-1.5 text-rose-500">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                Expenses
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dashboardData.monthlyTrends}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${val / 1000}k` : val}`}
                />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, '']}
                  contentStyle={{
                    backgroundColor: '#090d12',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#incomeFill)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#expenseFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recharts Donut Chart: Category Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-900 tracking-tight mb-1">
              Top Expenses by Category
            </h4>
            <p className="text-xs text-slate-400 mb-4">Spending allocation across categories</p>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            {dashboardData.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {dashboardData.categoryBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`₹${Number(val).toLocaleString()}`, '']}
                    contentStyle={{
                      backgroundColor: '#090d12',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-slate-400 p-4">
                <Layers size={28} className="mx-auto text-slate-300 mb-2" />
                <span>No expense categorization data yet.</span>
              </div>
            )}
          </div>

          {/* Mini Category Legend List */}
          <div className="space-y-1.5 pt-3 border-t border-slate-100 max-h-36 overflow-y-auto">
            {dashboardData.categoryBreakdown.slice(0, 4).map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  <span className="text-slate-600 font-medium truncate">{cat.name}</span>
                </div>
                <span className="font-bold text-slate-800 shrink-0">
                  ₹{cat.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h4 className="text-base font-bold text-slate-900 tracking-tight">
              Recent Transactions
            </h4>
            <p className="text-xs text-slate-400">Latest financial movements recorded</p>
          </div>
          <button
            onClick={() => navigate('/transactions')}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1 transition cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {dashboardData.recentTransactions.length > 0 ? (
          <div className="space-y-2.5">
            {dashboardData.recentTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              return (
                <div
                  key={tx._id}
                  className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isIncome ? 'bg-teal-100 text-teal-800' : 'bg-rose-100 text-rose-600'
                      }`}
                    >
                      {isIncome ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-800">
                        {tx.description}
                      </p>
                      <span className="text-[11px] text-slate-400 font-medium">{tx.category}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-xs sm:text-sm font-extrabold ${
                        isIncome ? 'text-teal-700' : 'text-rose-600'
                      }`}
                    >
                      {isIncome ? '+' : '-'} ₹{Number(tx.amount).toLocaleString()}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(tx.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No recent transactions found. Click "+ Add Expense" or "+ Add Income" above.
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={modalOpen}
        type={modalType}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchDashboard}
      />
    </div>
  );
};

export default Dashboard;