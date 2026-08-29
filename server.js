import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { connectDB } from "./config/db.js";
import router from "./route.js";
import {
  notFound,
  errorHandler,
} from "./v1/middleware/error.handler.middleware.js";

const app = express();
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 8000;

// middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());

// test route
app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

app.get("/api/v1", (req, res) => {
  res.json({ message: "API v1 working ✅" });
});

// routes
app.use(router);

// global error handler — must be registered LAST, after every route
app.use(notFound);
app.use(errorHandler);

// start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log("🚀 Server running on port", port);
    });
  } catch (err) {
    console.error("❌ Server start failed:", err.message);
  }
};

startServer();
