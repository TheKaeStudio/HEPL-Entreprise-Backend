// Me permet de ne donner l'accès qu'aux admins et aux entreprises (connectés grâce à un lien à usage unique)
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
