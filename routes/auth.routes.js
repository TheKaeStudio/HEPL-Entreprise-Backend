const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authenticateToken = require("../middlewares/auth.middleware");

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.get("/me", authenticateToken, (req, res) => {
    res.json({
        userId: req.user.userId,
        role: req.user.role,
    });
});

module.exports = router;
