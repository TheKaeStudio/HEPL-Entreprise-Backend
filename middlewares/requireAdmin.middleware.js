/**
 * @function requireAdmin
 * @desc Middleware qui vérifie que l'utilisateur connecté a le rôle "admin".
 *       Si ce n'est pas le cas, renvoie une erreur 403.
 *       Sinon, passe au middleware suivant.
 *
 * @param {Object} req - L'objet requête Express, doit contenir `req.user`
 * @param {Object} res - L'objet réponse Express
 * @param {Function} next - La fonction next() pour passer au middleware suivant
 *
 * @returns {void} - Appelle `next()` si l'utilisateur est admin, sinon renvoie une réponse JSON avec erreur
 * @access Private (Admin uniquement)
 */
function requireAdmin(req, res, next) {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin requis" });
    }
    next();
}

module.exports = requireAdmin;
