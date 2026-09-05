import express from 'express';
import { getCurrentUser, loginUser, registerUser, UpdatePassword, UpdateProfile } from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';


const userRouter=express.Router();

userRouter.post("/register",registerUser);
userRouter.post("/login",loginUser);

//protected routes

userRouter.get("/me",authMiddleware,getCurrentUser);
userRouter.put("/profile",authMiddleware,UpdateProfile);

userRouter.put("/password",authMiddleware,UpdatePassword);


export default userRouter;
