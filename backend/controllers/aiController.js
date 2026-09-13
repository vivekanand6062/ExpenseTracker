import 'dotenv/config';
import mongoose from 'mongoose';
import { GoogleGenAI } from '@google/genai';
import AIInsight from '../models/aiInsightModel.js';
import Expense from '../models/expenseModel.js';
import Income from '../models/incomeModel.js';
import Budget from '../models/budgetModel.js';

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

const getModelName = () => process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// Helper to extract monthly data
const getMonthlyFinancials = async (userId, monthYear) => {
  const [year, month] = monthYear.split('-').map(Number);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const [incomes, expenses, budgets] = await Promise.all([
    Income.find({
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: startDate, $lte: endDate },
    }),
    Expense.find({
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: startDate, $lte: endDate },
    }),
    Budget.find({
      userId: new mongoose.Types.ObjectId(userId),
      monthYear,
    }),
  ]);

  const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  const categorySpending = {};
  expenses.forEach((e) => {
    categorySpending[e.category] = (categorySpending[e.category] || 0) + e.amount;
  });

  return {
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate,
    categorySpending,
    incomes,
    expenses,
    budgets,
    monthYear,
  };
};

/**
 * 1. Monthly Financial Summary with Health-Score Gauge (0-100)
 */
export const generateMonthlySummary = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { monthYear } = req.body;
    const currentMonthYear =
      monthYear ||
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    const fin = await getMonthlyFinancials(userId, currentMonthYear);

    // Calculate baseline health score
    let score = 70;
    if (fin.savingsRate >= 30) score += 20;
    else if (fin.savingsRate >= 15) score += 10;
    else if (fin.savingsRate < 0) score -= 30;
    else score -= 10;

    score = Math.min(100, Math.max(15, score));

    let rating = 'Good';
    if (score >= 85) rating = 'Excellent';
    else if (score >= 70) rating = 'Good';
    else if (score >= 50) rating = 'Fair';
    else rating = 'Needs Attention';

    let aiData;
    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `You are a certified financial advisor. Analyze this monthly financial data:
Month: ${currentMonthYear}
Total Income: ₹${fin.totalIncome}
Total Expense: ₹${fin.totalExpense}
Net Savings: ₹${fin.netSavings}
Savings Rate: ${fin.savingsRate}%
Category Expenses: ${JSON.stringify(fin.categorySpending)}

Respond in valid JSON only with this structure:
{
  "healthScore": ${score},
  "rating": "${rating}",
  "summary": "2-3 concise sentences summarizing financial health",
  "keyStrengths": ["Strength 1", "Strength 2"],
  "riskFactors": ["Risk 1", "Risk 2"],
  "recommendedActions": ["Action 1", "Action 2", "Action 3"]
}`;

        const response = await ai.models.generateContent({
          model: getModelName(),
          contents: prompt,
        });

        const text = response.text || '';
        const cleaned = text.replace(/```json|```/g, '').trim();
        aiData = JSON.parse(cleaned);
      } catch (err) {
        console.warn('Gemini API call failed, using intelligent fallback:', err.message);
      }
    }

    if (!aiData) {
      aiData = {
        healthScore: score,
        rating,
        summary: `During ${currentMonthYear}, you earned ₹${fin.totalIncome.toLocaleString()} and spent ₹${fin.totalExpense.toLocaleString()}, resulting in a net savings rate of ${fin.savingsRate}%.`,
        keyStrengths: [
          fin.savingsRate > 20
            ? 'Strong savings rate exceeding the 20% healthy benchmark'
            : 'Positive cashflow maintained throughout the billing cycle',
          'Consistent expense tracking across core categories',
        ],
        riskFactors: [
          fin.totalExpense > fin.totalIncome * 0.8
            ? 'Total expenditures consume over 80% of net monthly income'
            : 'Consider building a 3-month liquid emergency safety net',
          'Discretionary spending could be tightened for faster capital growth',
        ],
        recommendedActions: [
          'Cap recurring dining and entertainment expenditures by 15%',
          'Automate an investment transfer on the 1st of every month',
          'Review subscriptions and eliminate inactive recurring memberships',
        ],
      };
    }

    // Persist in DB
    const insight = await AIInsight.create({
      userId,
      reportType: 'monthly_summary',
      period: currentMonthYear,
      healthScore: aiData.healthScore || score,
      title: `Monthly Financial Report (${currentMonthYear})`,
      summary: aiData.summary,
      data: {
        ...aiData,
        financials: {
          totalIncome: fin.totalIncome,
          totalExpense: fin.totalExpense,
          netSavings: fin.netSavings,
          savingsRate: fin.savingsRate,
          categorySpending: fin.categorySpending,
        },
      },
    });

    res.status(201).json({
      success: true,
      insight,
    });
  } catch (error) {
    console.error('generateMonthlySummary error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate monthly summary' });
  }
};

