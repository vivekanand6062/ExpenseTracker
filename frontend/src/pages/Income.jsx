import { useState, useEffect } from 'react';
import {
  ArrowUp,
  PlusCircle,
  Download,
  Search,
  Filter,
  Trash2,
  Edit2,
  TrendingUp,
  CreditCard,
  Layers,
  Calendar,
} from 'lucide-react';
import api from '../api/axios';
import { incomeStyles } from '../assets/dummyStyles';
import TransactionModal from '../components/TransactionModal';
import Toast from '../components/Toast';

const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
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

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const refetchData = async () => {
    try {
      const [listRes, overviewRes] = await Promise.all([
        api.get('/income/get'),
        api.get(`/income/overview?range=${selectedRange}`),
      ]);

      if (Array.isArray(listRes.data)) {
        setIncomes(listRes.data);
      }
      if (overviewRes.data?.success && overviewRes.data?.data) {
        setOverview(overviewRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching income data:', err);
      setToastType('error');
      setToastMessage('Failed to fetch income details.');
    }
  };

  useEffect(() => {
    let active = true;

    Promise.all([
      api.get('/income/get'),
      api.get(`/income/overview?range=${selectedRange}`),
    ])
      .then(([listRes, overviewRes]) => {
        if (!active) return;
        if (Array.isArray(listRes.data)) {
          setIncomes(listRes.data);
        }
        if (overviewRes.data?.success && overviewRes.data?.data) {
          setOverview(overviewRes.data.data);
        }
      })
      .catch((err) => {
        if (!active) return;
        console.error('Error fetching income data:', err);
        setToastType('error');
        setToastMessage('Failed to fetch income details.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedRange]);

  const handleDownloadExcel = async () => {
    setExporting(true);
    try {
      const res = await api.get('/income/downloadexcel', {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `income_details_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setToastType('success');
      setToastMessage('Excel sheet downloaded successfully.');
    } catch (err) {
      console.error('Failed to download Excel:', err);
      setToastType('error');
      setToastMessage('Failed to export Excel.');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/income/delete/${id}`);
      setToastType('success');
      setToastMessage('Income deleted successfully.');
      setDeleteId(null);
      refetchData();
    } catch (err) {
      console.error('Failed to delete income:', err);
      setToastType('error');
      setToastMessage('Failed to delete income.');
    }
  };

  // Filtered income list
  const filteredIncomes = incomes.filter((item) => {
    const matchesSearch =
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set(incomes.map((i) => i.category).filter(Boolean))];

  return (
    <div className="space-y-6">
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage('')}
      />

      {/* Header Container */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm mb-1">
            <ArrowUp size={18} />
            <span>Income Management</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Income Streams
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Track, analyze and record your revenues and earnings
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadExcel}
            disabled={exporting || incomes.length === 0}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all text-sm disabled:opacity-50"
          >
            <Download size={16} />
            <span>{exporting ? 'Exporting...' : 'Export Excel'}</span>
          </button>

          <button
            onClick={() => {
              setEditingItem(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all text-sm"
          >
            <PlusCircle size={18} />
            <span>Add Income</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Income */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Total Income</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-emerald-600">
              {loading ? '...' : formatCurrency(overview.totalIncome)}
            </h3>
            <p className="text-xs text-gray-400 mt-1">In selected timeframe ({selectedRange})</p>
          </div>
        </div>

        {/* Average Income */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-teal-500">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Average Transaction</span>
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
              <CreditCard size={22} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-teal-700">
              {loading ? '...' : formatCurrency(overview.averageIncome)}
            </h3>
            <p className="text-xs text-gray-400 mt-1">Mean income amount per entry</p>
          </div>
        </div>

        {/* Total Count */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-cyan-500">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Recorded Streams</span>
            <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl">
              <Layers size={22} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-800">
              {loading ? '...' : overview.numberOfTransactions || incomes.length}
            </h3>
            <p className="text-xs text-gray-400 mt-1">Total income events logged</p>
          </div>
        </div>
      </div>

      {/* Transaction List & Filtering Container */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">Income Records</h2>
            <span className="text-xs px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded-full">
              {filteredIncomes.length} records
            </span>
          </div>

          {/* Timeframe selector & Filter options */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search description or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Category Select */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <Filter size={15} className="text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-sm text-gray-700 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Timeframe pill selector */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
              {RANGES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRange(r.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    selectedRange === r.id
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions Table / List */}
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredIncomes.length === 0 ? (
          <div className={incomeStyles.emptyStateContainer}>
            <div className={incomeStyles.emptyStateIcon}>
              <ArrowUp size={24} className="text-emerald-500" />
            </div>
            <p className={incomeStyles.emptyStateText}>No income records found</p>
            <p className={incomeStyles.emptyStateSubtext}>
              {searchQuery || selectedCategory !== 'All'
                ? 'Try adjusting your search or category filters.'
                : 'Click "Add Income" above to log your first earnings.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredIncomes.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-semibold text-gray-800">
                      {item.description}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">
                      <span className="flex items-center gap-1.5 text-xs">
                        <Calendar size={14} className="text-gray-400" />
                        {formatDate(item.date)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                      +{formatCurrency(item.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setModalOpen(true);
                          }}
                          className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit Income"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteId(item._id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Income"
                        >
                          <Trash2 size={16} />
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

      {/* Delete Confirmation Dialog */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Income?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this income entry? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <TransactionModal
        isOpen={modalOpen}
        type="income"
        initialData={editingItem}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSuccess={() => {
          setToastType('success');
          setToastMessage(
            editingItem ? 'Income updated successfully!' : 'Income added successfully!'
          );
          refetchData();
        }}
      />
    </div>
  );
};

export default Income;
