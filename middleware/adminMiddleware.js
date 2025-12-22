const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Middleware to check if user is an admin
const isAdmin = async (req, res, next) => {
  try {
    // Check if user is authenticated
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Access denied. No token provided." 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId || decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Access denied. User not found." 
      });
    }

    // Check if user is admin
    if (user.role !== "Admin") {
      return res.status(403).json({ 
        success: false,
        message: "Access denied. Admin privileges required." 
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(401).json({ 
      success: false,
      message: "Invalid token or unauthorized access." 
    });
  }
};

module.exports = { isAdmin };
