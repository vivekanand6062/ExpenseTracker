import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import User from '../models/userModel.js';
import Category from '../models/categoryModel.js';
import Income from '../models/incomeModel.js';
import Expense from '../models/expenseModel.js';
import Budget from '../models/budgetModel.js';
import AIInsight from '../models/aiInsightModel.js';

const API_BASE = 'http://localhost:4000/api';
let testUserEmail = `qa_test_${Date.now()}@expenseai.com`;
let testUserPassword = 'TestPassword123!';
let authToken = '';
let userId = '';

const results = [];

function recordTest(name, passed, details = '') {
  results.push({ name, passed, details });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon}: ${name}${details ? ` -> ${details}` : ''}`);
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log('🚀 RUNNING FULL END-TO-END SYSTEM TEST SUITE');
  console.log('======================================================\n');

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 Connected to MongoDB for database verification assertions.\n');

    // ----------------------------------------------------
    // TEST SUITE 1: USER AUTHENTICATION
    // ----------------------------------------------------
    console.log('--- 1. User Authentication (JWT & bcrypt.js) ---');

    // 1.1 Register User
    const regRes = await fetch(`${API_BASE}/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'QA Automation User',
        email: testUserEmail,
        password: testUserPassword,
      }),
    });
    const regData = await regRes.json();
    const regPass = regRes.status === 201 && regData.success && !!regData.token;
    authToken = regData.token;
    userId = regData.user?.id;
    recordTest('User Registration (201 Created & JWT Token)', regPass, `Token: ${authToken ? 'Issued' : 'Missing'}`);

    // 1.2 Verify bcrypt password hashing in DB
    const dbUser = await User.findOne({ email: testUserEmail });
    const isHashed = dbUser && dbUser.password !== testUserPassword && dbUser.password.startsWith('$2');
    const bcryptMatches = await bcrypt.compare(testUserPassword, dbUser.password);
    recordTest('Password Security (bcrypt.js hashing verified in DB)', isHashed && bcryptMatches, `Hash: ${dbUser.password.slice(0, 15)}...`);

    // 1.3 Login with Valid Credentials
    const loginRes = await fetch(`${API_BASE}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUserEmail,
        password: testUserPassword,
      }),
    });
    const loginData = await loginRes.json();
    const loginPass = loginRes.status === 200 && loginData.success && !!loginData.token;
    recordTest('User Login with Valid Credentials', loginPass);

    // 1.4 Login with Invalid Credentials (Rejection test)
    const badLoginRes = await fetch(`${API_BASE}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUserEmail,
        password: 'WrongPassword!',
      }),
    });
    const badLoginData = await badLoginRes.json();
    recordTest('User Login Rejection on Invalid Password (400)', badLoginRes.status === 400 && !badLoginData.success);

    // 1.5 Protected Route Unauthenticated Rejection
    const unauthRes = await fetch(`${API_BASE}/dashboard`);
    recordTest('Protected Endpoint Rejection without Token (401)', unauthRes.status === 401);

    // ----------------------------------------------------
    // TEST SUITE 2: CATEGORY SYSTEM (17 Default + Custom CRUD)
    // ----------------------------------------------------
    console.log('\n--- 2. Category System (17 Defaults + Custom Categories) ---');

    // 2.1 Fetch categories for user
    const catRes = await fetch(`${API_BASE}/categories`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const catData = await catRes.json();
    const categories = catData.categories || [];
    const defaultCats = categories.filter((c) => c.isDefault);
    const incomeDefaults = defaultCats.filter((c) => c.type === 'income');
    const expenseDefaults = defaultCats.filter((c) => c.type === 'expense');

    recordTest(
      '17 Auto-Seeded Default Categories Available',
      defaultCats.length === 17 && incomeDefaults.length === 4 && expenseDefaults.length === 13,
      `Found ${defaultCats.length} total (${incomeDefaults.length} income, ${expenseDefaults.length} expense)`
    );

    // 2.2 Add Custom Personal Category
    const customCatRes = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        name: 'Gaming & Streaming',
        type: 'expense',
        icon: 'Gamepad2',
        color: '#8b5cf6',
      }),
    });
    const customCatData = await customCatRes.json();
    const createdCat = customCatData.category;
    recordTest(
      'Create Personal Custom Category',
      customCatRes.status === 201 && createdCat?.name === 'Gaming & Streaming',
      `Category ID: ${createdCat?._id}`
    );

    // 2.3 Update Custom Personal Category
    const updateCatRes = await fetch(`${API_BASE}/categories/${createdCat._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        name: 'Esports & Gaming Club',
        color: '#ec4899',
      }),
    });
    const updateCatData = await updateCatRes.json();
    recordTest(
      'Update Personal Custom Category',
      updateCatRes.status === 200 && updateCatData.category?.name === 'Esports & Gaming Club',
      `Updated Name: ${updateCatData.category?.name}`
    );

    // 2.4 Attempt to Delete System Default Category (Protection test)
    const defaultSample = defaultCats[0];
    const delDefaultRes = await fetch(`${API_BASE}/categories/${defaultSample._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    recordTest(
      'Protection: System Default Categories Cannot Be Deleted',
      delDefaultRes.status === 404 || delDefaultRes.status === 400
    );

    // 2.5 Delete Custom Personal Category
    const delCustomRes = await fetch(`${API_BASE}/categories/${createdCat._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    recordTest('Delete Personal Custom Category', delCustomRes.status === 200);

    // ----------------------------------------------------
    // TEST SUITE 3: TRANSACTION MANAGEMENT (CRUD, Filters, Pagination)
    // ----------------------------------------------------
    console.log('\n--- 3. Transaction Management (CRUD, Filters, Pagination) ---');

    // 3.1 Add Incomes
    const addInc1 = await fetch(`${API_BASE}/transactions/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        description: 'Tech Consulting Retainer',
        amount: 80000,
        category: 'Salary',
        date: new Date().toISOString(),
        type: 'income',
      }),
    });
    const incData1 = await addInc1.json();
    recordTest('Add Income Transaction', addInc1.status === 201 && incData1.transaction?.amount === 80000);

    // 3.2 Add Multiple Expenses
    const expensesToAdd = [
      { description: 'Downtown Studio Rent', amount: 25000, category: 'Housing & Rent', daysAgo: 2 },
      { description: 'Organic Grocery Market', amount: 6500, category: 'Groceries', daysAgo: 3 },
      { description: 'Electricity & Fiber Internet', amount: 3500, category: 'Utilities', daysAgo: 5 },
      { description: 'Weekend Cinema & Diners', amount: 4200, category: 'Entertainment', daysAgo: 7 },
    ];

    let allExpensesAdded = true;
    let expenseIds = [];
    for (const exp of expensesToAdd) {
      const expDate = new Date(Date.now() - exp.daysAgo * 24 * 60 * 60 * 1000);
      const res = await fetch(`${API_BASE}/transactions/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          description: exp.description,
          amount: exp.amount,
          category: exp.category,
          date: expDate.toISOString(),
          type: 'expense',
        }),
      });
      const data = await res.json();
      if (!data.success) allExpensesAdded = false;
      else expenseIds.push(data.transaction._id);
    }
    recordTest('Add 4 Category Expense Transactions', allExpensesAdded, `Created ${expenseIds.length} expenses`);

    // 3.3 Paginated Transactions View
    const pageRes = await fetch(`${API_BASE}/transactions?page=1&limit=2`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const pageData = await pageRes.json();
    recordTest(
      'Paginated Transactions View (limit=2)',
      pageData.success && pageData.transactions.length === 2 && pageData.pagination.totalCount === 5,
      `Total: ${pageData.pagination?.totalCount}, Pages: ${pageData.pagination?.totalPages}`
    );

    // 3.4 Search Filter
    const searchRes = await fetch(`${API_BASE}/transactions?search=Cinema`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const searchData = await searchRes.json();
    recordTest(
      'Search Filter by Keyword ("Cinema")',
      searchData.success && searchData.transactions.length === 1 && searchData.transactions[0].description.includes('Cinema')
    );

    // 3.5 Category Filter
    const filterCatRes = await fetch(`${API_BASE}/transactions?category=Groceries`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const filterCatData = await filterCatRes.json();
    recordTest(
      'Category Filter ("Groceries")',
      filterCatData.success && filterCatData.transactions.every((t) => t.category === 'Groceries')
    );

    // 3.6 Type Filter
    const typeIncomeRes = await fetch(`${API_BASE}/transactions?type=income`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const typeIncomeData = await typeIncomeRes.json();
    recordTest(
      'Type Filter ("income")',
      typeIncomeData.success && typeIncomeData.transactions.every((t) => t.type === 'income')
    );

    // 3.7 Update Transaction
    const targetExpId = expenseIds[0];
    const updateTxRes = await fetch(`${API_BASE}/transactions/update/${targetExpId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        description: 'Downtown Studio Rent (Renegotiated)',
        amount: 24000,
        type: 'expense',
      }),
    });
    const updateTxData = await updateTxRes.json();
    recordTest(
      'Update Existing Transaction',
      updateTxRes.status === 200 && updateTxData.transaction?.amount === 24000,
      `New Amount: ₹${updateTxData.transaction?.amount}`
    );

    // 3.8 Delete Transaction
    const deleteTxRes = await fetch(`${API_BASE}/transactions/delete/${expenseIds[3]}?type=expense`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    recordTest('Delete Transaction', deleteTxRes.status === 200);

    // ----------------------------------------------------
    // TEST SUITE 4: BUDGET TRACKING (Monthly, Weekly, Real-Time Spending Join)
    // ----------------------------------------------------
    console.log('\n--- 4. Budget Tracking (Real-Time Spending Progress Join) ---');

    // 4.1 Set Monthly Budget for Groceries
    const setBudgetRes = await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        category: 'Groceries',
        amount: 10000,
        period: 'monthly',
        alertThreshold: 80,
      }),
    });
    const setBudgetData = await setBudgetRes.json();
    recordTest(
      'Define Monthly Category Budget (Groceries ₹10,000)',
      setBudgetRes.status === 200 && setBudgetData.budget?.amount === 10000
    );

    // 4.2 Set Monthly Budget for Housing & Rent
    await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        category: 'Housing & Rent',
        amount: 25000,
        period: 'monthly',
        alertThreshold: 90,
      }),
    });

    // 4.3 Fetch Budgets and Verify Live Join with Spending
    const getBudgetsRes = await fetch(`${API_BASE}/budgets?period=monthly`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const getBudgetsData = await getBudgetsRes.json();
    const groceryBudget = getBudgetsData.budgets?.find((b) => b.category === 'Groceries');
    const rentBudget = getBudgetsData.budgets?.find((b) => b.category === 'Housing & Rent');

    const budgetJoinPass =
      groceryBudget &&
      groceryBudget.spent === 6500 &&
      groceryBudget.remaining === 3500 &&
      groceryBudget.percentage === 65 &&
      groceryBudget.status === 'on_track';

    recordTest(
      'Real-Time Budget Spending Join (Groceries: ₹6,500/₹10,000 = 65% "on_track")',
      budgetJoinPass,
      `Spent: ₹${groceryBudget?.spent}, Remaining: ₹${groceryBudget?.remaining}, Status: ${groceryBudget?.status}`
    );

    // 4.4 Trigger "over_budget" by adding additional spending
    await fetch(`${API_BASE}/transactions/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        description: 'Supermarket Gourmet Grocery Feast',
        amount: 5000,
        category: 'Groceries',
        date: new Date().toISOString(),
        type: 'expense',
      }),
    });

    const getBudgetsOverRes = await fetch(`${API_BASE}/budgets?period=monthly`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const getBudgetsOverData = await getBudgetsOverRes.json();
    const groceryOverBudget = getBudgetsOverData.budgets?.find((b) => b.category === 'Groceries');

    recordTest(
      'Live Progress Over-Budget Alert (Groceries: ₹11,500/₹10,000 = 115% "over_budget")',
      groceryOverBudget && groceryOverBudget.status === 'over_budget' && groceryOverBudget.percentage === 115,
      `Spent: ₹${groceryOverBudget?.spent}, Status: ${groceryOverBudget?.status}`
    );

    // ----------------------------------------------------
    // TEST SUITE 5: DASHBOARD ANALYTICS
    // ----------------------------------------------------
    console.log('\n--- 5. Dashboard Analytics (KPIs, Recharts Trends & Top Categories) ---');

    const dashRes = await fetch(`${API_BASE}/dashboard`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const dashData = await dashRes.json();
    const d = dashData.data;

    recordTest(
      'Dashboard KPI Cards (Total Income, Expenses, Balance, Savings Rate)',
      d.totalIncome > 0 && d.totalExpense > 0 && d.balance === d.totalIncome - d.totalExpense,
      `Income: ₹${d?.totalIncome}, Expenses: ₹${d?.totalExpense}, Net Balance: ₹${d?.balance}, Savings: ${d?.savingsRate}%`
    );

    recordTest(
      'Top Expenses Category Distribution Data',
      Array.isArray(d.categoryDistribution) && d.categoryDistribution.length > 0 && d.categoryDistribution[0].value > 0,
      `Top Category: ${d.categoryDistribution[0]?.name} (₹${d.categoryDistribution[0]?.value})`
    );

    recordTest(
      'Monthly Cashflow Trends (6-Month Range for Spline AreaChart)',
      Array.isArray(d.monthlyTrends) && d.monthlyTrends.length === 6 && d.monthlyTrends[5].income > 0,
      `Months: ${d.monthlyTrends.map((m) => m.month).join(', ')}`
    );

    recordTest(
      'Recent Activity List (Unified Incomes & Expenses)',
      Array.isArray(d.recentTransactions) && d.recentTransactions.length > 0,
      `Found ${d.recentTransactions?.length} recent items`
    );

    // ----------------------------------------------------
    // TEST SUITE 6: AI-POWERED FEATURES (Gemini 2.5/3.6 Flash & Persistent JSON)
    // ----------------------------------------------------
    console.log('\n--- 6. AI-Powered Features (Gemini Intelligence Engine & Persistent Storage) ---');

    // 6.1 Monthly Financial Summary with Health-Score Gauge
    const aiSummaryRes = await fetch(`${API_BASE}/ai/monthly-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({}),
    });
    const aiSummaryData = await aiSummaryRes.json();
    const summaryInsight = aiSummaryData.insight;
    const summaryPass =
      aiSummaryRes.status === 201 &&
      summaryInsight &&
      summaryInsight.healthScore >= 0 &&
      summaryInsight.healthScore <= 100 &&
      summaryInsight.data?.recommendedActions?.length > 0;

    recordTest(
      'AI Monthly Financial Summary & Health-Score Gauge (0-100)',
      summaryPass,
      `Score: ${summaryInsight?.healthScore}/100, Rating: ${summaryInsight?.data?.rating}`
    );

    // 6.2 AI Savings Tips: 4 Ranked Category-Specific Suggestions
    const aiTipsRes = await fetch(`${API_BASE}/ai/savings-tips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({}),
    });
    const aiTipsData = await aiTipsRes.json();
    const tipsInsight = aiTipsData.insight;
    const tips = tipsInsight?.data?.tips;
    const tipsPass =
      aiTipsRes.status === 201 &&
      Array.isArray(tips) &&
      tips.length === 4 &&
      tips.every((t) => t.rank && t.category && t.suggestion && t.estimatedMonthlySavings);

    recordTest(
      'AI Savings Tips (Exactly 4 Ranked Category Suggestions)',
      tipsPass,
      `Categories: ${tips?.map((t) => `#${t.rank} ${t.category}`).join(' | ')}`
    );

    // 6.3 Budget Verdicts: Automated Analysis & Commentary
    const aiVerdictRes = await fetch(`${API_BASE}/ai/budget-verdicts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({}),
    });
    const aiVerdictData = await aiVerdictRes.json();
    const verdictInsight = aiVerdictData.insight;
    const verdictPass =
      aiVerdictRes.status === 201 &&
      verdictInsight &&
      ['On Track', 'Over Budget', 'Needs Attention'].includes(verdictInsight.data?.overallVerdict) &&
      verdictInsight.data?.categoryVerdicts?.length > 0;

    recordTest(
      'AI Budget Verdicts (Status & Category Commentary)',
      verdictPass,
      `Overall: ${verdictInsight?.data?.overallVerdict}, Evaluated Budgets: ${verdictInsight?.data?.categoryVerdicts?.length}`
    );

    // 6.4 Transaction Spending Analyzer (Contextual Insights on Filtered Sets)
    const aiAnalyzerRes = await fetch(`${API_BASE}/ai/analyze-transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ category: 'Groceries', type: 'expense' }),
    });
    const aiAnalyzerData = await aiAnalyzerRes.json();
    const analyzerInsight = aiAnalyzerData.insight;
    const analyzerPass =
      aiAnalyzerRes.status === 201 &&
      analyzerInsight &&
      analyzerInsight.data?.transactionCount > 0 &&
      analyzerInsight.data?.insights?.length > 0;

    recordTest(
      'AI Contextual Transaction Spending Analyzer',
      analyzerPass,
      `Analyzed Volume: ₹${analyzerInsight?.data?.totalAmount} across ${analyzerInsight?.data?.transactionCount} txs`
    );

    // 6.5 Persistent Insights Storage in Database
    const historyRes = await fetch(`${API_BASE}/ai/history?limit=10`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const historyData = await historyRes.json();
    const persistentPass =
      historyRes.status === 200 &&
      Array.isArray(historyData.insights) &&
      historyData.insights.length >= 4;

    recordTest(
      'Persistent Insights (Saved in DB & Chronologically Retrieved)',
      persistentPass,
      `Retrieved ${historyData.insights?.length} persistent AI reports from MongoDB`
    );

    // Clean up QA test data
    console.log('\n--- Cleaning up temporary QA test data ---');
    await User.deleteOne({ _id: userId });
    await Income.deleteMany({ userId });
    await Expense.deleteMany({ userId });
    await Budget.deleteMany({ userId });
    await AIInsight.deleteMany({ userId });
    await Category.deleteMany({ userId });
    console.log('🧹 QA test user and isolated test records purged cleanly.');

    await mongoose.disconnect();

    // ----------------------------------------------------
    // SUMMARY REPORT
    // ----------------------------------------------------
    console.log('\n======================================================');
    const totalTests = results.length;
    const passedTests = results.filter((r) => r.passed).length;
    const failedTests = totalTests - passedTests;

    console.log(`TOTAL TESTS:  ${totalTests}`);
    console.log(`PASSED:       ${passedTests} ✅`);
    console.log(`FAILED:       ${failedTests} ${failedTests === 0 ? '🎉' : '❌'}`);
    console.log('======================================================\n');

    if (failedTests > 0) {
      console.error('⚠️ Some tests failed. Check log details above.');
      process.exit(1);
    } else {
      console.log('🌟 ALL 10 CORE FUNCTIONAL & AI REQUIREMENTS VERIFIED SUCCESSFULLY!');
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal test runner error:', err);
    process.exit(1);
  }
}

runAllTests();
