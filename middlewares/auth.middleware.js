const jwt = require("jsonwebtoken");

/**
 * @function authenticateToken
 * @desc Middleware qui vérifie si la requête contient un JWT valide.
 *       Si le token est présent et correct, attache l'objet `user` à `req.user`.
 *       Sinon, renvoie une erreur 401 ou 403.
 * 
 * @param {Object} req - L'objet requête Express
 * @param {Object} req.headers.authorization - Le header "Authorization" contenant "Bearer <token>"
 * @param {Object} res - L'objet réponse Express
 * @param {Function} next - La fonction next() pour passer au middleware suivant
 * 
 * @returns {void} - Appelle `next()` si token valide, sinon renvoie une réponse JSON avec erreur
 * @access Private (requiert un JWT)
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token manquant" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res
                .status(403)
                .json({ message: "Token invalide ou expiré" });
        }
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
