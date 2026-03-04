require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(
    cors(),
);
app.use(express.json());

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/companies", require("./routes/company.routes"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server launched on port ${PORT}`);
});

app.use((req, res) => {
    res.status(404).json({ message: "Route introuvable" });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Erreur serveur interne" });
});
