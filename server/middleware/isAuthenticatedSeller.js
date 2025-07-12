
const jwt = require("jsonwebtoken");

const isAuthenticatedSeller = async (req, res, next) => {
  try {
    const token_seller= req.cookies.token_seller;
    if (!token_seller) {
      return res.status(401).json({ message: "Seller not authenticated" });
    }

    const decode = await jwt.verify(token_seller, process.env.JWT_SECRET_KEY_seller);
    if (!decode) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.seller_id = decode.seller_id;
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Auth middleware error" });
  }
};

module.exports = isAuthenticatedSeller;
