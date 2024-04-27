import jwt from "jsonwebtoken";
import User from "../Models/user.js";

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, "secretKey");
    console.log(decoded);
    req.userId = decoded.id;
    console.log(req.userId);
    const senderDetails = await User.findById(decoded.userId)
      .select("name email")
      .lean();
    req.sender = senderDetails;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

export { authMiddleware };
