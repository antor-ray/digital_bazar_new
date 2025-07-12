const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");
const bodyParser = require("body-parser");
const SSLCommerzPayment = require('sslcommerz-lts');


const path = require("path");

const db = require("./db");
const { message } = require("statuses");
const isAuthenticated = require("./middleware/isAuthenticated");
const isAuthenticatedSeller = require("./middleware/isAuthenticatedSeller");

//   
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

const cookieParser = require("cookie-parser");
const isAuthenticatedDeliveryMan = require("./middleware/isAuthenticatedDeliveryMan");
const authorizeRoles = require("./middleware/authorizeRoles");
const { rejects } = require("assert");
const status = require("statuses");
app.use(cookieParser());

app.use("/images", express.static(path.join(__dirname, "/images")));


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
       role: 'customer',
    };
    // const newTokenData == append role here and pass it into jwt
   // console.log(result.rows);
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
  res.json({ message: "You are logged in", customer_id:req.user.customer_id});
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

    res.status(201).json({
      message: "Customer registered successfully",
      customer: newCustomer.rows[0],
    });
  } catch (err) {
    console.error("Error registering customer:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//customer profile

app.get("/api/customer/profile", isAuthenticated, authorizeRoles('customer'), async (req, res) => {
  const customerId = req.user.customer_id;
  console.log(customerId);
  try {
    const results = await db.query(
      `SELECT email, customer_name, password, city, region, detail_address, phone_number
        FROM customer
        WHERE customer_id = $1`,
      [customerId]
    );


    res.json({
      status: "success",
      customer: results.rows,
    });
  } catch (err) {
    console.log(err);
  }
});

app.put('/api/customer/profile', isAuthenticated, authorizeRoles('customer'), async (req, res) => {
  const customerId = req.user.customer_id;
  const {
    email,
    customer_name,
    password,
    city,
    region,
    detail_address,
    phone_number
  } = req.body;
  try {
    await db.query(
      `UPDATE customer
       SET email = $1,
           customer_name = $2,
           password = $3,
           city = $4,
           region = $5,
           detail_address = $6,
           phone_number = $7
       WHERE customer_id = $8`,
      [email, customer_name, password, city, region, detail_address, phone_number, customerId]
    );
    res.status(200).json({ message: 'Customer profile updated successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//customer notification
// app.get("/api/notifications", isAuthenticated, authorizeRoles('customer'), async (req, res) => {
//   const customer_id = req.user.customer_id;

//   const result = await db.query(
//     `SELECT * FROM notification
//      WHERE user_id = $1 AND user_type = 'CUSTOMER'
//      ORDER BY created_at DESC`,
//     [customer_id]
//   );
//   // console.log(customer_id);
//   res.json({ notifications: result.rows });
// });

app.get( "/api/notifications",isAuthenticated,authorizeRoles("customer"),
  async (req, res) => {
    try {
      const customer_id = req.user.customer_id;

      const result = await db.query(
        `SELECT * FROM notification
         WHERE user_id = $1 AND user_type = 'CUSTOMER'
         ORDER BY created_at DESC`,
        [customer_id]
      );

      res.json({ notifications: result.rows });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);


//Delivery Man Login
app.post("/DeliveryManlogin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query(
      "SELECT * FROM delivery_man WHERE email = $1 AND password = $2",
      [email, password]
    );
    // console.log(result.rows[0]);
    if (result.rows.length <= 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    let tokenData = {
      deliveryMan_id: result.rows[0].id,
      role: 'deliveryMan'
    };

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
        deliveryMan: result.rows[0],
        token: token,
      });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/deliveryman/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
  });
  res.json({ message: "Logged out successfully" });
});

app.get("/isAuthenticateDeliveryMan", isAuthenticatedDeliveryMan, async (req, res) => {
  res.json({ message: "You are logged in", deliveryMan_id: req.deliveryMan_id });
});

app.post("/registerDeliveryMan", async (req, res) => {
  try {
    const {
      name,
      email,
      phone_number,
      region,
      city,
      password
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !phone_number ||
      !region ||
      !city
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newCustomer = await db.query(
      "INSERT INTO delivery_man (name,email,phone_number,region,city,password) VALUES ($1, $2, $3, $4, $5,$6) RETURNING *",
      [
        name,
        email,
        phone_number,
        region,
        city,
        password
      ]
    );

    res
      .status(201)
      .json({
        message: "Delivery Man registered successfully",
        customer: newCustomer.rows[0],
      });
  } catch (err) {
    console.error("Error registering Delivery man:", err);
    res.status(500).json({ message: "Server error" });
  }
});


//delivery man profile

app.get("/api/deliveryman/profile", isAuthenticated, authorizeRoles('deliveryMan'), async (req, res) => {
  const deliveryManId = req.user.deliveryMan_id;
  try {
    const results = await db.query(
      `SELECT email, name, password, city, region, phone_number
         FROM delivery_man
         WHERE id = $1`,
      [deliveryManId]
    );

    res.json({
      status: "success",
      deliveryMan: results.rows,
    });
  } catch (err) {
    console.error('Error fetching delivery man profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
);

//edit delivery man profile

app.put("/api/deliveryman/profile", isAuthenticated, authorizeRoles('deliveryMan'), async (req, res) => {
  const deliveryManId = req.user.deliveryMan_id;
  const {
    email,
    name,
    password,
    city,
    region,
    phone_number
  } = req.body;

  try {
    await db.query(
      `UPDATE delivery_man
         SET email = $1,
             name = $2,
             password = $3,
             city = $4,
             region = $5,
             phone_number = $6
         WHERE id = $7`,
      [email, name, password, city, region, phone_number, deliveryManId]
    );

    res.status(200).json({ message: "Delivery man profile updated successfully" });
  } catch (err) {
    console.error('Error updating delivery man profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
);




app.get("/api/v1/products", async (req, res) => {
  try {
    const results = await db.query(
      `SELECT p.*, s.*, i.image_url
FROM product p
JOIN sell s ON p.product_id = s.product_id
JOIN (
    SELECT DISTINCT ON (product_id)
        product_id, image_url
    FROM image
    ORDER BY product_id ASC, image_id
) i ON p.product_id = i.product_id;`);
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
    // Fetch product + seller info
    const productResult = await db.query(
      `SELECT 
         p.*, 
         s.seller_id,s.selling_price, s.actual_price, s.discount, s.stock, 
         sr.business_name AS seller_name,
         sr.phone_number
       FROM product p
       JOIN sell s ON p.product_id = s.product_id
       JOIN seller sr ON s.seller_id = sr.seller_id
       WHERE p.product_id = $1`,
      [id]
    );

    // Fetch all image URLs for the product
    const imageResult = await db.query(
      `SELECT image_url FROM image WHERE product_id = $1`,
      [id]
    );

    const product = productResult.rows[0];
    product.images = imageResult.rows.map((row) => row.image_url); // attach images array

    res.status(200).json({ product });
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ message: "Error fetching product" });
  }
});



app.get("/cartItems", isAuthenticated, async (req, res) => {
  try {
    const customer_id = req.user.customer_id;
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
  const customer_id = req.user.customer_id;
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



//transfer products from cart to order_items

app.post("/transfer/item", isAuthenticated, authorizeRoles('customer'), async (req, res) => {
  const customerId = req.user.customer_id;
  const { orderId } = req.body;
  console.log(orderId);
  try {
    // Step 1: Get the cart_id for this customer
    const cartResult = await db.query(
      `SELECT cart_id FROM customer WHERE customer_id = $1`,
      [customerId]
    );
    const cart_id = cartResult.rows[0].cart_id;
    console.log("cart");
    // Step 2: Transfer items from cart_item to order_item
    await db.query(
      `INSERT INTO order_item (product_id, order_id)
       SELECT product_id, $1
       FROM cart_item
       WHERE cart_id = $2`,
      [orderId, cart_id]
    );

    console.log("next");

    await db.query(
      `DELETE FROM cart_item WHERE cart_id = $1`,
      [cart_id]
    );

    res.status(200).json({ message: "Items transferred to order successfully" });

  } catch (err) {
    console.error("Error during item transfer:", err);
    res.status(500).json({ message: "Failed to transfer items" });
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
  const customerId = req.user.customer_id; // from middleware

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
  const customer_id = req.user.customer_id;
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

    await db.query(
      "insert into wish_item(product_id, wishlist_id) values($1,$2)",
      [product_id, wishlist_id]
    );
    console.log(product_id);
    res.status(200).json({ message: "Added to wishList" });
  } catch (err) {
    console.error("Error adding to wishlist:", err);
    res.status(500).json({ message: "Failed to add to wishList" });
  }
});

// wishlist items fetching-------------------------------

app.get("/api/v1/wishlist", isAuthenticated, async (req, res) => {
  const customerId = req.user.customer_id;
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
});

///seller login----------------------------------------------------

app.post("/SellerLogin", async (req, res) => {
  const { email, password } = req.body;

  // Basic input validation
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required." });
  }
  

  try {
    const result = await db.query(
      "SELECT * FROM seller WHERE email = $1 AND password = $2",
      [email, password]
    );

    if (result.rows.length <= 0) {
      // User not found
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    }

    let tokenData_seller = {
      seller_id: result.rows[0].seller_id,
    };
    // const newTokenData == append role here and pass it into jwt
    console.log(result.rows);

    const secretkey_seller = process.env.JWT_SECRET_KEY_seller;
    const token_seller = jwt.sign(tokenData_seller, secretkey_seller, { expiresIn: "1d" });
    console.log('hello');
    return res
      .cookie("token_seller", token_seller, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        seller: result.rows[0],
        token_seller: token_seller,
      });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/isAuthenticatedSeller", isAuthenticatedSeller, async (req, res) => {
  const sellerId = req.seller_id;  // ✅ use const
  try {
    const result = await db.query(
      `SELECT * FROM seller WHERE seller_id = $1`,
      [sellerId]  // ✅ correct parameter format
    );

    const seller = result.rows[0];
    res.json({
      message: "You are logged in",
      seller_id: sellerId,
      sellerName: seller.business_name,
      
      
    });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



app.post("/SellerRegister", async (req, res) => {

   const {
    email,
    password,
    business_name,
    about ="",
    phone_number,
    address
  } = req.body;

  // Basic validation
  if (!email || !password || !business_name || !phone_number || !address || !about) {
    return res.status(400).json({
      success: false,
      message: "All required fields must be filled."
    });
  }

  try {
    // Check for duplicate email
    const existing = await db.query("SELECT * FROM seller WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Seller already registered with this email."
      });
    }

    // Insert new seller
    const result = await db.query(
      `INSERT INTO seller (email, password, business_name, about, phone_number, address)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [email, password, business_name, about, phone_number, address]
    );

    res.status(201).json({
      success: true,
      message: "Seller registered successfully.",
      seller: result.rows[0]
    });

  } catch (err) {
    console.error("Seller registration error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while registering seller."
    });
  }
});


///  product adding -----------------------------------------------


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null,path.join(__dirname,  "images")),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});
const upload = multer({ storage });

// Add Product with 4 images
app.post("/SellerPage/addProduct", isAuthenticatedSeller, upload.array("images", 4), async (req, res) => {
  try {
    const {
      name, category, price, discount, stock,
      details, short_des, tags
    } = req.body;

    // 1. Get category_id from name
    const categoryRes = await db.query(
      "SELECT category_id FROM category WHERE category_name = $1",
      [category]
    );
    if (categoryRes.rowCount === 0) return res.json({ success: false, message: "Invalid category" });

    const category_id = categoryRes.rows[0].category_id;

    // 2. Insert product
    const productRes = await db.query(
      `INSERT INTO product (
         category_id, product_name, product_details, tags, short_des
       ) VALUES ($1, $2, $3, $4, $5) RETURNING product_id`,
      [category_id, name, details, tags, short_des]
    );
    const product_id = productRes.rows[0].product_id;
    const seller_id = req.seller_id;

    // 3. Insert into sell
    await db.query(`
      INSERT INTO sell(
      seller_id, product_id, sell_date, actual_price, discount, selling_price, stock) VALUES
      ($1, $2, CURRENT_DATE, $3, $4, $5, $6)`, [seller_id, product_id, price, discount, (price - price*(discount/100)), stock]
    );
    console.log("inserted in sell table successfully");

    // 4. Insert images (4 max)
    const imageUrls = [];
    const imageInserts = req.files.map(file => {
      const imageUrl = `${file.filename}`;
      imageUrls.push(`http://localhost:4000/images/${imageUrl}`);
      return db.query("INSERT INTO image (product_id, image_url) VALUES ($1, $2)", [
        product_id,
        imageUrl,
      ]);
    });     
    await Promise.all(imageInserts);
    console.log("image is inserted: ",imageUrls);

    // 5. Return the complete product object that matches frontend expectations
    const newProduct = {
      id: product_id,
      name: name,
      category: category,
      price: parseFloat(price),
      discount: parseFloat(discount),
      stock: parseInt(stock),
      status: parseInt(stock) > 0 ? 'Active' : 'Out of Stock',
      images: imageUrls,
      details: details,
      short_des: short_des,
      tags: tags,
    };

    res.json({ 
      success: true, 
      product_id,
      product: newProduct 
    });
    console.log(newProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

//////// update product details ____________________________________-
app.put(
  "/SellerPage/updateProduct/:id",
  isAuthenticatedSeller,
  upload.array("images", 4),
  async (req, res) => {
    const product_id = req.params.id;
    const {
      name,
      category,
      price,
      discount,
      stock,
      details,
      short_des,
      tags,
    } = req.body;

    try {
      // 1. Get category_id from category name
      const catRes = await db.query(
        "SELECT category_id FROM category WHERE category_name = $1",
        [category]
      );
      if (catRes.rowCount === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid category" });
      }
      const category_id = catRes.rows[0].category_id;

      // 2. Update product table
      await db.query(
        `UPDATE product SET 
          category_id = $1,
          product_name = $2,
          product_details = $3,
          tags = $4,
          short_des = $5
        WHERE product_id = $6`,
        [category_id, name, details, tags, short_des, product_id]
      );

      // 3. Update sell table
      await db.query(
        `UPDATE sell SET 
          actual_price = $1,
          discount = $2,
          selling_price = $3,
          stock = $4
        WHERE product_id = $5`,
        [
          price,
          discount,
          price - price * (discount / 100),
          stock,
          product_id,
        ]
      );

      // 4. Handle new images only — delete all old images
      const existingImagesRes = await db.query(
        "SELECT image_url FROM image WHERE product_id = $1",
        [product_id]
      );
      const existingImages = existingImagesRes.rows.map((row) => row.image_url);

      for (const imgUrl of existingImages) {
        await db.query(
          "DELETE FROM image WHERE product_id = $1 AND image_url = $2",
          [product_id, imgUrl]
        );

        const imagePath = path.join(__dirname, "images", imgUrl);
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error("Failed to delete image file:", imagePath, err);
          }
        });
      }

      // 5. Save new uploaded images
      const newUploadedImages = req.files.map((file) => `${file.filename}`);

      for (const img of newUploadedImages) {
        await db.query(
          "INSERT INTO image (product_id, image_url) VALUES ($1, $2)",
          [product_id, img]
        );
      }

      // 6. Respond
      res.json({
        success: true,
        message: "Product updated successfully",
        product_id,
        images: newUploadedImages.map(
          (img) => `http://localhost:4000/images/${img}`
        ),
      });
    } catch (err) {
      console.error("Error updating product:", err);
      res
        .status(500)
        .json({ success: false, message: "Server error during update" });
    }
  }
);

// NEW ENDPOINT: Fetch products for the authenticated seller
app.get("/SellerPage/products", isAuthenticatedSeller, async (req, res) => {
  try {
    const seller_id = req.seller_id; // Get seller_id from the isAuthenticatedSeller middleware

    if (!seller_id) {
      return res.status(401).json({ status: "error", message: "Seller not authenticated." });
    }

    const results = await db.query(
      `SELECT
          p.product_id AS id, -- Alias product_id to 'id' for frontend consistency
          p.product_name AS name,
          p.product_details AS details, -- Alias product_details to 'description'
          p.tags,
          p.short_des,
          c.category_name AS category, -- Get category name
          s.seller_id,
          s.sell_date,
          s.actual_price AS price,
          s.discount,
          s.selling_price,
          s.stock,
          (SELECT ARRAY_AGG(i.image_url) FROM image i WHERE i.product_id = p.product_id) AS images
          FROM product p
       JOIN sell s ON p.product_id = s.product_id
       JOIN category c ON p.category_id = c.category_id
       WHERE s.seller_id = $1
       ORDER BY p.product_id DESC;`, // Order by latest products first
      [seller_id]
    );
    
    res.json({
      status: "success",
      products: results.rows,
    });
  } catch (err) {
    console.error("Error fetching seller-specific products:", err);
    res.status(500).json({ status: "error", message: "Server error fetching seller products." });
  }
});



// DELETE /SellerPage/deleteProduct/:id
app.delete("/SellerPage/deleteProduct/:id", isAuthenticatedSeller, async (req, res) => {
  const productId = req.params.id;
  const seller_id = req.seller_id;

  if (!seller_id) {
    return res.status(401).json({ success: false, message: "Unauthorized seller." });
  }

  try {
    await db.query("BEGIN");

    // Check if product exists and belongs to seller
    const checkProduct = await db.query(
      "SELECT * FROM sell WHERE product_id = $1 AND seller_id = $2",
      [productId, seller_id]
    );

    if (checkProduct.rowCount === 0) {
      await db.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Product not found or unauthorized." });
    }

    // 1. Get image filenames from the DB
    const imageResult = await db.query(
      "SELECT image_url FROM image WHERE product_id = $1",
      [productId]
    );

    const imagePaths = imageResult.rows.map(row =>
      path.join(__dirname, "images", row.image_url)
    );

    // 2. Delete image records from DB
    await db.query("DELETE FROM image WHERE product_id = $1", [productId]);

    // 3. Delete files from disk
    imagePaths.forEach((imgPath) => {
      fs.unlink(imgPath, (err) => {
        if (err) console.warn("Failed to delete image file:", imgPath, err.message);
      });
    });

    // 4. Delete sell and product entries
    
    await db.query("DELETE FROM wish_item WHERE product_id = $1", [productId]);
    await db.query("DELETE FROM cart_item WHERE product_id = $1", [productId]);
    await db.query("DELETE FROM order_item WHERE product_id = $1", [productId]);
    await db.query("DELETE FROM sell WHERE product_id = $1 AND seller_id = $2", [productId, seller_id]);
    await db.query("DELETE FROM product WHERE product_id = $1", [productId]);
    await db.query("DELETE FROM review WHERE product_id = $1", [productId]);
    await db.query("COMMIT");

    res.json({ success: true, message: "Product and images deleted successfully." });
  } catch (err) {
    await db.query("ROLLBACK");
    console.error("Error deleting product:", err);
    res.status(500).json({ success: false, message: "Server error while deleting product." });
  }
});

// seller info fetching

app.get("/SellerProfile", isAuthenticatedSeller, async (req, res) => {
  try {
    const seller_id = req.seller_id;
    const result = await db.query(
      "SELECT email, business_name, about, phone_number, address FROM seller WHERE seller_id = $1",
      [seller_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.json({ seller: result.rows[0] });
    console.log(result.rows[0]);
  } catch (err) {
    console.error("Error fetching seller profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});


///seller profile update _-------------------
app.put('/SellerEditProfile', isAuthenticatedSeller, async (req, res) => {
  const { email, business_name, about, phone_number, address } = req.body;
  const sellerId = req.seller_id;

  // Check for any missing fields
  if (!email || !business_name || !about || !phone_number || !address) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  try {
    await db.query(
      `UPDATE seller
       SET email = $1, business_name = $2, about = $3, phone_number = $4, address = $5 
       WHERE seller_id = $6`,
      [email, business_name, about, phone_number, address, sellerId]
    );

    res.json({ success: true, message: 'Seller profile updated' });
  } catch (error) {
    console.error('Error updating seller profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// seller password edit

app.put("/SellerEditPassword", isAuthenticatedSeller, async (req, res) => {
  try {
    const seller_id = req.seller_id;
    const { currentPassword, newPassword } = req.body;

    // Get current password from DB
    const result = await db.query(
      "SELECT password FROM seller WHERE seller_id = $1",
      [seller_id]
    );
    console.log(result);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    const storedPassword = result.rows[0].password;

    if (currentPassword !== storedPassword) {
      return res.status(401).json({ success: false, message: "Incorrect current password" });
    }

    // Update with new password (in plain text)
    await db.query(
      "UPDATE seller SET password = $1 WHERE seller_id = $2",
      [newPassword, seller_id]
    );

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



//order and delivery details:


app.post("/api/orders", isAuthenticated, async (req, res) => {
  const { address, grandTotal, paymentMethod } = req.body;
  const customerId = req.user.customer_id;

  try {
    await db.query("BEGIN"); // Start transaction

    const parts = [address.city, address.region, address.roadSector];
    const fullAddress = parts.filter(Boolean).join(", ");

    // Insert into customer_order
    const orderInsert = await db.query(
      `INSERT INTO customer_order (customer_id, date, total_cost, address)
       VALUES ($1, CURRENT_DATE, $2, $3) RETURNING order_id`,
      [customerId, grandTotal, fullAddress]
    );
    const orderId = orderInsert.rows[0].order_id;

    // Get payment method ID
    const paymentMethodResult = await db.query(
      `SELECT id FROM payment_method WHERE payment_method = $1`,
      [paymentMethod]
    );
    const paymentMethodId = paymentMethodResult.rows[0].id;

    // Insert into payment
    await db.query(
      `INSERT INTO payment(order_id, status, amount, payment_date, payment_method_id) 
       VALUES ($1, 'PENDING', $2, CURRENT_DATE, $3)`,
      [orderId, grandTotal, paymentMethodId]
    );

    await db.query("COMMIT");
    res.json({ success: true, orderId });
  } catch (err) {
    await db.query("ROLLBACK");
    console.error("Order error:", err);
    res.status(500).json({ success: false, error: "Order placement failed." });
  }
});


app.post("/deliveryman/sendproposal", isAuthenticated, async (req, res) => {
  const { address, orderId } = req.body;

  try {
    const region = address.region;

    // console.log(region);

    // 1. Find deliverymen in that region
    const deliverymen = await db.query(
      `SELECT id FROM delivery_man WHERE region = $1`,
      [region]
    );

    if (deliverymen.rowCount === 0) {
      return res.status(404).json({ success: false, error: "No delivery men found in this region." });
    }

    // 2. Send proposals to each deliveryman
    for (const d of deliverymen.rows) {
      const deliverymanId = d.id;

      await db.query(
        `INSERT INTO delivery_proposal (delivery_man_id, order_id, status, proposal_time)
         VALUES ($1, $2, 'PENDING', CURRENT_TIMESTAMP)`,
        [deliverymanId, orderId]
      );
    }

    res.json({ success: true, message: "Proposal sent to deliverymen." });
  } catch (err) {
    console.error("Send proposal error:", err);
    res.status(500).json({ success: false, error: "Failed to send proposals." });
  }
});



//Deliveryman Backend Routes
app.get("/proposal", isAuthenticated, async (req, res) => {
  const deliveryManId = req.user.deliveryMan_id;

  try {
    const result = await db.query(
      `SELECT p.order_id, o.address, o.total_cost, p.status
       FROM delivery_proposal p
       JOIN customer_order o ON p.order_id = o.order_id
       WHERE p.delivery_man_id = $1
       ORDER BY p.proposal_time DESC`,
      [deliveryManId]
    );

    console.log(result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching proposal:", err);
    res.status(500).json({ error: "Failed to load proposals" });
  }
});

app.post("/respond", isAuthenticated, async (req, res) => {
  const { orderId, response } = req.body;
  const deliveryManId = req.user.deliveryMan_id;

  try {

    // Update accepted proposal
    await db.query(
      `UPDATE delivery_proposal
       SET status = $1, response_time = CURRENT_TIMESTAMP
       WHERE delivery_man_id = $2 AND order_id = $3`,
      [response, deliveryManId, orderId]
    );

    if (response === "ACCEPTED") {
      // Assign deliveryman to order
      await db.query(
        `UPDATE customer_order
         SET delivery_man_id = $1, status = 'DISPATCHED'
         WHERE order_id = $2`,
        [deliveryManId, orderId]
      );

      // Reject all other proposals for the same order
      await db.query(
        `UPDATE delivery_proposal
         SET status = 'BOOKED'
         WHERE order_id = $1 AND delivery_man_id != $2`,
        [orderId, deliveryManId]
      );

      // Notify the customer
      const customer = await db.query(
        `SELECT customer_id FROM customer_order WHERE order_id = $1`,
        [orderId]
      );

      await db.query(
        `INSERT INTO notification (message, created_at, user_id, user_type, order_id)
         VALUES ('Your order has been booked by a deliveryman.', CURRENT_TIMESTAMP, $1, 'CUSTOMER', $2)`,
        [customer.rows[0].customer_id, orderId]
      );
    }

    await db.query("COMMIT");
    res.json({ success: true });
  } catch (err) {
    await db.query("ROLLBACK");
    console.error("Error responding to proposal:", err);
    res.status(500).json({ error: "Failed to respond" });
  }
});



//payment method
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(bodyParser.json());

app.post("/ssl-request", async (req, res) => {
  try {
    const { amount, address, orderId } = req.body;

    if (!amount || !address?.city || !address?.region || !address?.roadSector || !orderId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const data = {
      value_a: orderId,
      total_amount: amount,
      currency: 'BDT',
      tran_id: 'TRX_' + Date.now(),
      success_url: 'http://localhost:4000/ssl-payment-success',
      fail_url: 'http://localhost:4000/ssl-payment-fail',
      cancel_url: 'http://localhost:4000/ssl-payment-cancel',
      ipn_url: 'http://localhost:4000/ssl-payment-ipn',
      shipping_method: 'Courier',
      product_name: 'Checkout Order',
      product_category: 'Ecommerce',
      product_profile: 'general',
      cus_name: 'Customer Name',
      cus_email: 'customer@example.com',
      cus_add1: address.roadSector || 'Default Road',
      cus_add2: address.region || 'Default Region',
      cus_city: address.city || 'Default City',
      cus_state: 'State',
      cus_postcode: '1200',
      cus_country: 'Bangladesh',
      cus_phone: '01700000000',
      cus_fax: '01700000000',
      ship_name: 'Customer Name',
      ship_add1: address.roadSector || 'Default Road',
      ship_add2: address.region || 'Default Region',
      ship_city: address.city || 'Default City',
      ship_state: 'State',
      ship_postcode: '1200',
      ship_country: 'Bangladesh',
    };

    console.log("Sending to SSLCommerz:", data);

    const sslcz = new SSLCommerzPayment(process.env.STORED_ID, process.env.STORED_PASSWORD, false);

    sslcz.init(data).then(apiResponse => {
      const GatewayPageURL = apiResponse.GatewayPageURL;

      if (GatewayPageURL) {
        console.log("Redirecting to:", GatewayPageURL);
        return res.status(200).json({ GatewayPageURL });
      } else {
        console.error("No Gateway URL in response");
        return res.status(500).json({ message: "SSLCommerz failed to generate payment link" });
      }
    }).catch(err => {
      console.error("SSLCommerz error:", err.response?.data || err.message || err);
      res.status(500).json({ message: "Payment initialization failed", error: err.message });
    });
  } catch (err) {
    console.error("Unexpected error in /ssl-request:", err);
    res.status(500).json({ message: "Unexpected error" });
  }
});



app.post("/ssl-payment-success", async (req, res) => {
  const orderId = req.body?.value_a;

  try {
    if (!orderId) {
      console.error("Missing orderId in SSLCommerz success payload");
      return res.redirect("http://localhost:3000/paymentPage?status=failed");
    }


    await db.query(
      `UPDATE customer_order SET status = 'CONFIRMED' WHERE order_id = $1`,
      [orderId]
    );

    await db.query(
      `Update payment set status ='successful' where order_id=$1`,
      [orderId]
    );


    return res.redirect("http://localhost:3000/paymentPage?status=success");
  } catch (err) {
    console.error("Error updating order after success:", err);
    return res.redirect("http://localhost:3000/paymentPage?status=error");
  }
});




app.post("/ssl-payment-fail", async (req, res) => {
  const orderId = req.body?.value_a;

  if (orderId) {
    await db.query(
      `Update payment set status ='failed' where order_id=$1`,
      [orderId]
    );
  }

  return res.redirect("http://localhost:3000/paymentPage?status=failed");
});


app.post("/ssl-payment-cancel", async (req, res, next) => {
  return res.status(200).json({
    data: req.body
  })
});

app.post("/ssl-payment-ipn", async (req, res, next) => {
  return res.status(200).json({
    data: req.body
  })
});









const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running and listening on port ${port}`);
});