/**
 * 2. AI Savings Tips: 4 Ranked Category-Specific Suggestions
 */
export const generateSavingsTips = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { monthYear } = req.body;
    const currentMonthYear =
      monthYear ||
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    const fin = await getMonthlyFinancials(userId, currentMonthYear);
    const sortedCategories = Object.entries(fin.categorySpending).sort((a, b) => b[1] - a[1]);

    let tips;
    const ai = getGeminiClient();

    if (ai && sortedCategories.length > 0) {
      try {
        const prompt = `Based on these expense categories: ${JSON.stringify(sortedCategories)}, generate exactly 4 ranked, category-specific savings suggestions.
Format as valid JSON only:
[
  {
    "rank": 1,
    "category": "category name",
    "title": "short catchy title",
    "suggestion": "specific actionable tip",
    "estimatedMonthlySavings": 1500,
    "impact": "High"
  }
]`;

        const response = await ai.models.generateContent({
          model: getModelName(),
          contents: prompt,
        });

        const text = response.text || '';
        const cleaned = text.replace(/```json|```/g, '').trim();
        tips = JSON.parse(cleaned);
      } catch (err) {
        console.warn('Gemini savings tips failed, falling back:', err.message);
      }
    }

    if (!tips || !Array.isArray(tips) || tips.length === 0) {
      const topCat1 = sortedCategories[0]?.[0] || 'Food & Dining';
      const topSpend1 = sortedCategories[0]?.[1] || 8000;
      const topCat2 = sortedCategories[1]?.[0] || 'Entertainment';
      const topSpend2 = sortedCategories[1]?.[1] || 4000;

      tips = [
        {
          rank: 1,
          category: topCat1,
          title: `Optimize ${topCat1} Outflows`,
          suggestion: `Batch cook meals and plan weekly menus to cut ${topCat1} expenses by 20%.`,
          estimatedMonthlySavings: Math.round(topSpend1 * 0.2) || 1600,
          impact: 'High',
        },
        {
          rank: 2,
          category: topCat2,
          title: `Smart Subscription & Activity Auditing`,
          suggestion: `Audit digital subscriptions and shift towards community and outdoors entertainment.`,
          estimatedMonthlySavings: Math.round(topSpend2 * 0.25) || 1000,
          impact: 'High',
        },
        {
          rank: 3,
          category: 'Utilities & Household',
          title: 'Energy Efficiency & Utility Audits',
          suggestion: 'Switch to programmable plugs and compare broadband/cellular tariff plans.',
          estimatedMonthlySavings: 650,
          impact: 'Medium',
        },
        {
          rank: 4,
          category: 'Shopping & Apparel',
          title: 'Enforce the 48-Hour Purchase Rule',
          suggestion: 'Delay non-essential online impulse cart purchases by 48 hours to curb buyer remorse.',
          estimatedMonthlySavings: 1800,
          impact: 'Medium',
        },
      ];
    }

    const totalPotentialSavings = tips.reduce(
      (sum, t) => sum + (Number(t.estimatedMonthlySavings) || 0),
      0
    );

    const insight = await AIInsight.create({
      userId,
      reportType: 'savings_tips',
      period: currentMonthYear,
      title: `4 Ranked Savings Tips (${currentMonthYear})`,
      summary: `Identified potential monthly savings of ₹${totalPotentialSavings.toLocaleString()} across your top expense categories.`,
      data: {
        tips,
        totalPotentialSavings,
      },
    });

    res.status(201).json({
      success: true,
      insight,
    });
  } catch (error) {
    console.error('generateSavingsTips error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate savings tips' });
  }
};

/**
 * 3. Budget Verdicts: Automated Analysis & Commentary
 */
