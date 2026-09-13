import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Award,
  Flame,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Spinner from '../components/Spinner';

const AIInsights = () => {
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'tips' | 'verdicts' | 'history'
  const [loading, setLoading] = useState(false);

  // States for the reports
  const [summaryReport, setSummaryReport] = useState(null);
  const [savingsTipsReport, setSavingsTipsReport] = useState(null);
  const [budgetVerdictReport, setBudgetVerdictReport] = useState(null);
  const [historyList, setHistoryList] = useState([]);

  const currentMonthYear = `${new Date().getFullYear()}-${String(
    new Date().getMonth() + 1
  ).padStart(2, '0')}`;

  // Fetch past reports initially
  const fetchHistory = async () => {
    try {
      const res = await api.get('/ai/history?limit=10');
      if (res.data?.success) {
        setHistoryList(res.data.insights || []);
        // Populate current views if available in history
        const sum = res.data.insights.find((i) => i.reportType === 'monthly_summary');
        const tip = res.data.insights.find((i) => i.reportType === 'savings_tips');
        const ver = res.data.insights.find((i) => i.reportType === 'budget_verdict');
        if (sum) setSummaryReport(sum);
        if (tip) setSavingsTipsReport(tip);
        if (ver) setBudgetVerdictReport(ver);
      }
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // 1. Generate Monthly Financial Summary
  const generateSummary = async () => {
    setLoading(true);
    try {
      toast.loading('ArthSetu AI is analyzing your monthly financials...', { id: 'ai-toast' });
      const res = await api.post('/ai/monthly-summary', { monthYear: currentMonthYear });
      if (res.data?.success) {
        setSummaryReport(res.data.insight);
        toast.success('Financial summary generated!', { id: 'ai-toast' });
        fetchHistory();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate summary', { id: 'ai-toast' });
    } finally {
      setLoading(false);
    }
  };

  // 2. Generate 4 Ranked Savings Tips
  const generateSavingsTips = async () => {
    setLoading(true);
    try {
      toast.loading('Analyzing spending categories for savings...', { id: 'ai-toast' });
      const res = await api.post('/ai/savings-tips', { monthYear: currentMonthYear });
      if (res.data?.success) {
        setSavingsTipsReport(res.data.insight);
        toast.success('4 Ranked Savings Tips generated!', { id: 'ai-toast' });
        fetchHistory();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate savings tips', { id: 'ai-toast' });
    } finally {
      setLoading(false);
    }
  };

  // 3. Generate Budget Verdicts
  const generateBudgetVerdict = async () => {
    setLoading(true);
    try {
      toast.loading('Auditing budget limits & spending...', { id: 'ai-toast' });
      const res = await api.post('/ai/budget-verdict', { monthYear: currentMonthYear });
      if (res.data?.success) {
        setBudgetVerdictReport(res.data.insight);
        toast.success('Budget verdicts calculated!', { id: 'ai-toast' });
        fetchHistory();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate budget verdicts', { id: 'ai-toast' });
    } finally {
      setLoading(false);
    }
  };

  // Helpers for Health Score Gauge representation
  const healthScore = summaryReport?.healthScore || 75;
  const rating = summaryReport?.data?.rating || 'Good';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-6 w-6 rounded-lg bg-teal-600 text-white flex items-center justify-center">
              <Sparkles size={14} />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700">
              ArthSetu Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Financial Advisor
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Real-time financial audits, ranked savings tips, and automated budget verdicts powered by
            Gemini 3.6 Flash.
          </p>
        </div>

        {/* Global Action */}
        <div className="flex items-center gap-2">
          <button
            disabled={loading}
            onClick={() => {
              if (activeTab === 'summary') generateSummary();
              else if (activeTab === 'tips') generateSavingsTips();
              else if (activeTab === 'verdicts') generateBudgetVerdict();
              else fetchHistory();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-xs font-bold shadow-md shadow-teal-700/20 transition cursor-pointer disabled:opacity-60 shrink-0"
          >
            {loading ? <Spinner size="sm" /> : <RefreshCw size={14} />}
            <span>{loading ? 'Analyzing...' : 'Generate New Insight'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center p-1 bg-slate-100/90 rounded-2xl max-w-fit overflow-x-auto border border-slate-200/60">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'summary'
              ? 'bg-white text-teal-800 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Monthly Summary
        </button>
        <button
          onClick={() => setActiveTab('tips')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'tips'
              ? 'bg-white text-teal-800 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          4 Ranked Savings Tips
        </button>
        <button
          onClick={() => setActiveTab('verdicts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'verdicts'
              ? 'bg-white text-teal-800 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Budget Verdicts
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'history'
              ? 'bg-white text-teal-800 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Past Reports ({historyList.length})
        </button>
      </div>

      {/* TAB 1: MONTHLY SUMMARY */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {summaryReport ? (
            <>
              {/* Health Score Gauge & Executive Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Score Card Gauge */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Financial Health Score
                  </span>

                  {/* Circular visual representation */}
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#f1f5f9"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#0d9488"
                        strokeWidth="8"
                        strokeDasharray={251.2}
                        initial={{ strokeDashoffset: 251.2 }}
                        animate={{ strokeDashoffset: 251.2 - (251.2 * healthScore) / 100 }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-slate-900">{healthScore}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">out of 100</span>
                    </div>
                  </div>

                  <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200/60">
                    <Award size={13} className="text-teal-600" />
                    <span>Rating: {rating}</span>
                  </div>
                </div>

                {/* Executive Summary Card */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                        Executive Overview ({summaryReport.period})
                      </h3>
                      <span className="text-xs text-slate-400">
                        {new Date(summaryReport.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {summaryReport.summary || summaryReport.data?.summary}
                    </p>
                  </div>

                  {/* Financial Metrics snapshot */}
                  {summaryReport.data?.financials && (
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 mt-4">
                      <div className="bg-slate-50 p-3 rounded-2xl">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Income</span>
                        <p className="text-sm font-extrabold text-emerald-600">
                          ₹ {Number(summaryReport.data.financials.totalIncome).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Expenses</span>
                        <p className="text-sm font-extrabold text-rose-600">
                          ₹ {Number(summaryReport.data.financials.totalExpense).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Savings Rate</span>
                        <p className="text-sm font-extrabold text-teal-700">
                          {summaryReport.data.financials.savingsRate}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Strengths & Risks & Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Key Strengths */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 size={18} />
                    <h4 className="text-sm font-bold tracking-tight">Identified Strengths</h4>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600">
                    {(summaryReport.data?.keyStrengths || [
                      'Positive cashflow buffer maintained throughout the billing cycle',
                      'High savings rate above standard benchmarks',
                    ]).map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risk Factors */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertTriangle size={18} />
                    <h4 className="text-sm font-bold tracking-tight">Risk Factors to Monitor</h4>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600">
                    {(summaryReport.data?.riskFactors || [
                      'Discretionary expenses approaching upper tier of net income',
                      'Liquid reserve could be strengthened',
                    ]).map((r, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommended Action Items */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-2 text-teal-700 mb-4">
                  <Zap size={18} />
                  <h4 className="text-sm font-bold tracking-tight">
                    Recommended Next Actions
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(summaryReport.data?.recommendedActions || [
                    'Automate monthly investment transfer',
                    'Cap dining spend by 15%',
                    'Audit active subscriptions',
                  ]).map((action, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100 text-xs font-medium text-slate-700 flex items-start gap-2.5"
                    >
                      <span className="h-5 w-5 rounded-full bg-teal-700 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/80 p-8 space-y-4">
              <Sparkles size={44} className="mx-auto text-teal-500 animate-pulse" />
              <h3 className="text-lg font-bold text-slate-800">Generate Your Monthly Financial Report</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                ArthSetu AI evaluates your cashflow, calculates a Financial Health Score (0-100),
                and provides strategic advisory commentary powered by Gemini 3.6 Flash.
              </p>
              <button
                disabled={loading}
                onClick={generateSummary}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-xs font-bold shadow-md shadow-teal-700/20 transition cursor-pointer"
              >
                {loading ? <Spinner size="sm" /> : <Sparkles size={15} />}
                <span>Generate Report Now</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: 4 RANKED SAVINGS TIPS */}
      {activeTab === 'tips' && (
        <div className="space-y-6">
          {savingsTipsReport ? (
            <>
              {/* Savings Potential Banner */}
              <div className="bg-gradient-to-r from-teal-700 to-emerald-700 text-white rounded-3xl p-6 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-teal-100">
                    Total Potential Monthly Savings
                  </span>
                  <h3 className="text-3xl font-extrabold tracking-tight mt-1">
                    ₹{' '}
                    {(
                      savingsTipsReport.data?.totalPotentialSavings || 4850
                    ).toLocaleString()}{' '}
                    / month
                  </h3>
                  <p className="text-xs text-teal-100 mt-1">
                    Cumulative monthly savings identified by implementing the 4 recommendations
                    below.
                  </p>
                </div>
                <Flame size={36} className="text-teal-200 shrink-0" />
              </div>

              {/* 4 Ranked Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {(savingsTipsReport.data?.tips || []).map((tip) => (
                  <motion.div
                    key={tip.rank}
                    whileHover={{ y: -2 }}
                    className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Rank Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="h-7 w-7 rounded-xl bg-teal-100 text-teal-800 font-extrabold text-xs flex items-center justify-center">
                            #{tip.rank}
                          </span>
                          <span className="text-xs font-bold text-slate-700 uppercase">
                            {tip.category}
                          </span>
                        </div>
                        <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          {tip.impact || 'High'} Impact
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 mb-1">{tip.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{tip.suggestion}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Estimated Monthly Savings:</span>
                      <span className="font-extrabold text-emerald-600">
                        + ₹{Number(tip.estimatedMonthlySavings).toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/80 p-8 space-y-4">
              <Zap size={44} className="mx-auto text-teal-600" />
              <h3 className="text-lg font-bold text-slate-800">No Savings Tips Generated Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Discover 4 ranked, category-specific suggestions for reducing monthly spending.
              </p>
              <button
                disabled={loading}
                onClick={generateSavingsTips}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-xs font-bold shadow-md shadow-teal-700/20 transition cursor-pointer"
              >
                {loading ? <Spinner size="sm" /> : <Sparkles size={15} />}
                <span>Calculate Savings Tips</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BUDGET VERDICTS */}
      {activeTab === 'verdicts' && (
        <div className="space-y-6">
          {budgetVerdictReport ? (
            <>
              {/* Verdict Header Banner */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Overall Budget Status
                  </span>
                  <div className="flex items-center gap-2.5 mt-1">
                    <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      {budgetVerdictReport.data?.overallVerdict || 'On Track'}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {budgetVerdictReport.summary}
                  </p>
                </div>

                <div
                  className={`px-4 py-2 rounded-2xl text-xs font-extrabold ${
                    budgetVerdictReport.data?.overallVerdict === 'Over Budget'
                      ? 'bg-rose-100 text-rose-700'
                      : budgetVerdictReport.data?.overallVerdict === 'Needs Attention'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {budgetVerdictReport.data?.overallVerdict || 'On Track'}
                </div>
              </div>

              {/* Category Verdict List */}
              <div className="space-y-3">
                {(budgetVerdictReport.data?.categoryVerdicts || []).map((cv, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800">{cv.category}</span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                            cv.status === 'Over Budget'
                              ? 'bg-rose-50 text-rose-700'
                              : cv.status === 'Needs Attention'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {cv.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{cv.commentary}</p>
                    </div>

                    <div className="text-right shrink-0 text-xs">
                      <span className="font-bold text-slate-900">
                        ₹ {Number(cv.spent).toLocaleString()}
                      </span>{' '}
                      <span className="text-slate-400">
                        / ₹ {Number(cv.budget).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/80 p-8 space-y-4">
              <Target size={44} className="mx-auto text-teal-600" />
              <h3 className="text-lg font-bold text-slate-800">No Budget Verdict Calculated</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Audit your actual transaction spending against set limits to detect budget creep early.
              </p>
              <button
                disabled={loading}
                onClick={generateBudgetVerdict}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-xs font-bold shadow-md shadow-teal-700/20 transition cursor-pointer"
              >
                {loading ? <Spinner size="sm" /> : <Sparkles size={15} />}
                <span>Evaluate Budget Verdict</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PERSISTENT HISTORY ARCHIVE */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Persistent Insights Archive</h3>
              <p className="text-xs text-slate-400">
                All reports are saved in MongoDB so you can track your financial journey over time.
              </p>
            </div>
            <Clock size={18} className="text-slate-400" />
          </div>

          {historyList.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {historyList.map((item) => (
                <div
                  key={item._id}
                  className="py-3.5 flex items-center justify-between text-xs hover:bg-slate-50 px-2 rounded-xl transition"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800">{item.title}</p>
                    <p className="text-slate-500 text-[11px] max-w-xl truncate">{item.summary}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    {item.healthScore && (
                      <span className="text-teal-700 font-extrabold text-[11px]">
                        Score: {item.healthScore}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              No saved reports yet. Generate a report above to start your archive.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIInsights;
