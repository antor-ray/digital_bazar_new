
const jwt = require("jsonwebtoken");

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const decode = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decode) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.customer_id = decode.customer_id;
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Auth middleware error" });
  }
};

module.exports = isAuthenticated;
