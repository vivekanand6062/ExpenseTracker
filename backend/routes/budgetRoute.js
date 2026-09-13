import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { getBudgets, setBudget, deleteBudget } from '../controllers/budgetController.js';

const budgetRouter = express.Router();

budgetRouter.use(authMiddleware);

budgetRouter.get('/', getBudgets);
budgetRouter.post('/set', setBudget);
budgetRouter.post('/', setBudget);
budgetRouter.delete('/delete/:id', deleteBudget);
budgetRouter.delete('/:id', deleteBudget);

export default budgetRouter;
