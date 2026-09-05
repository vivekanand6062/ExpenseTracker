import mongoose from "mongoose";


export const connectDB=async()=>{
    await mongoose.connect("mongodb+srv://vivekanand272170_db_user:7cljfj2U7PGzORIh@cluster2.adses0h.mongodb.net/Expense").then(()=>console.log("DB connect"));
}