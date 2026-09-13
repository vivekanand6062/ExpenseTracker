import mongoose from 'mongoose';
import Budget from '../models/budgetModel.js';
import Expense from '../models/expenseModel.js';

export const getBudgets = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { period = 'monthly', monthYear } = req.query;

    const currentMonthYear =
      monthYear ||
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    // Calculate date window for real-time join
    let startDate, endDate;
    if (period === 'monthly') {
      const [year, month] = currentMonthYear.split('-').map(Number);
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59, 999);
    } else {
      // Weekly: current week (Monday to Sunday)
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(now.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    }

    // 1. Fetch user budgets
    const budgets = await Budget.find({
      userId,
      period,
      ...(period === 'monthly' ? { monthYear: currentMonthYear } : {}),
    });

    // 2. Aggregate actual real-time spending grouped by category
    const spendingAgg = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
        },
      },
    ]);

    const spendingMap = {};
    spendingAgg.forEach((item) => {
      spendingMap[item._id] = {
        spent: item.totalSpent,
        count: item.transactionCount,
      };
    });

    // 3. Join budget target with real-time spending
    let totalBudgeted = 0;
    let totalSpent = 0;

    const budgetData = budgets.map((b) => {
      const catSpend = spendingMap[b.category]?.spent || 0;
      const count = spendingMap[b.category]?.count || 0;
      const percentage = b.amount > 0 ? Math.round((catSpend / b.amount) * 100) : 0;
      const remaining = b.amount - catSpend;

      totalBudgeted += b.amount;
      totalSpent += catSpend;

      let status = 'on_track';
      if (percentage >= 100) {
        status = 'over_budget';
      } else if (percentage >= (b.alertThreshold || 80)) {
        status = 'warning';
      }

      return {
        _id: b._id,
        category: b.category,
        budgetAmount: b.amount,
        spent: catSpend,
        remaining,
        percentage,
        transactionCount: count,
        period: b.period,
        monthYear: b.monthYear,
        alertThreshold: b.alertThreshold,
        status,
      };
    });

    res.json({
      success: true,
      budgets: budgetData,
      summary: {
        totalBudgeted,
        totalSpent,
        remaining: totalBudgeted - totalSpent,
        overallPercentage:
          totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0,
        period,
        monthYear: currentMonthYear,
      },
    });
  } catch (error) {
    console.error('getBudgets error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch budget tracking data' });
  }
};

export const setBudget = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { category, amount, period = 'monthly', monthYear, alertThreshold = 80 } = req.body;

    if (!category || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid category and positive budget amount are required',
      });
    }

    const currentMonthYear =
      monthYear ||
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    const filter = {
      userId,
      category: category.trim(),
      period,
      monthYear: currentMonthYear,
    };

    const update = {
      $set: {
        amount: Number(amount),
        alertThreshold: Number(alertThreshold) || 80,
      },
    };

    const budget = await Budget.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    res.status(200).json({
      success: true,
      budget,
      message: 'Budget saved successfully',
    });
  } catch (error) {
    console.error('setBudget error:', error);
    res.status(500).json({ success: false, message: 'Failed to set budget' });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const result = await Budget.findOneAndDelete({ _id: id, userId });
    if (!result) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    res.json({ success: true, message: 'Budget removed successfully' });
  } catch (error) {
    console.error('deleteBudget error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete budget' });
  }
};
