const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email déjà utilisé" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        console.log("Utilisateur créé : ", name, " ", email);
        res.status(201).json({ message: "Utilisateur créé" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Identifiants invalides" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Identifiants invalides" });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" },
        );

        res.json({ token, role: user.role });

        const ip =
            req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        console.log(`Utilisateur connecté : ${email} - IP : ${ip}`);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};
