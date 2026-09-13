import express from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';

const categoryRouter = express.Router();

categoryRouter.use(authMiddleware);

categoryRouter.get('/', getCategories);
categoryRouter.post('/add', addCategory);
categoryRouter.post('/', addCategory);
categoryRouter.put('/update/:id', updateCategory);
categoryRouter.put('/:id', updateCategory);
categoryRouter.delete('/delete/:id', deleteCategory);
categoryRouter.delete('/:id', deleteCategory);

export default categoryRouter;
