import mongoose from "mongoose";


export const connectDB=async()=>{
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb+srv://vivekanand272170_db_user:7cljfj2U7PGzORIh@cluster2.adses0h.mongodb.net/Expense";
    try {
        await mongoose.connect(mongoUri);
        console.log("DB connect");
    } catch (error) {
        console.error("DB connection error:", error);
    }
}