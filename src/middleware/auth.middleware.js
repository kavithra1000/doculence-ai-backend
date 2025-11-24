import jwt from "jsonwebtoken";
import User from "../model/user.model.js"

export const protectedRoute = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log(decoded)
        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.user = await User.findById(decoded.userId).select("-password");


        if (!req.user) {
            
            return res.status(401).json({ message: "Unauthorized" });
        }
        next();
    } catch (error) {
        console.error("Error verifying token:", error);
        res.status(401).json({ message: "Unauthorized" });
    }
}