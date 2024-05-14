const jwt = require('jsonwebtoken');

// Middleware function to verify JWT token
const isAuthenticate = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        req.user = false;
        return next();
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            res.clearCookie("token");
            req.user = false;
            return next();
        } else {
            
            req.user = user.userId
            return next();
        }
    });
}

module.exports = isAuthenticate;
