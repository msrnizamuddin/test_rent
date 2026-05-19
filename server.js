import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import router from "./route.js";
import Order from "./v1/modules/order/model/order.model.js";
import { Ticket, Message } from "./v1/modules/customer-support/model/support.model.js";
console.log("Order Model loaded", Order.modelName);
console.log("Support Models loaded", Ticket.modelName, Message.modelName);


const app = express();
app.use(express.urlencoded({ extended: true }));

// middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());

// routes
app.use(router);

// test route
app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

app.get("/api/v1", (req, res) => {
  res.json({ message: "API v1 working ✅" });
});

// start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on port ${env.PORT}`);
    });
  } catch (err) {
    console.error("❌ Server start failed:", err.message);
  }
};

startServer();
