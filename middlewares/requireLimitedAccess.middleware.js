/**
 * @function requireLimitedAccess
 * @desc Middleware qui restreint l'accès aux routes aux :
 *       1. Admins (accès total)
 *       2. Utilisateurs "limited" ayant accès uniquement à leur entreprise via un lien d'invitation
 *       Tout autre rôle reçoit une erreur 403.
 *
 * @param {Object} req - L'objet requête Express, doit contenir `req.user` et `req.params.id`
 * @param {Object} res - L'objet réponse Express
 * @param {Function} next - La fonction next() pour passer au middleware suivant
 *
 * @returns {void} - Appelle `next()` si accès autorisé, sinon renvoie une réponse JSON avec erreur
 * @access Private (Admin ou accès limité à l'entreprise)
 */
function requireLimitedAccess(req, res, next) {
    if (req.user.role === "admin") {
        return next();
    }

    if (req.user.role === "limited") {
        if (req.user.companyId !== req.params.id) {
            return res.status(403).json({
                message: "Accès limité à cette company uniquement",
            });
        }
        return next();
    }

    return res.status(403).json({ message: "Non autorisé" });
}

module.exports = requireLimitedAccess;
