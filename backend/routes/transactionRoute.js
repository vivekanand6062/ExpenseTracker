import express from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionController.js';

const transactionRouter = express.Router();

transactionRouter.use(authMiddleware);

transactionRouter.get('/', getTransactions);
transactionRouter.post('/add', addTransaction);
transactionRouter.post('/', addTransaction);
transactionRouter.put('/update/:id', updateTransaction);
transactionRouter.put('/:id', updateTransaction);
transactionRouter.delete('/delete/:id', deleteTransaction);
transactionRouter.delete('/:id', deleteTransaction);

export default transactionRouter;
