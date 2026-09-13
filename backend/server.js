import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './config/db.js';
import userRouter from './routes/userRoutes.js';
import incomeRouter from './routes/incomeRoute.js';
import expenseRouter from './routes/expenseRoute.js';
import dashboardRouter from './routes/dashboardRoute.js';
import categoryRouter from './routes/categoryRoute.js';
import budgetRouter from './routes/budgetRoute.js';
import aiRouter from './routes/aiRoute.js';
import transactionRouter from './routes/transactionRoute.js';
import { ensureDefaultCategories } from './controllers/categoryController.js';

const app=express();
const port = process.env.PORT || 4000;

//middlewere
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//DB
connectDB().then(() => {
  ensureDefaultCategories();
});

//Routes
app.use("/api/user",userRouter);
app.use("/api/income",incomeRouter);
app.use("/api/expense",expenseRouter);
app.use("/api/dashboard",dashboardRouter);
app.use("/api/categories",categoryRouter);
app.use("/api/budgets",budgetRouter);
app.use("/api/ai",aiRouter);
app.use("/api/transactions",transactionRouter);

app.get('/',(req,res)=>{
    res.send("API WORKING");
})

app.listen(port,()=>{
    console.log(`server listen at port no ${port}`);
})
