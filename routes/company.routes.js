const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const authenticateToken = require("../middlewares/auth.middleware");
const requireAdmin = require("../middlewares/requireAdmin.middleware");
const requireLimitedAccess = require("../middlewares/requireLimitedAccess.middleware");
const Company = require("../models/Company");

// --- Public Routes --- //

/**
 * @route GET /company
 * @desc Récupère toutes les entreprises
 * @access Public
 */
router.get("/", async (req, res) => {
    try {
        const companies = await Company.find();
        res.json(companies);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

/**
 * @route GET /company/:id
 * @desc Récupère une entreprise par son ID
 * @param {string} req.params.id - L'ID de l'entreprise
 * @access Public
 */
router.get("/:id", async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        
        if(!company) {
            return res.status(404).json({ message: "Company non trouvée" });
        }

        res.json(company);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

/**
 * @route GET /company/access/:key
 * @desc Donne un token d'accès limité via un lien d'invitation
 * @param {string} req.params.key - Clé d'invitation
 * @returns {Object} token JWT
 * @access Public
 */
router.get("/access/:key", async (req, res) => {
    const company = await Company.findOne({ "invite.key": req.params.key });

    if (!company) return res.status(404).send("Lien invalide");

    if (company.invite.used) return res.status(403).send("Lien déjà utilisé");

    const age = Date.now() - new Date(company.invite.createdAt).getTime();
    const ageLimite = 7 * 24 * 60 * 60 * 1000;

    if (age > ageLimite) return res.status(403).send("Lien expiré");

    company.invite.used = true;
    await company.save();

    const token = jwt.sign(
        {
            role: "limited",
            companyId: company._id,
        },
        process.env.JWT_SECRET,
        { expiresIn: "30d" },
    );

    res.json({ token });
});

// --- Admin Routes --- //

/**
 * @route POST /company/:id/give-access
 * @desc Génère un lien d'accès limité pour une entreprise
 * @param {string} req.params.id - L'ID de l'entreprise
 * @returns {Object} link URL pour accéder
 * @access Admin
 */
router.post("/:id/give-access", authenticateToken, async (req, res) => {
    if (req.user.role !== "admin")
        return res.status(403).json({ message: "Non autorisé" });

    const company = await Company.findById(req.params.id);
    if (!company)
        return res.status(404).json({ message: "Entreprise introuvable" });

    const key = crypto.randomBytes(20).toString("hex");

    company.invite = {
        key,
        createdAt: new Date(),
        used: false,
    };

    await company.save();

    // const link = `${process.env.FRONT_URL}/access/${key}`;
    const link = `${process.env.FRONT_URL}/HEPL-Entreprise-Frontend/pages/access.html?key=${key}`;

    res.json({ link });
});


/**
 * @route POST /company
 * @desc Crée une nouvelle entreprise
 * @param {string} req.body.name - Nom de l'entreprise
 * @param {string} req.body.description - Description de l'entreprise
 * @returns {Object} L'entreprise créée
 * @access Admin
 */
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, description } = req.body;
        const company = await Company.create({
            name,
            description,
        });
        res.status(201).json(company);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

/**
 * @route PUT /company/:id
 * @desc Met à jour une entreprise (accès limité ou admin)
 * @param {string} req.params.id - L'ID de l'entreprise
 * @param {string} req.body.name - Nouveau nom
 * @param {string} req.body.description - Nouvelle description
 * @returns {Object} L'entreprise mise à jour
 * @access Limited / Admin
 */
router.put(
    "/:id",
    authenticateToken,
    requireLimitedAccess,
    async (req, res) => {
        try {
            const { name, description } = req.body;

            const company = await Company.findByIdAndUpdate(
                req.params.id,
                { name, description },
                { returnDocument: "after" },
            );

            if (!company) {
                return res
                    .status(404)
                    .json({ message: "Entreprise introuvable" });
            }

            res.json(company);
        } catch (err) {
            res.status(500).json({ message: "Erreur serveur" });
        }
    },
);

/**
 * @route DELETE /company/:id
 * @desc Supprime une entreprise
 * @param {string} req.params.id - L'ID de l'entreprise
 * @returns {Object} Message de confirmation
 * @access Admin
 */
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
        const deleted = await Company.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: "Entreprise introuvable" });
        }

        res.json({ message: "Entreprise supprimée" });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router;
