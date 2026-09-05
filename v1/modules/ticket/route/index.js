import { Router } from "express";
import ticketRoute from "./ticket.route.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "Ticket route working Good ✅" });
});

router.use("/web", ticketRoute);
router.use("/app", ticketRoute);

export default router;
