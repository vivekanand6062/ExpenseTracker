import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Spinner from '../components/Spinner';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState({
    totalBudgeted: 0,
    totalSpent: 0,
    remaining: 0,
    overallPercentage: 0,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly',
    alertThreshold: 80,
  });
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch categories & budgets
  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data?.success) {
        // Only expense categories can have budgets
        const expenseCats = res.data.categories.filter((c) => c.type === 'expense');
        setCategories(expenseCats);
        if (expenseCats.length > 0 && !formData.category) {
          setFormData((prev) => ({ ...prev, category: expenseCats[0].name }));
        }
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/budgets?period=${period}`);
      if (res.data?.success) {
        setBudgets(res.data.budgets || []);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      }
    } catch (err) {
      console.error('Error fetching budgets:', err);
      toast.error('Failed to load budget tracking data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [period]);

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.amount || Number(formData.amount) <= 0) {
      toast.error('Please enter a positive budget amount');
      return;
    }

    setModalLoading(true);
    try {
      await api.post('/budgets/set', {
        category: formData.category,
        amount: Number(formData.amount),
        period: formData.period,
        alertThreshold: Number(formData.alertThreshold) || 80,
      });
      toast.success('Budget saved successfully!');
      setModalOpen(false);
      setFormData({
        category: categories[0]?.name || '',
        amount: '',
        period: 'monthly',
        alertThreshold: 80,
      });
      fetchBudgets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save budget');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget limit?')) return;
    try {
      await api.delete(`/budgets/delete/${id}`);
      toast.success('Budget removed');
      fetchBudgets();
    } catch {
      toast.error('Failed to remove budget');
    }
  };

  const openEditModal = (b) => {
    setFormData({
      category: b.category,
      amount: String(b.budgetAmount),
      period: b.period,
      alertThreshold: b.alertThreshold || 80,
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Budget Tracking
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Set category limits and monitor live real-time spending progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Toggle */}
          <div className="flex items-center p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                period === 'monthly'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                period === 'weekly'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Weekly
            </button>
          </div>

          <button
            onClick={() => {
              setFormData({
                category: categories[0]?.name || '',
                amount: '',
                period,
                alertThreshold: 80,
              });
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-xs font-bold shadow-md shadow-teal-700/20 transition cursor-pointer shrink-0"
          >
            <Plus size={15} />
            <span>Set New Budget</span>
          </button>
        </div>
      </div>

      {/* Overview Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {period === 'monthly' ? 'Monthly' : 'Weekly'} Budget Utilization
            </span>
            <div className="flex items-baseline gap-3">
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                ₹ {summary.totalSpent.toLocaleString()}
              </h3>
              <span className="text-sm font-semibold text-slate-400">
                / ₹ {summary.totalBudgeted.toLocaleString()} budgeted
              </span>
            </div>
          </div>

          {/* Status Metric Pill */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-500">Remaining Cushion</p>
              <p
                className={`text-lg font-black ${
                  summary.remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {summary.remaining >= 0 ? '₹ ' : '- ₹ '}
                {Math.abs(summary.remaining).toLocaleString()}
              </p>
            </div>
            <div
              className={`h-12 w-12 rounded-2xl flex items-center justify-center font-extrabold text-sm ${
                summary.overallPercentage > 100
                  ? 'bg-rose-100 text-rose-700'
                  : summary.overallPercentage > 80
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {summary.overallPercentage}%
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-5 w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, summary.overallPercentage)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full transition-all ${
              summary.overallPercentage > 100
                ? 'bg-rose-500'
                : summary.overallPercentage > 80
                ? 'bg-amber-500'
                : 'bg-gradient-to-r from-teal-500 to-teal-700'
            }`}
          />
        </div>
      </div>

      {/* Category Budgets Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Spinner size="md" className="text-teal-600" />
          <span className="text-xs font-semibold text-slate-400">Loading budget cards...</span>
        </div>
      ) : budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => {
            const isOver = b.status === 'over_budget';
            const isWarning = b.status === 'warning';

            return (
              <motion.div
                key={b._id}
                whileHover={{ y: -2 }}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold border border-teal-100">
                        <Target size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 tracking-tight">
                          {b.category}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {b.transactionCount} transactions recorded
                        </span>
                      </div>
                    </div>

                    {/* Status badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isOver
                          ? 'bg-rose-50 text-rose-700'
                          : isWarning
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {isOver ? (
                        <XCircle size={12} />
                      ) : isWarning ? (
                        <AlertTriangle size={12} />
                      ) : (
                        <CheckCircle2 size={12} />
                      )}
                      <span>{isOver ? 'Over Budget' : isWarning ? 'Warning' : 'On Track'}</span>
                    </span>
                  </div>

                  {/* Spending Numbers */}
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">Spent / Limit</span>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-slate-900">
                        ₹ {b.spent.toLocaleString()}
                      </span>{' '}
                      <span className="text-xs text-slate-400">
                        / ₹ {b.budgetAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, b.percentage)}%` }}
                    />
                  </div>

                  {/* Remaining / Over text */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">{b.percentage}% spent</span>
                    <span
                      className={`font-semibold ${
                        b.remaining >= 0 ? 'text-slate-700' : 'text-rose-600'
                      }`}
                    >
                      {b.remaining >= 0
                        ? `₹ ${b.remaining.toLocaleString()} left`
                        : `Over by ₹ ${Math.abs(b.remaining).toLocaleString()}`}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-end gap-1 pt-4 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => openEditModal(b)}
                    className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                    title="Edit Limit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(b._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Delete Budget"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
          <Target size={40} className="mx-auto text-slate-300" />
          <h4 className="text-base font-bold text-slate-800">No Budgets Defined Yet</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Setting category budgets helps keep spending under control with automatic progress
            tracking and alert thresholds.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-xs font-bold shadow-md shadow-teal-700/20 transition cursor-pointer"
          >
            <Plus size={15} />
            <span>Create First Budget</span>
          </button>
        </div>
      )}

      {/* Add / Edit Budget Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Set Category Budget
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveBudget} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white border-2 border-transparent focus:border-teal-600 rounded-2xl px-4 py-3 text-slate-900 text-sm focus:outline-none transition shadow-2xs"
                  >
                    {categories.map((c) => (
                      <option key={c._id || c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Budget Target Limit (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="e.g. 10000"
                    className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white border-2 border-transparent focus:border-teal-600 rounded-2xl px-4 py-3 text-slate-900 text-sm focus:outline-none transition shadow-2xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Period</label>
                    <select
                      value={formData.period}
                      onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                      className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white border-2 border-transparent focus:border-teal-600 rounded-2xl px-4 py-3 text-slate-900 text-sm focus:outline-none transition shadow-2xs"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Alert Warning (%)
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="100"
                      value={formData.alertThreshold}
                      onChange={(e) =>
                        setFormData({ ...formData, alertThreshold: e.target.value })
                      }
                      className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white border-2 border-transparent focus:border-teal-600 rounded-2xl px-4 py-3 text-slate-900 text-sm focus:outline-none transition shadow-2xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-3 rounded-2xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-xs font-bold shadow-md shadow-teal-700/20 transition cursor-pointer disabled:opacity-60"
                  >
                    {modalLoading ? 'Saving...' : 'Save Budget'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Budgets;
