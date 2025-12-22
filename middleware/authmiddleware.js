const jwt = require("jsonwebtoken");

function auth(req, res, next) {
    const authHeader = req.header("Authorization");
    if (!authHeader) return res.status(401).json({ message: "No token, access denied" });

    // Support both raw token and standard "Bearer <token>"
    const parts = authHeader.split(" ");
    const token = parts.length === 2 && /^Bearer$/i.test(parts[0]) ? parts[1] : authHeader;

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        // Support both 'id' and 'userId' from JWT payload for compatibility
        req.user = {
            id: verified.userId || verified.id,
            userId: verified.userId || verified.id,
            ...verified
        };
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid token" });
    }
}

module.exports = auth;
