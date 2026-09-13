import mongoose from 'mongoose';

export const DEFAULT_CATEGORIES = [
  // Income categories (4)
  { name: 'Salary', type: 'income', icon: 'Briefcase', color: '#10b981', isDefault: true },
  { name: 'Freelance', type: 'income', icon: 'Laptop', color: '#06b6d4', isDefault: true },
  { name: 'Investment', type: 'income', icon: 'TrendingUp', color: '#8b5cf6', isDefault: true },
  { name: 'Business / Other', type: 'income', icon: 'Building', color: '#3b82f6', isDefault: true },

  // Expense categories (13)
  { name: 'Housing & Rent', type: 'expense', icon: 'Home', color: '#6366f1', isDefault: true },
  { name: 'Food & Dining', type: 'expense', icon: 'Utensils', color: '#f59e0b', isDefault: true },
  { name: 'Groceries', type: 'expense', icon: 'ShoppingCart', color: '#10b981', isDefault: true },
  { name: 'Utilities', type: 'expense', icon: 'Zap', color: '#eab308', isDefault: true },
  { name: 'Transportation', type: 'expense', icon: 'Car', color: '#3b82f6', isDefault: true },
  { name: 'Healthcare & Medical', type: 'expense', icon: 'HeartPulse', color: '#ef4444', isDefault: true },
  { name: 'Entertainment', type: 'expense', icon: 'Film', color: '#ec4899', isDefault: true },
  { name: 'Shopping & Apparel', type: 'expense', icon: 'ShoppingBag', color: '#a855f7', isDefault: true },
  { name: 'Education', type: 'expense', icon: 'GraduationCap', color: '#14b8a6', isDefault: true },
  { name: 'Personal Care', type: 'expense', icon: 'Smile', color: '#f97316', isDefault: true },
  { name: 'Travel', type: 'expense', icon: 'Plane', color: '#06b6d4', isDefault: true },
  { name: 'Subscriptions', type: 'expense', icon: 'CreditCard', color: '#8b5cf6', isDefault: true },
  { name: 'Miscellaneous', type: 'expense', icon: 'HelpCircle', color: '#64748b', isDefault: true },
];

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    icon: {
      type: String,
      default: 'Tag',
    },
    color: {
      type: String,
      default: '#8b5cf6',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      default: null, // null for system defaults
    },
  },
  { timestamps: true }
);

// Compound index to ensure uniqueness per user
categorySchema.index({ userId: 1, name: 1, type: 1 });

const categoryModel = mongoose.models.category || mongoose.model('category', categorySchema);
export default categoryModel;
