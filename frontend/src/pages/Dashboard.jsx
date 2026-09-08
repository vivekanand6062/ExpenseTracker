import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Percent,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  PieChart,
  History,
  Calendar,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';
import { dashboardStyles } from '../assets/dummyStyles';
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

const CATEGORY_COLORS = [
  'bg-teal-500',
  'bg-orange-500',
  'bg-cyan-500',
  'bg-amber-500',
  'bg-indigo-500',
  'bg-pink-500',
  'bg-emerald-500',
  'bg-blue-500',
];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    monthlyIncome: 0,
    monthlyExpense: 0,
    savings: 0,
    savingsRate: 0,
    recentTransactions: [],
    spendByCategory: {},
    expenseDistribution: [],
  });
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('income'); // 'income' or 'expense'

  // Asynchronous dashboard fetch
  const fetchDashboardData = async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) setRefreshing(true);
    try {
      const res = await api.get('/dashboard');
      if (res.data?.success && res.data?.data) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setToastType('error');
      setToastMessage('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      if (showRefreshSpinner) setRefreshing(false);
    }
  };

  useEffect(() => {
    let active = true;

    api.get('/dashboard')
      .then((res) => {
        if (active && res.data?.success && res.data?.data) {
          setDashboardData(res.data.data);
        }
      })
      .catch((err) => {
        if (active) {
          console.error('Failed to load dashboard data:', err);
          setToastType('error');
          setToastMessage('Failed to load dashboard data. Please try again.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleOpenAddModal = (type) => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleTransactionSuccess = () => {
    setToastType('success');
    setToastMessage(`Transaction recorded successfully!`);
    fetchDashboardData(false);
  };

  const {
    monthlyIncome = 0,
    monthlyExpense = 0,
    savings = 0,
    savingsRate = 0,
    recentTransactions = [],
    expenseDistribution = [],
  } = dashboardData;

  const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage('')}
      />

      {/* Welcome Banner / Header Card */}
      <div className={dashboardStyles.headerContainer}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-700 font-medium text-sm mb-1">
              <Calendar size={16} />
              <span>{currentMonthName} Overview</span>
            </div>
            <h1 className={dashboardStyles.headerTitle}>
              Welcome back, {user?.name?.split(' ')[0] || 'Friend'}!
            </h1>
            <p className={dashboardStyles.headerSubtitle}>
              Here is your financial snapshot and activity for this month.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="p-3 bg-white/80 hover:bg-white text-gray-700 rounded-xl shadow-sm border border-gray-200/50 transition-all"
              title="Refresh Dashboard"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin text-teal-600' : ''} />
            </button>

            <button
              onClick={() => handleOpenAddModal('income')}
              className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all text-sm"
            >
              <PlusCircle size={18} />
              <span>Add Income</span>
            </button>

            <button
              onClick={() => handleOpenAddModal('expense')}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all text-sm"
            >
              <PlusCircle size={18} />
              <span>Add Expense</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Total Balance / Savings */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-500">Total Savings</span>
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
              <Wallet size={22} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-900">
              {loading ? '...' : formatCurrency(savings)}
            </h3>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              Net balance for current period
            </p>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-500">Monthly Income</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-emerald-600">
              {loading ? '...' : formatCurrency(monthlyIncome)}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Total revenue earned</p>
          </div>
        </div>

        {/* Monthly Expense */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-500">Monthly Expense</span>
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
              <TrendingDown size={22} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-orange-600">
              {loading ? '...' : formatCurrency(monthlyExpense)}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Total money spent</p>
          </div>
        </div>

        {/* Saving Rate */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-500">Saving Rate</span>
            <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl">
              <Percent size={22} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-cyan-700">
              {loading ? '...' : `${savingsRate}%`}
            </h3>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics & Recent Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                <History size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Recent Transactions</h2>
              <span className="text-xs px-2.5 py-0.5 bg-gray-100 text-gray-600 font-semibold rounded-full">
                {recentTransactions.length}
              </span>
            </div>

            <button
              onClick={() => navigate('/income')}
              className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
            >
              Manage Activity →
            </button>
          </div>

          {/* List of Recent Transactions */}
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-14 h-14 mx-auto mb-3 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                <History size={24} />
              </div>
              <p className="text-gray-600 font-medium">No recent transactions</p>
              <p className="text-xs text-gray-400 mt-1">
                Add an income or expense to start tracking your finances.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.slice(0, 7).map((item, idx) => {
                const isIncome = item.type === 'income';
                return (
                  <div
                    key={item._id || idx}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      isIncome
                        ? 'bg-emerald-50/40 border-emerald-100/60 hover:bg-emerald-50'
                        : 'bg-orange-50/40 border-orange-100/60 hover:bg-orange-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2.5 rounded-xl shrink-0 ${
                          isIncome ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
                        }`}
                      >
                        {isIncome ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {item.description}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                          <span className="font-medium text-gray-600">{item.category}</span>
                          <span>•</span>
                          <span>{formatDate(item.date || item.createdAt)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-4">
                      <p
                        className={`font-bold text-sm ${
                          isIncome ? 'text-emerald-600' : 'text-orange-600'
                        }`}
                      >
                        {isIncome ? '+' : '-'} {formatCurrency(item.amount)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Spending By Category & Financial Health */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-gray-100">
              <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg">
                <PieChart size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Expense Distribution</h2>
            </div>

            {/* Category Breakdown Bars */}
            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : expenseDistribution.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <p className="text-sm">No expenses recorded this month.</p>
                <button
                  onClick={() => handleOpenAddModal('expense')}
                  className="mt-3 text-xs font-semibold text-orange-600 hover:underline"
                >
                  + Add your first expense
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {expenseDistribution.map((item, idx) => {
                  const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                  return (
                    <div key={item.category || idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-gray-700">{item.category}</span>
                        <span className="text-gray-900">
                          {formatCurrency(item.amount)}{' '}
                          <span className="text-gray-400 font-normal">({item.percent}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${color} transition-all duration-500`}
                          style={{ width: `${Math.min(item.percent, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Financial Health Callout */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100/50">
              <h4 className="font-semibold text-teal-900 text-sm">Monthly Financial Status</h4>
              <p className="text-xs text-teal-700 mt-1 leading-relaxed">
                {savings >= 0
                  ? `You have saved ${formatCurrency(savings)} this month (${savingsRate}% saving rate). Outstanding work!`
                  : `Expenses exceed income by ${formatCurrency(Math.abs(savings))}. Keep an eye on non-essential spending.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={modalOpen}
        type={modalType}
        onClose={() => setModalOpen(false)}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  );
};

export default Dashboard;