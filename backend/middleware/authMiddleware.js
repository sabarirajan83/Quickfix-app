const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verifies the JWT token and attaches the user to req
const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
  if (!token)
    return res.status(401).json({ message: "Not authorized, no token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    res.status(401).json({ message: "Token failed or expired" });
  }
};

// Only allows admin role through
const adminOnly = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  res.status(403).json({ message: "Admin access only" });
};

module.exports = { protect, adminOnly };
