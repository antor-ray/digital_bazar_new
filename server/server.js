const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const jwt = require("jsonwebtoken");

const db = require("./db");
const { message } = require("statuses");
const isAuthenticated = require("./middleware/isAuthenticated");

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query(
      "SELECT * FROM customer WHERE email = $1 AND password = $2",
      [email, password]
    );

    // if (result.rows.length > 0) {
    //   res.status(200).json({ customer: result.rows[0] });
    //   console.log("Login successful:", result.rows[0].customer_id);
    // } else {
    if (result.rows.length <= 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    let tokenData = {
      customer_id: result.rows[0].customer_id,
    };
    // const newTokenData == append role here and pass it into jwt

    const secretkey = process.env.JWT_SECRET_KEY;
    const token = jwt.sign(tokenData, secretkey, { expiresIn: "1d" });

    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        customer: result.rows[0],
        token: token,
      });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
  });
  res.json({ message: "Logged out successfully" });
});

app.get("/isAuthenticate", isAuthenticated, async (req, res) => {
  res.json({ message: "You are logged in", customer_id: req.customer_id });
});

app.post("/register", async (req, res) => {
  try {
    const {
      email,
      customer_name,
      password,
      city,
      region,
      detail_address,
      phone_number,
    } = req.body;

    if (
      !email ||
      !customer_name ||
      !password ||
      !city ||
      !region ||
      !detail_address ||
      !phone_number
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newCustomer = await db.query(
      "INSERT INTO customer (email, customer_name, password, city, region, detail_address, phone_number) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [
        email,
        customer_name,
        password,
        city,
        region,
        detail_address,
        phone_number,
      ]
    );

    res
      .status(201)
      .json({
        message: "Customer registered successfully",
        customer: newCustomer.rows[0],
      });
  } catch (err) {
    console.error("Error registering customer:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/v1/products", async (req, res) => {
  try {
    const results = await db.query(
      "SELECT * FROM product p JOIN sell s ON p.product_id = s.product_id JOIN image i ON p.product_id = i.product_id;"
    );
    res.json({
      status: "success",
      products: results.rows,
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/api/v1/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      "SELECT * FROM product p JOIN sell s ON p.product_id = s.product_id JOIN image i ON p.product_id = i.product_id WHERE p.product_id = $1",
      [id]
    );

    res.status(200).json({ product: result.rows[0] });
    //console.log(result.rows[0]);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ message: "Error fetching product" });
  }
});

app.get("/cartItems", isAuthenticated, async (req, res) => {
  try {
    const customer_id = req.customer_id;
    console.log(customer_id);
    const cartResult = await db.query(
      "select cart_id from customer where customer_id=$1",
      [customer_id]
    );
    if (cartResult.rows.length == 0) {
      return res
        .status(400)
        .json({ message: "Cart not found for this customer" });
    }
    const cart_id = cartResult.rows[0].cart_id;

    const results = await db.query(
      "SELECT * FROM product p join sell s on(p.product_id=s.product_id) WHERE p.product_id IN (SELECT product_id FROM cart_item WHERE cart_id = $1)",
      [cart_id]
    );
    res.json({
      status: "success",
      items: results.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

app.post("/add_to_cart", isAuthenticated, async (req, res) => {
  const { product_id } = req.body;
  const customer_id = req.customer_id;
  console.log(customer_id);
  try {
    const cartResult = await db.query(
      "select cart_id from customer where customer_id=$1",
      [customer_id]
    );
    if (cartResult.rows.length == 0) {
      return res
        .status(400)
        .json({ message: "Cart not found for this customer" });
    }
    const cart_id = cartResult.rows[0].cart_id;

    await db.query("insert into cart_item(product_id,cart_id) values($1,$2)", [
      product_id,
      cart_id,
    ]);
    res.status(200).json({ message: "Added to cart" });
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ message: "Failed to add to cart" });
  }
});

app.get("/api/v1/paymentMethods", async (req, res) => {
  try {
    const results = await db.query("select payment_method from payment_method");

    res.json({
      status: "success",
      methods: results.rows,
    });
    console.log(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

app.post("/orderItems", async (req, res) => {});

app.get("/categoryProducts/:categoryName", async (req, res) => {
  const categoryName = req.params.categoryName;

  try {
    const results = await db.query(
      `SELECT * 
       FROM product p 
       JOIN category c ON p.category_id = c.category_id 
       join sell s on p.product_id=s.product_id
       join image i on i.product_id=p.product_id
       WHERE c.category_name = $1`,
      [categoryName]
    );

    //console.log(results.rows);
    res.json({
      status: "success",
      products: results.rows,
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ status: "error", message: "Database query failed" });
  }
});

// for reviews ---------------------------------------------------------------------

app.post("/api/v1/products/:id/reviews", isAuthenticated, async (req, res) => {
  const productId = parseInt(req.params.id);
  const { rating, comment } = req.body;
  const customerId = req.customer_id; // from middleware

  if (!rating || !comment) {
    return res.status(400).json({ error: "Rating and comment are required" });
  }

  try {
    // Check if the customer already reviewed this product
    const existingReview = await db.query(
      `SELECT * FROM review WHERE product_id = $1 AND customer_id = $2`,
      [productId, customerId]
    );

    if (existingReview.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "You have already reviewed this product." });
    }

    // Insert the new review
    await db.query(
      `INSERT INTO review (customer_id, product_id, description, date, rating)
       VALUES ($1, $2, $3, CURRENT_DATE, $4)`,
      [customerId, productId, comment, rating]
    );

    res.status(201).json({ message: "Review submitted successfully" });
  } catch (err) {
    console.error("Error inserting review:", err);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

app.get("/api/v1/products/:id/reviews", async (req, res) => {
  const productId = parseInt(req.params.id);

  try {
    const result = await db.query(
      `SELECT r.review_id, r.customer_id, r.product_id, r.description, r.date, r.rating,
              c.customer_name
       FROM review r
       JOIN customer c ON r.customer_id = c.customer_id
       WHERE r.product_id = $1
       ORDER BY r.date DESC`,
      [productId]
    );
    //console.log(result.rows);
    res.status(200).json({ reviews: result.rows });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});


/// add to WishList-------------------------------------------------------------------
app.post("/add_to_wishlist", isAuthenticated, async (req, res) => {
  const { product_id } = req.body;
  const customer_id = req.customer_id;
  console.log(customer_id);
  try {
    const wishListResult = await db.query(
      "select wishlist_id from customer where customer_id=$1",
      [customer_id]
    );
    if (wishListResult.rows.length == 0) {
      return res
        .status(400)
        .json({ message: "wishlist not found for this customer" });
    }
    const wishlist_id = wishListResult.rows[0].wishlist_id;

    await db.query("insert into wish_item(product_id, wishlist_id) values($1,$2)", [
      product_id,
      wishlist_id,
    ]);
    console.log(product_id);
    res.status(200).json({ message: "Added to wishList" });
  } catch (err) {
    console.error("Error adding to wishlist:", err);
    res.status(500).json({ message: "Failed to add to wishList" });
  }
});


// wishlist items fetching-------------------------------

app.get("/api/v1/wishlist", isAuthenticated, async (req, res)=>{
  const customerId = req.customer_id;
  console.log(customerId);
  
    try {
    const result = await db.query(
      `SELECT 
         p.product_id, 
         p.product_name, 
         p.short_des, 
         i.image_url
       FROM product p
       JOIN wish_item w ON p.product_id = w.product_id
       JOIN image i ON i.product_id = p.product_id
       WHERE w.wishlist_id = $1`,
       [customerId]
    );
    
    console.log(result.rows);
    res.status(200).json({ items: result.rows });
  } catch (err) {
    console.error("Error fetching wishlist:", err);
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
})




const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running and listening on port ${port}`);
});
