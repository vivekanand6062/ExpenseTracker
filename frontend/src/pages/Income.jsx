import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDownLeft,
  Plus,
  Download,
  Search,
  Filter,
  Trash2,
  Edit2,
  TrendingUp,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  X,
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

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [overview, setOverview] = useState({
    totalIncome: 0,
    averageIncome: 0,
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

  const fetchIncomeData = useCallback(async () => {
    try {
      setLoading(true);
      const [listRes, overviewRes] = await Promise.all([
        api.get('/income/get'),
        api.get(`/income/overview?range=${selectedRange}`),
      ]);

      const items = Array.isArray(listRes.data)
        ? listRes.data
        : listRes.data?.data || [];
      setIncomes(items);

      if (overviewRes.data?.success && overviewRes.data?.data) {
        setOverview(overviewRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching income data:', err);
      toast.error('Failed to load income details.');
    } finally {
      setLoading(false);
    }
  }, [selectedRange]);

  useEffect(() => {
    fetchIncomeData();
  }, [fetchIncomeData]);

  const handleDownloadExcel = async () => {
    if (incomes.length === 0) {
      toast.error('No income records available to export.');
      return;
    }
    setExporting(true);
    try {
      toast.loading('Preparing formatted Excel sheet...', { id: 'income-dl' });
      const res = await api.get('/income/downloadexcel', {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ArthSetu_Income_${selectedRange}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Income spreadsheet downloaded!', { id: 'income-dl' });
    } catch (err) {
      console.error('Failed to download Excel:', err);
      toast.error('Failed to export Excel spreadsheet.', { id: 'income-dl' });
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/income/delete/${id}`);
      toast.success('Income record deleted successfully.');
      setDeleteId(null);
      fetchIncomeData();
    } catch (err) {
      console.error('Failed to delete income:', err);
      toast.error('Failed to delete income record.');
    }
  };

  // Derive dynamic category list
  const categories = ['All', ...new Set(incomes.map((i) => i.category).filter(Boolean))];

  // Filtered income list
  const filteredIncomes = incomes.filter((item) => {
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
            <div className="h-6 w-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <ArrowDownLeft size={14} />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
              Cash Inflow Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Income Streams
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Monitor earnings, salary inflows, consulting fees, and investment dividends.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadExcel}
            disabled={exporting || incomes.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold border border-slate-200/70 transition shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={15} className="text-emerald-600" />
            <span>{exporting ? 'Exporting...' : 'Export Excel'}</span>
          </button>

          <button
            onClick={() => {
              setEditingItem(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold shadow-md shadow-teal-700/20 transition cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Income</span>
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
              Total Inflow ({selectedRange})
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {formatCurrency(overview.totalIncome)}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
              <CheckCircle2 size={12} />
              <span>Accumulated across all streams</span>
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs shrink-0">
            <ArrowDownLeft size={22} />
          </div>
        </motion.div>

        {/* Card 2: Average Ticket */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between"
        >
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Average Transaction Ticket
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {formatCurrency(overview.averageIncome)}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Mean inflow per transaction
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100 shadow-2xs shrink-0">
            <TrendingUp size={22} />
          </div>
        </motion.div>

        {/* Card 3: Count & Timeframe Selector */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between gap-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Recorded Inflows
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
                      ? 'bg-white text-teal-800 shadow-xs'
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

      {/* Structured List & Filter Container */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Income Records
            </h2>
            <span className="text-xs px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold rounded-full">
              {filteredIncomes.length} records found
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
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-teal-600 rounded-2xl focus:outline-none transition shadow-2xs text-slate-800"
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
            <Spinner size="md" className="text-teal-600" />
            <span className="text-xs font-semibold text-slate-400">Loading income records...</span>
          </div>
        ) : filteredIncomes.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-8">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Layers size={22} />
            </div>
            <p className="text-sm font-bold text-slate-700">No income records found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== 'All'
                ? 'Try adjusting your search query or reset the category filter.'
                : 'Click "Add Income" above to log your first earnings stream.'}
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
                {filteredIncomes.map((item) => (
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
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
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
                    <td className="py-4 px-5 text-right font-black text-sm text-emerald-600">
                      +{formatCurrency(item.amount)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingItem({ ...item, type: 'income' });
                            setModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                          title="Edit Income"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(item._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Delete Income"
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
                  <h3 className="text-base font-bold text-slate-900">Delete Income Entry?</h3>
                </div>
                <button
                  onClick={() => setDeleteId(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete this income entry from ArthSetu AI? This action cannot be undone and will update your aggregate financial calculations.
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
        type="income"
        initialData={editingItem}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSuccess={fetchIncomeData}
      />
    </motion.div>
  );
};

export default Income;
