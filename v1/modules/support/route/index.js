import express from "express";
const router = express.Router();

router.get("/test", (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: "Support module routes are active! 🛠️" 
    });
});

export default router;