export const generateBudgetVerdicts = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { monthYear } = req.body;
    const currentMonthYear =
      monthYear ||
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    const [year, month] = currentMonthYear.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const budgets = await Budget.find({ userId, monthYear: currentMonthYear });
    const expenses = await Expense.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });

    const spendingMap = {};
    expenses.forEach((e) => {
      spendingMap[e.category] = (spendingMap[e.category] || 0) + e.amount;
    });

    const categoryVerdicts = budgets.map((b) => {
      const spent = spendingMap[b.category] || 0;
      const pct = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
      let status = 'On Track';
      let commentary = `Healthy spending at ${pct}% of allocated ₹${b.amount.toLocaleString()} limit.`;

      if (pct > 100) {
        status = 'Over Budget';
        commentary = `Exceeded budget limit by ₹${(spent - b.amount).toLocaleString()} (${pct}% spent). Freeze further non-critical spend.`;
      } else if (pct >= (b.alertThreshold || 80)) {
        status = 'Needs Attention';
        commentary = `Approaching limit with ${pct}% utilized. Only ₹${(b.amount - spent).toLocaleString()} remaining.`;
      }

      return {
        category: b.category,
        budget: b.amount,
        spent,
        percentage: pct,
        status,
        commentary,
      };
    });

    const overBudgetCount = categoryVerdicts.filter((c) => c.status === 'Over Budget').length;
    const warningCount = categoryVerdicts.filter((c) => c.status === 'Needs Attention').length;

    let overallVerdict = 'On Track';
    if (overBudgetCount > 0) overallVerdict = 'Over Budget';
    else if (warningCount > 0) overallVerdict = 'Needs Attention';

    const insight = await AIInsight.create({
      userId,
      reportType: 'budget_verdict',
      period: currentMonthYear,
      title: `Budget Verdict: ${overallVerdict}`,
      summary: `Automated analysis for ${currentMonthYear}: ${overBudgetCount} category(s) over budget, ${warningCount} nearing limit.`,
      data: {
        overallVerdict,
        categoryVerdicts,
        totalBudgets: budgets.length,
        overBudgetCount,
        warningCount,
      },
    });

    res.status(201).json({
      success: true,
      insight,
    });
  } catch (error) {
    console.error('generateBudgetVerdicts error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate budget verdicts' });
  }
};

/**
 * 4. Transaction Spending Analyzer
 */
export const analyzeTransactions = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { category, type, startDate, endDate } = req.body;

    const query = { userId: new mongoose.Types.ObjectId(userId) };
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    let records = [];
    if (type === 'income') {
      records = await Income.find(query).sort({ date: -1 }).limit(100);
    } else {
      records = await Expense.find(query).sort({ date: -1 }).limit(100);
    }

    const totalAmount = records.reduce((acc, r) => acc + r.amount, 0);
    const avgAmount = records.length > 0 ? Math.round(totalAmount / records.length) : 0;

    const insights = [
      `Total analyzed volume: ₹${totalAmount.toLocaleString()} across ${records.length} transactions.`,
      `Average transaction ticket size is ₹${avgAmount.toLocaleString()}.`,
      records.length > 0
        ? `Largest single transaction: "${records[0].description}" of ₹${Math.max(...records.map((r) => r.amount)).toLocaleString()}.`
        : 'No transaction outliers detected in current filter range.',
    ];

    const insight = await AIInsight.create({
      userId,
      reportType: 'spending_analyzer',
      title: 'Contextual Transaction Analysis',
      summary: `Analyzed ${records.length} filtered transactions totaling ₹${totalAmount.toLocaleString()}.`,
      data: {
        totalAmount,
        avgAmount,
        transactionCount: records.length,
        insights,
        categoryFilter: category || 'All',
        typeFilter: type || 'expense',
      },
    });

    res.status(201).json({
      success: true,
      insight,
    });
  } catch (error) {
    console.error('analyzeTransactions error:', error);
    res.status(500).json({ success: false, message: 'Failed to analyze transactions' });
  }
};

/**
 * 5. Persistent Insights History
 */
export const getInsightsHistory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { reportType, limit = 10 } = req.query;

    const filter = { userId };
    if (reportType) filter.reportType = reportType;

    const insights = await AIInsight.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      insights,
    });
  } catch (error) {
    console.error('getInsightsHistory error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch AI insights history' });
  }
};
