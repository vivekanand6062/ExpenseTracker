import mongoose from 'mongoose';

const aiInsightSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    reportType: {
      type: String,
      enum: ['monthly_summary', 'savings_tips', 'budget_verdict', 'spending_analyzer'],
      required: true,
    },
    period: {
      type: String,
      default: () => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}`;
      },
    },
    healthScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 75,
    },
    title: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
    },
    // Persistent JSONB equivalent in MongoDB
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

aiInsightSchema.index({ userId: 1, reportType: 1, createdAt: -1 });

const aiInsightModel = mongoose.models.aiInsight || mongoose.model('aiInsight', aiInsightSchema);
export default aiInsightModel;
