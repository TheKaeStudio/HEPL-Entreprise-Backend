/**
 * @file server.js
 * @desc Point d'entrée de l'application Express.
 *       - Charge les variables d'environnement
 *       - Connecte à la base de données
 *       - Configure le middleware CORS et JSON
 *       - Monte les routes API (auth et companies)
 *       - Gère les erreurs 404 et 500
 *       - Démarre le serveur sur le port défini dans .env ou 3000 par défaut
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/companies", require("./routes/company.routes"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server launched on port ${PORT}`);
});

// Middleware 404
app.use((req, res) => {
    res.status(404).json({ message: "Route introuvable" });
});

// Middleware erreur 500
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Erreur serveur interne" });
});
