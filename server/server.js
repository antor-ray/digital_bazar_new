const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");

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
    };
    // const newTokenData == append role here and pass it into jwt
    console.log(result.rows);
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

    res.status(201).json({
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







const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running and listening on port ${port}`);
});
