import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import globalErrorHandler from "./v1/middleware/errorHndler.js";
import { userTrackingMiddleware } from "./v1/middleware/userTracking.middleware.js";
import { connectDB } from "./config/db.js";
import router from "./route.js";

const app = express();
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 8000;
// middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());
app.use(userTrackingMiddleware);

// routes
app.use(router);

// test route
app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

app.get("/api/v1", (req, res) => {
  res.json({ message: "API v1 working ✅" });
});

// global error handler
app.use(globalErrorHandler);

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
