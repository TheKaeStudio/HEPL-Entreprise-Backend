const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authenticateToken = require("../middlewares/auth.middleware");

/**
 * @route POST /signup
 * @desc Inscrire un nouvel utilisateur
 * @param {string} req.body.name - Nom de l'utilisateur
 * @param {string} req.body.email - Email de l'utilisateur
 * @param {string} req.body.password - Mot de passe
 * @returns {Object} message de confirmation
 * @access Public
 */
router.post("/signup", authController.signup);

/**
 * @route POST /login
 * @desc Connexion d'un utilisateur existant
 * @param {string} req.body.email - Email
 * @param {string} req.body.password - Mot de passe
 * @returns {Object} token JWT et rôle de l'utilisateur
 * @access Public
 */
router.post("/login", authController.login);

/**
 * @route GET /me
 * @desc Récupère les informations de l'utilisateur connecté
 * @returns {Object} userId et rôle
 * @access Private (JWT requis)
 */
router.get("/me", authenticateToken, (req, res) => {
    res.json({
        userId: req.user.userId,
        role: req.user.role,
    });
});

module.exports = router;
