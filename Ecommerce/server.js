import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Seed/In-memory database structure
let users = [
  {
    id: "user_customer",
    email: "customer@atelier.com",
    password: "password",
    name: "Active Customer",
    role: "customer",
    balance: 1000,
    businessName: "Active Boutique"
  },
  {
    id: "user_seller",
    email: "seller@atelier.com",
    password: "password",
    name: "Artisan Boutique",
    role: "seller",
    balance: 1000,
    businessName: "Artisan Boutique",
  }
];

let categories = ["HOME DECOR", "APPAREL", "JEWELLERY", "ACCESSORIES", "TECHNOLOGY"];
let products = [];
let orders = [];
let reviews = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Helper to ensure users are dynamically re-seeded/rebuilt if the dev server restarts
  const ensureUser = (userId) => {
    let user = users.find(u => u.id === userId);
    if (!user && userId) {
      const isCustomer = userId.toLowerCase().includes("customer");
      user = {
        id: userId,
        email: isCustomer ? "customer@atelier.com" : "seller@atelier.com",
        password: "password",
        name: isCustomer ? "Active Customer" : "Artisan Boutique",
        role: isCustomer ? "customer" : "seller",
        balance: 1000,
        businessName: isCustomer ? "Active Boutique" : "Artisan Boutique"
      };
      users.push(user);
    }
    return user;
  };

  // Middleware to parse requests
  app.use(express.json());

  // Dynamic Categories list
  app.get("/api/categories", (req, res) => {
    res.json(categories);
  });


  // API Routes
  // 1. Auth Endpoint: Registration
  app.post("/api/auth/register", (req, res) => {
    const { email, password, name, role, businessName } = req.body;
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const newUser = {
      id: "user_" + Math.random().toString(36).substr(2, 9),
      email: email.toLowerCase(),
      password,
      name,
      role: role,
      balance: 1000, // Pre-seed every user with $1000 to buy/sell easily
      businessName: businessName || `${name}'s Boutique`
    };

    users.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ user: userWithoutPassword });
  });

  // 2. Auth Endpoint: Login
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  });

  // 3. Products Endpoints
  app.get("/api/products", (req, res) => {
    const { search, category, sellerId } = req.query;
    let filtered = [...products];

    if (search) {
      const s = String(search).toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
    }

    if (category && category !== "All") {
      filtered = filtered.filter(p => p.category.toUpperCase() === String(category).toUpperCase());
    }

    if (sellerId) {
      filtered = filtered.filter(p => p.sellerId === sellerId);
    }

    res.json(filtered);
  });

  // 4. Products Endpoint by ID
  app.get("/api/products/:id", (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  });

  // 5. Products Create Endpoint
  app.post("/api/products", (req, res) => {
    const { name, description, price, originalPrice, image, category, sellerId, stock, shippingCost } = req.body;
    if (!name || !price || !category || !sellerId) {
      return res.status(400).json({ error: "Missing product fields" });
    }

    const seller = ensureUser(sellerId);
    if (!seller) {
      return res.status(403).json({ error: "Seller account not found" });
    }

    const catUpper = category.trim().toUpperCase();
    if (!categories.includes(catUpper)) {
      categories.push(catUpper);
    }

    const newProduct = {
      id: "prod_" + Math.random().toString(36).substr(2, 9),
      name,
      description: description || "Premium handpicked catalog item selected with meticulous quality care.",
      price: Number(price),
      originalPrice: Number(originalPrice || price * 1.5),
      image: image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=60",
      category: catUpper,
      rating: 5.0,
      numReviews: 0,
      sellerId,
      sellerName: seller.businessName || seller.name,
      stock: Number(stock || 50),
      shippingCost: Number(shippingCost || 0)
    };

    products.unshift(newProduct);
    res.status(201).json(newProduct);
  });

  // 6. Products Delete Endpoint
  app.delete("/api/products/:id", (req, res) => {
    const { sellerId } = req.body;
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (products[index].sellerId !== sellerId) {
      return res.status(403).json({ error: "Unauthorized delete action" });
    }

    products.splice(index, 1);
    res.json({ success: true, message: "Product deleted successfully" });
  });

  // 7. Products Put Endpoint
  app.put("/api/products/:id", (req, res) => {
    const { sellerId, name, description, price, originalPrice, image, category, stock, shippingCost } = req.body;
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (products[index].sellerId !== sellerId) {
      return res.status(403).json({ error: "Unauthorized edit action" });
    }

    if (!name || !price || !category) {
      return res.status(400).json({ error: "Missing required product fields" });
    }

    const catUpper = category.trim().toUpperCase();
    if (!categories.includes(catUpper)) {
      categories.push(catUpper);
    }

    products[index] = {
      ...products[index],
      name,
      description: description || "Premium handpicked catalog item selected with meticulous quality care.",
      price: Number(price),
      originalPrice: Number(originalPrice || price * 1.5),
      image: image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=60",
      category: catUpper,
      stock: Number(stock || 50),
      shippingCost: Number(shippingCost || 0)
    };

    res.json(products[index]);
  });

  // 8. Orders Endpoints
  app.post("/api/orders", (req, res) => {
    const { buyerId, items, shippingAddress, deliveryOption, deliveryFee, subtotal, profitMarginTotal, grandTotal, paymentMethod } = req.body;

    if (!buyerId || !items || items.length === 0 || !shippingAddress) {
      return res.status(400).json({ error: "Order details missing or cart is empty" });
    }

    const buyer = ensureUser(buyerId);
    if (!buyer) {
      return res.status(404).json({ error: "Buyer profile not found" });
    }

    const primarySellerId = items[0].product.sellerId || "user_seller";

    // Deduct stock for products ordered
    items.forEach((item) => {
      const p = products.find(prod => prod.id === item.product.id);
      if (p) {
        p.stock = Math.max(0, p.stock - item.quantity);
      }
    });

    const newOrder = {
      id: "ORD-" + Math.floor(100000 + Math.random() * 900000),
      buyerId,
      buyerName: buyer.name,
      sellerId: primarySellerId,
      items,
      shippingAddress,
      deliveryOption,
      deliveryFee,
      subtotal,
      profitMarginTotal, // Reseller margin earned
      grandTotal,
      paymentMethod,
      status: "pending",
      orderDate: new Date().toISOString().split('T')[0],
    };

    orders.unshift(newOrder);

    // If there is reseller profit margin, credit it back to the buyer's balance (as reseller earnings)!
    if (profitMarginTotal > 0) {
      buyer.balance += profitMarginTotal;
    }

    // Also credit seller earnings: product base price * quantity
    const seller = ensureUser(primarySellerId);
    if (seller) {
      const sellerEarned = subtotal; // subtotal excludes reseller profit margin
      seller.balance += sellerEarned;
    }

    res.status(201).json(newOrder);
  });

  app.get("/api/orders", (req, res) => {
    const { userId, role } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    let filteredOrders = [];
    if (role === "seller") {
      filteredOrders = orders.filter(o => o.sellerId === userId);
    } else {
      filteredOrders = orders.filter(o => o.buyerId === userId);
    }

    res.json(filteredOrders);
  });

  app.put("/api/orders/:id/status", (req, res) => {
    const { status, sellerId } = req.body;
    const order = orders.find(o => o.id === req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.sellerId !== sellerId) {
      return res.status(403).json({ error: "Unauthorized status update" });
    }

    order.status = status;
    res.json(order);
  });

  // 9. Reviews Endpoints
  app.get("/api/reviews/:productId", (req, res) => {
    const productReviews = reviews.filter(r => r.productId === req.params.productId);
    res.json(productReviews);
  });

  app.post("/api/reviews", (req, res) => {
    const { productId, userName, rating, comment } = req.body;
    if (!productId || !userName || !rating || !comment) {
      return res.status(400).json({ error: "Missing review attributes" });
    }

    const newReview = {
      id: "rev_" + Math.random().toString(36).substr(2, 9),
      productId,
      userName,
      rating: Number(rating),
      comment,
      date: new Date().toISOString().split('T')[0]
    };

    reviews.unshift(newReview);

    // Recalculate product rating
    const productReviews = reviews.filter(r => r.productId === productId);
    const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
    const p = products.find(prod => prod.id === productId);
    if (p) {
      p.rating = Number(avgRating.toFixed(1));
      p.numReviews = productReviews.length;
    }

    res.status(201).json(newReview);
  });

  // 10. Wallet / Profile info
  app.get("/api/users/:id", (req, res) => {
    const user = ensureUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Vite middleware for asset serving in dev, and static file fallback in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
