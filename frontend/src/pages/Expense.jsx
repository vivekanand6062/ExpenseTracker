import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  Plus,
  Download,
  Search,
  Filter,
  Trash2,
  Edit2,
  TrendingDown,
  Calendar,
  Layers,
  PieChart,
  AlertTriangle,
  X,
  CreditCard,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import TransactionModal from '../components/TransactionModal';
import Spinner from '../components/Spinner';

const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const RANGES = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'yearly', label: 'Yearly' },
];

const CATEGORY_COLORS = [
  'bg-teal-500',
  'bg-sky-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-indigo-500',
  'bg-pink-500',
  'bg-purple-500',
];

const Expense = () => {
  const [expenses, setExpenses] = useState([]);
  const [overview, setOverview] = useState({
    totalExpense: 0,
    averageExpense: 0,
    numberOfTransactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState('monthly');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [exporting, setExporting] = useState(false);

  // Modal controls
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Custom Delete confirmation dialog
  const [deleteId, setDeleteId] = useState(null);

  const fetchExpenseData = useCallback(async () => {
    try {
      setLoading(true);
      const [listRes, overviewRes] = await Promise.all([
        api.get('/expense/get'),
        api.get(`/expense/overview?range=${selectedRange}`),
      ]);

      const items = Array.isArray(listRes.data)
        ? listRes.data
        : listRes.data?.data || [];
      setExpenses(items);

      if (overviewRes.data?.success && overviewRes.data?.data) {
        setOverview(overviewRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching expense data:', err);
      toast.error('Failed to load expense details.');
    } finally {
      setLoading(false);
    }
  }, [selectedRange]);

  useEffect(() => {
    fetchExpenseData();
  }, [fetchExpenseData]);

  const handleDownloadExcel = async () => {
    if (expenses.length === 0) {
      toast.error('No expense records available to export.');
      return;
    }
    setExporting(true);
    try {
      toast.loading('Preparing formatted Excel sheet...', { id: 'expense-dl' });
      const res = await api.get('/expense/downloadexcel', {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ArthSetu_Expenses_${selectedRange}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Expense spreadsheet downloaded!', { id: 'expense-dl' });
    } catch (err) {
      console.error('Failed to download Excel:', err);
      toast.error('Failed to export Excel spreadsheet.', { id: 'expense-dl' });
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/expense/delete/${id}`);
      toast.success('Expense record deleted successfully.');
      setDeleteId(null);
      fetchExpenseData();
    } catch (err) {
      console.error('Failed to delete expense:', err);
      toast.error('Failed to delete expense record.');
    }
  };

  // Derive dynamic category list
  const categories = ['All', ...new Set(expenses.map((i) => i.category).filter(Boolean))];

  // Category breakdown calculation
  const categoryTotals = expenses.reduce((acc, curr) => {
    const cat = curr.category || 'Other';
    acc[cat] = (acc[cat] || 0) + Number(curr.amount || 0);
    return acc;
  }, {});

  const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  const categoryBreakdown = Object.entries(categoryTotals)
    .map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      percent: totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Filtered expense list
  const filteredExpenses = expenses.filter((item) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      item.description?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query);
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Header Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-6 w-6 rounded-lg bg-rose-600 text-white flex items-center justify-center">
              <ArrowUpRight size={14} />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-rose-700">
              Cash Outflow Tracking
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Expense Outflows
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Audit recurring bills, discretionary purchases, household supplies, and utility costs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadExcel}
            disabled={exporting || expenses.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold border border-slate-200/70 transition shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={15} className="text-rose-600" />
            <span>{exporting ? 'Exporting...' : 'Export Excel'}</span>
          </button>

          <button
            onClick={() => {
              setEditingItem(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards with Live Range Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total Volume */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between"
        >
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Total Outflow ({selectedRange})
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {formatCurrency(overview.totalExpense)}
            </h3>
            <p className="text-[11px] text-rose-600 font-medium mt-0.5 flex items-center gap-1">
              <CreditCard size={12} />
              <span>Cumulative expenditures</span>
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-2xs shrink-0">
            <ArrowUpRight size={22} />
          </div>
        </motion.div>

        {/* Card 2: Average Ticket */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between"
        >
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Average Outflow Ticket
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {formatCurrency(overview.averageExpense)}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Mean spending per transaction
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-2xs shrink-0">
            <TrendingDown size={22} />
          </div>
        </motion.div>

        {/* Card 3: Count & Timeframe Selector */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between gap-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Recorded Expenses
            </span>
            <span className="h-7 px-2.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
              {overview.numberOfTransactions} entries
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Time Horizon:</span>
            <div className="flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60">
              {RANGES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRange(r.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedRange === r.id
                      ? 'bg-white text-rose-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Category Breakdown Progress Bars Section */}
      {categoryBreakdown.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                <PieChart size={14} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Top Spending Concentrations
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {categoryBreakdown.length} active categories
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {categoryBreakdown.slice(0, 4).map((item, index) => {
              const colorClass = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
              return (
                <div
                  key={item.category}
                  className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[130px]">
                      {item.category}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900">
                      {item.percent}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percent}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={`h-full rounded-full ${colorClass}`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Allocated Volume</span>
                    <span className="font-semibold text-slate-700">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Structured List & Filter Container */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Expense Records
            </h2>
            <span className="text-xs px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200/60 font-semibold rounded-full">
              {filteredExpenses.length} records found
            </span>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search description or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-rose-600 rounded-2xl focus:outline-none transition shadow-2xs text-slate-800"
              />
            </div>

            {/* Category Select */}
            <div className="flex items-center gap-1.5 bg-slate-100/80 hover:bg-slate-100 border border-slate-200/60 rounded-2xl px-3.5 py-2">
              <Filter size={14} className="text-slate-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Structured Table */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Spinner size="md" className="text-rose-600" />
            <span className="text-xs font-semibold text-slate-400">Loading expense records...</span>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-8">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Layers size={22} />
            </div>
            <p className="text-sm font-bold text-slate-700">No expense records found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== 'All'
                ? 'Try adjusting your search query or reset the category filter.'
                : 'Click "Add Expense" above to log your first outflow.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-5">Description</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5 text-right">Amount</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredExpenses.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Description */}
                    <td className="py-4 px-5 font-bold text-slate-800">
                      {item.description}
                    </td>

                    {/* Category */}
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/50">
                        {item.category}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-5 text-slate-500 font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        <span>{formatDate(item.date)}</span>
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-5 text-right font-black text-sm text-rose-600">
                      -{formatCurrency(item.amount)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingItem({ ...item, type: 'expense' });
                            setModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                          title="Edit Expense"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(item._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Delete Expense"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-rose-600">
                  <div className="p-2 rounded-xl bg-rose-50">
                    <AlertTriangle size={20} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Delete Expense Entry?</h3>
                </div>
                <button
                  onClick={() => setDeleteId(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete this expense entry from ArthSetu AI? This action cannot be undone and will update your aggregate financial calculations.
              </p>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/25 transition cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={modalOpen}
        type="expense"
        initialData={editingItem}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSuccess={fetchExpenseData}
      />
    </motion.div>
  );
};

export default Expense;
