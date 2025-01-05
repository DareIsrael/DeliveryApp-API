const reviewMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ success: false, message: "No token, authorization denied" });
    }

    try {
        const decoded = jwtDecode(token); // Assuming the token contains the userId
        req.body.userId = decoded.id; // Attach userId to the request object
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

module.exports = { reviewMiddleware };
