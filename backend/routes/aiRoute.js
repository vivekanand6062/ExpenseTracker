import express from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  generateMonthlySummary,
  generateSavingsTips,
  generateBudgetVerdicts,
  analyzeTransactions,
  getInsightsHistory,
} from '../controllers/aiController.js';

const aiRouter = express.Router();

aiRouter.use(authMiddleware);

aiRouter.post('/monthly-summary', generateMonthlySummary);
aiRouter.post('/savings-tips', generateSavingsTips);
aiRouter.post('/budget-verdict', generateBudgetVerdicts);
aiRouter.post('/budget-verdicts', generateBudgetVerdicts);
aiRouter.post('/analyze-spending', analyzeTransactions);
aiRouter.post('/analyze-transactions', analyzeTransactions);
aiRouter.get('/history', getInsightsHistory);

export default aiRouter;
