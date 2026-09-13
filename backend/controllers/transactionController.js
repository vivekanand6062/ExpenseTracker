import mongoose from 'mongoose';
import Income from '../models/incomeModel.js';
import Expense from '../models/expenseModel.js';

export const getTransactions = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      page = 1,
      limit = 10,
      search = '',
      category = '',
      type = 'all', // 'all', 'income', 'expense'
      startDate,
      endDate,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));

    // Base query
    const buildFilter = () => {
      const q = { userId: new mongoose.Types.ObjectId(userId) };

      if (category && category !== 'All') {
        q.category = category;
      }

      if (startDate || endDate) {
        q.date = {};
        if (startDate) q.date.$gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          q.date.$lte = end;
        }
      }

      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        q.$or = [{ description: regex }, { category: regex }];
      }

      return q;
    };

    const filter = buildFilter();

    let allItems = [];

    if (type === 'income') {
      const incomes = await Income.find(filter).lean();
      allItems = incomes.map((i) => ({ ...i, type: 'income' }));
    } else if (type === 'expense') {
      const expenses = await Expense.find(filter).lean();
      allItems = expenses.map((e) => ({ ...e, type: 'expense' }));
    } else {
      const [incomes, expenses] = await Promise.all([
        Income.find(filter).lean(),
        Expense.find(filter).lean(),
      ]);
      allItems = [
        ...incomes.map((i) => ({ ...i, type: 'income' })),
        ...expenses.map((e) => ({ ...e, type: 'expense' })),
      ];
    }

    // Sort descending by date
    allItems.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Compute totals of filtered set
    const totalIncome = allItems
      .filter((i) => i.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = allItems
      .filter((i) => i.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalCount = allItems.length;
    const totalPages = Math.ceil(totalCount / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedItems = allItems.slice(startIndex, startIndex + limitNum);

    res.json({
      success: true,
      transactions: paginatedItems,
      pagination: {
        totalCount,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
      },
      summary: {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
      },
    });
  } catch (error) {
    console.error('getTransactions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
  }
};

export const addTransaction = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { description, amount, category, date, type = 'expense' } = req.body;

    if (!description || !amount || !category) {
      return res.status(400).json({
        success: false,
        message: 'Description, amount, and category are required',
      });
    }

    const payload = {
      description: description.trim(),
      amount: Number(amount),
      category: category.trim(),
      date: date ? new Date(date) : new Date(),
      userId,
      type,
    };

    let item;
    if (type === 'income') {
      item = await Income.create(payload);
    } else {
      item = await Expense.create(payload);
    }

    res.status(201).json({
      success: true,
      transaction: item,
      message: `${type === 'income' ? 'Income' : 'Expense'} record added successfully`,
    });
  } catch (error) {
    console.error('addTransaction error:', error);
    res.status(500).json({ success: false, message: 'Failed to add transaction' });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const { description, amount, category, date, type } = req.body;

    const payload = {};
    if (description) payload.description = description.trim();
    if (amount) payload.amount = Number(amount);
    if (category) payload.category = category.trim();
    if (date) payload.date = new Date(date);

    let item;
    if (type === 'income') {
      item = await Income.findOneAndUpdate({ _id: id, userId }, { $set: payload }, { new: true });
    } else {
      item = await Expense.findOneAndUpdate({ _id: id, userId }, { $set: payload }, { new: true });
    }

    if (!item) {
      // Check in opposite collection in case type wasn't passed or changed
      item = await (type === 'income' ? Expense : Income).findOneAndUpdate(
        { _id: id, userId },
        { $set: payload },
        { new: true }
      );
    }

    if (!item) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({
      success: true,
      transaction: item,
      message: 'Transaction updated successfully',
    });
  } catch (error) {
    console.error('updateTransaction error:', error);
    res.status(500).json({ success: false, message: 'Failed to update transaction' });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const { type } = req.query;

    let deleted = null;
    if (type === 'income') {
      deleted = await Income.findOneAndDelete({ _id: id, userId });
    } else if (type === 'expense') {
      deleted = await Expense.findOneAndDelete({ _id: id, userId });
    } else {
      deleted = await Expense.findOneAndDelete({ _id: id, userId });
      if (!deleted) {
        deleted = await Income.findOneAndDelete({ _id: id, userId });
      }
    }

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('deleteTransaction error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete transaction' });
  }
};
