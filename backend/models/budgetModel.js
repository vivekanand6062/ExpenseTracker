import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Budget amount must be positive'],
    },
    period: {
      type: String,
      enum: ['monthly', 'weekly'],
      default: 'monthly',
    },
    monthYear: {
      type: String, // 'YYYY-MM'
      default: () => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}`;
      },
    },
    alertThreshold: {
      type: Number,
      default: 80, // % trigger
    },
  },
  { timestamps: true }
);

budgetSchema.index({ userId: 1, category: 1, monthYear: 1, period: 1 }, { unique: true });

const budgetModel = mongoose.models.budget || mongoose.model('budget', budgetSchema);
export default budgetModel;
