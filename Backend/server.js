import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoutes from "./Routes/user.routes.js";
import postRoutes from "./Routes/Post.routes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/", userRoutes);
app.use("/", postRoutes);
app.use("/uploads", express.static("uploads"));

const start = async () => {
  const connectDB = await mongoose.connect(process.env.MONGO_URL);
  app.listen(9090, () => {
    console.log("app is listening on port 9090");
  });
};

start();
