const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const SSLCommerzPayment = require('sslcommerz-lts');

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
const isAuthenticatedDeliveryMan = require("./middleware/isAuthenticatedDeliveryMan");
const authorizeRoles = require("./middleware/authorizeRoles");
app.use(cookieParser());

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query(
      "SELECT * FROM customer WHERE email = $1 AND password = $2",
      [email, password]
    );

    if (result.rows.length <= 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    let tokenData = {
      customer_id: result.rows[0].customer_id,
      role: 'customer',
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

//Delivery Man Login
app.post("/DeliveryManlogin", async (req, res) => {
  const { email, password } = req.body;
  console.log(email);
  try {
    const result = await db.query(
      "SELECT * FROM delivery_man WHERE email = $1 AND password = $2",
      [email, password]
    );
    console.log(result.rows[0]);
    if (result.rows.length <= 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    let tokenData = {
      deliveryMan_id: result.rows[0].id,
      role: 'deliveryMan'
    };
    // console.log(deliveryMan_id);
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
        deliveryMan: result.rows[0],
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


//


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

app.get("/cartItems", isAuthenticated, authorizeRoles('customer'), async (req, res) => {
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

app.post("/add_to_cart", isAuthenticated, authorizeRoles('customer'), async (req, res) => {
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

app.post("/orderItems", async (req, res) => { });

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

app.post("/api/v1/products/:id/reviews", isAuthenticated, authorizeRoles('customer'), async (req, res) => {
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
app.post("/add_to_wishlist", isAuthenticated, authorizeRoles('customer'), async (req, res) => {
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

app.get("/api/v1/wishlist", isAuthenticated, authorizeRoles('customer'), async (req, res) => {
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

//order and delivery details:


app.post("/api/orders", isAuthenticated, async (req, res) => {
  const { address, grandTotal, paymentMethod } = req.body;
  const customerId = req.user.customer_id;
    try {
    const orderInsert = await db.query(
      `INSERT INTO customer_order (customer_id, date, total_cost, address)
             VALUES ($1, CURRENT_DATE, $2, $3) RETURNING order_id`,
      [customerId, grandTotal, (address.city || ' '||address.region || ' ' || address.roadSector)]
    );
    const orderId = orderInsert.rows[0].order_id;


    // Get customer's region
    // const regionRes = await db.query(
    //   `SELECT region FROM customer WHERE customer_id = $1`,
    //   [customerId]
    // );
    const region = address.region;
    // Find deliverymen in that region
    const deliverymen = await db.query(
      `SELECT id FROM delivery_man WHERE region = $1`,
      [region]
    );

    console.log(deliverymen.rows);
    // Send proposal and notification to each
    for (const d of deliverymen.rows) {
      const deliverymanId = d.id;
      await db.query(
        `INSERT INTO delivery_proposal (delivery_man_id, order_id, status, proposal_time)
                 VALUES ($1, $2, 'PENDING', CURRENT_TIMESTAMP)`,
        [deliverymanId, orderId]
      );

      await db.query(
        `INSERT INTO notification (message, created_at, user_id, user_type, order_id)
                 VALUES ($1, CURRENT_TIMESTAMP, $2, 'DELIVERY_MAN', $3)`,
        ['You have a new delivery proposal.', deliverymanId, orderId]
      );
    }

    await db.query("COMMIT");
    res.json({ success: true, orderId });
  } catch (err) {
    await db.query("ROLLBACK");
    console.error("Order error:", err);
    res.status(500).json({ success: false, error: "Order placement failed." });
  } 
});


//Deliveryman Backend Routes
app.get("/proposal",isAuthenticated,async(req,res) =>{
  const deliveryManId=req.user.deliveryMan_id;

  try{
    const result=await db.query(
      `SELECT p.order_id, o.address, o.total_cost, p.status
       FROM delivery_proposal p
       JOIN customer_order o ON p.order_id = o.order_id
       WHERE p.delivery_man_id = $1
       ORDER BY p.proposal_time DESC`,
      [deliveryManId]
    );
    
  console.log(result.rows);
    res.json(result.rows);
  }catch(err){
    console.error("Error fetching proposal:",err);
    res.status(500).json({error:"Failed to load proposals"});
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
         SET status = 'REJECTED'
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
  } finally {
    db.release();
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
      value_a:orderId,
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

    // Update order status in your database
    await db.query(
      `UPDATE customer_order SET status = 'CONFIRMED' WHERE order_id = $1`,
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
      `UPDATE customer_order SET status = 'PAYMENT_FAILED' WHERE order_id = $1`,
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
