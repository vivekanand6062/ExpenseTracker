import { useState } from 'react';
import { X } from 'lucide-react';
import api from '../api/axios';
import { modalStyles } from '../assets/dummyStyles';

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment',
  'Business',
  'Gift',
  'Other',
];

const EXPENSE_CATEGORIES = [
  'Food',
  'Rent',
  'Transportation',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Travel',
  'Other',
];

const TransactionForm = ({ type, initialData, onClose, onSuccess }) => {
  const isIncome = type === 'income';
  const categories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const isEditing = Boolean(initialData?._id);
  const colorTheme = isIncome ? modalStyles.colorClasses.teal : modalStyles.colorClasses.orange;

  const [description, setDescription] = useState(initialData?.description || '');
  const [amount, setAmount] = useState(initialData?.amount || '');
  const [category, setCategory] = useState(initialData?.category || categories[0]);
  const [date, setDate] = useState(
    initialData?.date
      ? new Date(initialData.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = Number(amount);
    if (!description.trim() || !amount || numAmount <= 0) {
      setError('Please provide a valid description and a positive amount.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        description: description.trim(),
        amount: numAmount,
        category: category || categories[0],
        date: date || new Date().toISOString(),
      };

      if (isEditing) {
        payload.id = initialData._id;
        const endpoint = isIncome ? `/income/update/${initialData._id}` : `/expense/update/${initialData._id}`;
        await api.put(endpoint, payload);
      } else {
        const endpoint = isIncome ? '/income/add' : '/expense/add';
        await api.post(endpoint, payload);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save transaction.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={modalStyles.overlay}>
      <div className={modalStyles.modalContainer}>
        {/* Header */}
        <div className={modalStyles.modalHeader}>
          <h2 className={modalStyles.modalTitle}>
            {isEditing ? `Edit ${isIncome ? 'Income' : 'Expense'}` : `Add New ${isIncome ? 'Income' : 'Expense'}`}
          </h2>
          <button
            onClick={onClose}
            className={modalStyles.closeButton}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className={modalStyles.form}>
          {/* Description */}
          <div>
            <label className={modalStyles.label}>Description</label>
            <input
              type="text"
              required
              placeholder="e.g. Monthly Salary, Grocery run"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={modalStyles.input(colorTheme.ring)}
            />
          </div>

          {/* Amount */}
          <div>
            <label className={modalStyles.label}>Amount ($)</label>
            <input
              type="number"
              required
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={modalStyles.input(colorTheme.ring)}
            />
          </div>

          {/* Category */}
          <div>
            <label className={modalStyles.label}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={modalStyles.input(colorTheme.ring)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className={modalStyles.label}>Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={modalStyles.input(colorTheme.ring)}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={modalStyles.submitButton(colorTheme.button)}
          >
            {loading ? 'Saving...' : isEditing ? 'Update Transaction' : `Add ${isIncome ? 'Income' : 'Expense'}`}
          </button>
        </form>
      </div>
    </div>
  );
};

const TransactionModal = ({
  isOpen,
  onClose,
  type = 'income',
  initialData = null,
  onSuccess,
}) => {
  if (!isOpen) return null;

  return (
    <TransactionForm
      key={`${type}-${initialData?._id || 'new'}`}
      type={type}
      initialData={initialData}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
};

export default TransactionModal;
