const adminMiddleware = (requiredRole) => {
    return (req, res, next) => {
        if (req.body.role !== requiredRole) {
            return res.json({
                success: false,
                message: "Access denied. Insufficient permissions.",
            });
        }
        next();
    };
};

module.exports = { adminMiddleware };
