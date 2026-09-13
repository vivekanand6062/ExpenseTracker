import { useEffect, useState } from 'react';
import { X, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Spinner from './Spinner';

const DEFAULT_INCOME_CATS = ['Salary', 'Freelance', 'Investment', 'Business / Other'];
const DEFAULT_EXPENSE_CATS = [
  'Housing & Rent',
  'Food & Dining',
  'Groceries',
  'Utilities',
  'Transportation',
  'Healthcare & Medical',
  'Entertainment',
  'Shopping & Apparel',
  'Education',
  'Personal Care',
  'Travel',
  'Subscriptions',
  'Miscellaneous',
];

const TransactionModal = ({
  isOpen = true,
  type = 'expense',
  initialData = null,
  onClose,
  onSuccess,
}) => {
  const isEditing = Boolean(initialData?._id);
  const [selectedType, setSelectedType] = useState(initialData?.type || type || 'expense');
  const [description, setDescription] = useState(initialData?.description || '');
  const [amount, setAmount] = useState(initialData?.amount || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [date, setDate] = useState(
    initialData?.date
      ? new Date(initialData.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch dynamic categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data?.success) {
          setCategoriesList(res.data.categories);
        }
      } catch {
        // Fallback to defaults
        setCategoriesList([]);
      }
    };
    fetchCategories();
  }, []);

  const activeCategories = categoriesList
    .filter((c) => c.type === selectedType)
    .map((c) => c.name);

  const finalCategories =
    activeCategories.length > 0
      ? activeCategories
      : selectedType === 'income'
      ? DEFAULT_INCOME_CATS
      : DEFAULT_EXPENSE_CATS;

  useEffect(() => {
    if (!category || !finalCategories.includes(category)) {
      setCategory(finalCategories[0] || '');
    }
  }, [selectedType, finalCategories, category]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const numAmount = Number(amount);
    if (!description.trim() || !amount || numAmount <= 0) {
      toast.error('Please provide a valid description and a positive amount.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        description: description.trim(),
        amount: numAmount,
        category: category || finalCategories[0],
        date: date || new Date().toISOString(),
        type: selectedType,
      };

      if (isEditing) {
        // Update
        await api.put(`/transactions/update/${initialData._id}`, payload);
        toast.success('Transaction updated successfully!');
      } else {
        // Add
        await api.post('/transactions/add', payload);
        toast.success(
          `${selectedType === 'income' ? 'Income' : 'Expense'} added successfully!`
        );
      }

      onSuccess?.();
      onClose?.();
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to save transaction. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {isEditing
                ? 'Edit Transaction'
                : `Add New ${selectedType === 'income' ? 'Income' : 'Expense'}`}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing
                ? 'Update the transaction details below'
                : 'Enter the record details to track in your finances'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Toggle if not editing */}
          {!isEditing && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => setSelectedType('expense')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedType === 'expense'
                    ? 'bg-white text-rose-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <ArrowUpRight size={15} />
                <span>Expense</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('income')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedType === 'income'
                    ? 'bg-white text-emerald-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <ArrowDownLeft size={15} />
                <span>Income</span>
              </button>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Description / Title</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Client Payment, Grocery shopping"
              className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white border-2 border-transparent focus:border-teal-600 rounded-2xl px-4 py-3 text-slate-900 text-sm focus:outline-none transition shadow-2xs"
            />
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Amount (₹)</label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white border-2 border-transparent focus:border-teal-600 rounded-2xl px-4 py-3 text-slate-900 text-sm focus:outline-none transition shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Transaction Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white border-2 border-transparent focus:border-teal-600 rounded-2xl px-4 py-3 text-slate-900 text-sm focus:outline-none transition shadow-2xs"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white border-2 border-transparent focus:border-teal-600 rounded-2xl px-4 py-3 text-slate-900 text-sm focus:outline-none transition shadow-2xs cursor-pointer"
            >
              {finalCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl text-slate-600 hover:bg-slate-100 text-sm font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-sm font-semibold shadow-md shadow-teal-700/20 disabled:opacity-60 transition cursor-pointer"
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span>Saving...</span>
                </>
              ) : isEditing ? (
                'Update Record'
              ) : (
                'Save Transaction'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default TransactionModal;
