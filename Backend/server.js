import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoutes from "./Routes/user.routes.js";
import postRoutes from "./Routes/Post.routes.js";

dotenv.config();
const app = express();

// ✅ Use specific origin for your Vercel frontend
const allowedOrigins = [
  "https://pro-connect-git-main-shubham-yadavs-projects-4026bfea.vercel.app",
  "http://localhost:3000" // keep for local testing
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Handle preflight requests
app.options("*", cors());

app.use(express.json());
app.use("/", userRoutes);
app.use("/", postRoutes);
app.use(express.static("uploads"));

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    app.listen(9090, () => {
      console.log("app is listening on port 9090");
    });
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
};

start();

