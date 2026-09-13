import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Plus,
  FileSpreadsheet,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import TransactionModal from '../components/TransactionModal';
import Spinner from '../components/Spinner';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categories, setCategories] = useState([]);

  // Summary of filtered set
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
  });

  // Modal controls
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('expense');
  const [editingItem, setEditingItem] = useState(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data?.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch transactions with pagination & filters
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (search.trim()) params.append('search', search.trim());
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await api.get(`/transactions?${params.toString()}`);
      if (res.data?.success) {
        setTransactions(res.data.transactions);
        setTotalPages(res.data.pagination.totalPages);
        setTotalCount(res.data.pagination.totalCount);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, selectedType, selectedCategory, startDate, endDate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleDelete = async (id, type) => {
    if (!window.confirm('Are you sure you want to delete this transaction record?')) return;
    try {
      await api.delete(`/transactions/delete/${id}?type=${type}`);
      toast.success('Transaction removed successfully');
      fetchTransactions();
    } catch {
      toast.error('Failed to delete transaction');
    }
  };

  const openAddModal = (t = 'expense') => {
    setEditingItem(null);
    setModalType(t);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setModalType(item.type);
    setModalOpen(true);
  };

  // Export to Excel handler
  const handleExportExcel = async () => {
    try {
      toast.loading('Preparing Excel download...', { id: 'export-toast' });
      // Fetch either expense or income excel from existing backend routes
      const endpoint = selectedType === 'income' ? '/income/downloadexcel' : '/expense/downloadexcel';
      const response = await api.get(endpoint, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedType}_records.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Excel downloaded successfully!', { id: 'export-toast' });
    } catch {
      toast.error('Failed to download Excel sheet', { id: 'export-toast' });
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedType('all');
    setSelectedCategory('All');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Transaction Hub
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Manage, filter, search, and paginate through your cashflow history.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold border border-slate-200/70 transition shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet size={15} className="text-emerald-600" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={() => openAddModal('expense')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-xs font-bold shadow-md shadow-teal-700/20 transition cursor-pointer"
          >
            <Plus size={15} />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        {/* Row 1: Search & Type Tabs */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by description or category..."
              className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white border-2 border-transparent focus:border-teal-600 rounded-2xl pl-11 pr-4 py-2.5 text-slate-900 text-sm focus:outline-none transition shadow-2xs"
            />
          </div>

          {/* Type Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-2xl w-full md:w-auto shrink-0 border border-slate-200/60">
            {['all', 'income', 'expense'].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setSelectedType(t);
                  setPage(1);
                }}
                className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold uppercase transition cursor-pointer ${
                  selectedType === t
                    ? 'bg-white text-teal-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Category & Date Range */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-teal-600 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none transition cursor-pointer"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c._id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 shrink-0">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-teal-600 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none transition cursor-pointer"
            />
          </div>

          {/* End Date & Reset */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 shrink-0">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-teal-600 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none transition cursor-pointer"
            />
            <button
              onClick={resetFilters}
              className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Filtered Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <span className="text-slate-500 font-medium">Filtered Income</span>
          <span className="font-extrabold text-emerald-600">
            + ₹{summary.totalIncome.toLocaleString()}
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <span className="text-slate-500 font-medium">Filtered Expenses</span>
          <span className="font-extrabold text-rose-600">
            - ₹{summary.totalExpense.toLocaleString()}
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <span className="text-slate-500 font-medium">Filtered Net Balance</span>
          <span
            className={`font-extrabold ${
              summary.netBalance >= 0 ? 'text-teal-700' : 'text-rose-600'
            }`}
          >
            ₹{summary.netBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Table / List View */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Spinner size="md" className="text-teal-600" />
            <span className="text-xs font-semibold text-slate-400">Loading transactions...</span>
          </div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-right">Amount</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {transactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  return (
                    <tr key={tx._id} className="hover:bg-slate-50/70 transition">
                      {/* Description */}
                      <td className="py-4 px-6 font-bold text-slate-800">
                        {tx.description}
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                          {tx.category}
                        </span>
                      </td>

                      {/* Type Badge */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {isIncome ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
                          <span className="capitalize">{tx.type}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-slate-500 font-medium">
                        {new Date(tx.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Amount */}
                      <td
                        className={`py-4 px-6 text-right font-extrabold text-sm ${
                          isIncome ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isIncome ? '+' : '-'} ₹{Number(tx.amount).toLocaleString()}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(tx)}
                            className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(tx._id, tx.type)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Layers size={36} className="mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No transactions match your query.</p>
            <p className="text-xs text-slate-400">Try changing your filters or add a new record.</p>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 text-xs">
          <p className="text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{transactions.length}</span> of{' '}
            <span className="font-bold text-slate-800">{totalCount}</span> records
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 text-slate-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronLeft size={14} />
              <span>Prev</span>
            </button>
            <span className="font-bold text-slate-700 px-2">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 text-slate-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={modalOpen}
        type={modalType}
        initialData={editingItem}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchTransactions}
      />
    </div>
  );
};

export default Transactions;
