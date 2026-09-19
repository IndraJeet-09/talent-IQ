import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
    try {
        const { userId } = req.auth() || {};
        if (!userId) return res.status(401).json({ msg: "Unauthorized" });

        const user = await User.findOne({ clerkId: userId });
        if (!user) return res.status(404).json({ msg: "User not found" });

        req.user = user;
        next();
    } catch (error) {
        console.error("Error in protectRoute middleware", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};