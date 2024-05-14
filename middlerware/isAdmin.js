const User = require("../models/user");

const isAdmin = async (req, res, next) => {
    try {
        const userId = req.user 
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role != 'admin') {
            return res.status(403).send("Access Denied");
        }
        req.user=user._id
        next();
    } catch (err) {
        console.error(err);

        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = isAdmin;
