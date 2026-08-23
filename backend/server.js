import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Bid from './models/Bid.js';
import { requireAdmin, requireAuth } from './middleware/auth.js';

dotenv.config();

const app = express();
const allowedOrigins = [/^http:\/\/localhost:(5173|5174|5175)$/, process.env.CLIENT_URL].filter(Boolean);

app.use(cors({ 
  origin(origin, callback) { 
    if (!origin || allowedOrigins.some(item => item instanceof RegExp ? item.test(origin) : item === origin)) 
      return callback(null, true); 
    return callback(new Error('Origin not allowed by CORS.')); 
  } 
}));

app.use(express.json());

const catalogue = [
  { id: 1, name: 'Aurelia Lounge Chair', category: 'Furniture', price: 349, stock: 8 },
  { id: 2, name: 'Solace Table Lamp', category: 'Lighting', price: 129, stock: 15 },
  { id: 3, name: 'Celine Ceramic Set', category: 'Decor', price: 89, stock: 10 }
];

let mongoReady = false;
let mongoConnectionPromise;

const connectMongoDB = async () => {
  if (mongoose.connection.readyState === 1) {
    mongoReady = true;
    return true;
  }
  if (!process.env.MONGODB_URI) {
    console.error('MongoDB URI is missing in the deployment environment.');
    return false;
  }
  if (!mongoConnectionPromise) {
    mongoConnectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
      retryWrites: true,
      w: 'majority'
    }).then(() => {
      mongoReady = true;
      console.log('MongoDB connected successfully');
      return true;
    }).catch(error => {
      mongoConnectionPromise = undefined;
      mongoReady = false;
      console.error('MongoDB connection failed:', error.message);
      return false;
    });
  }
  return mongoConnectionPromise;
};

const requireDatabase = async (req, res, next) => {
  if (await connectMongoDB()) return next();
  return res.status(503).json({ message: 'Database connection unavailable. Check API deployment logs.' });
};

const tokenFor = user => jwt.sign(
  { id: user._id, role: user.role }, 
  process.env.JWT_SECRET || 'development-secret', 
  { expiresIn: '7d' }
);

// ✅ Health check endpoint
app.get('/api/health', (_, res) => {
  res.json({ 
    status: 'ok', 
    service: 'NexaCart API',
    mongoReady: mongoReady
  });
});

// ✅ Products endpoint
app.get('/api/products', async (_, res, next) => {
  try {
    const products = mongoose.connection.readyState === 1 
      ? await Product.find().lean() 
      : catalogue;
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// ✅ Re-loved products endpoint
app.get('/api/re-loved', async (_, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database not ready. Please try again.' });
    }
    res.json(await Product.find({ listingType: 're-loved' })
      .populate('seller', 'name')
      .sort({ createdAt: -1 })
      .lean());
  } catch (error) {
    next(error);
  }
});

// ✅ FIX 3: Register endpoint with better error handling
app.post('/api/auth/register', requireDatabase, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'An account already exists for this email.' });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword 
    });

    res.status(201).json({ 
      token: tokenFor(user), 
      user: { 
        id: user._id,
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
});

// ✅ FIX 4: Login endpoint with better error handling
app.post('/api/auth/login', requireDatabase, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    res.json({ 
      token: tokenFor(user), 
      user: { 
        id: user._id,
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
});

// ✅ Get user orders
app.get('/api/orders/mine', requireAuth, async (req, res, next) => {
  try {
    res.json(await Order.find({ customer: req.user.id }).sort({ createdAt: -1 }));
  } catch (error) {
    next(error);
  }
});

// ✅ Create order
app.post('/api/orders', requireAuth, async (req, res, next) => {
  try {
    const { items, shippingAddress } = req.body;
    if (!items?.length) {
      return res.status(400).json({ message: 'Your bag is empty.' });
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = await Order.create({ 
      customer: req.user.id, 
      items, 
      subtotal, 
      shippingAddress 
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

// ✅ Auction bidding
app.post('/api/auctions/:productId/bids', requireAuth, async (req, res, next) => {
  try {
    const product = await Product.findOne({ 
      _id: req.params.productId, 
      listingType: 'auction' 
    });

    if (!product) {
      return res.status(404).json({ message: 'Auction listing not found.' });
    }

    if (product.auctionEndsAt && product.auctionEndsAt < new Date()) {
      return res.status(400).json({ message: 'This auction has ended.' });
    }

    const minimum = (product.currentBid || product.price) + (product.bidIncrement || 1);
    if (Number(req.body.amount) < minimum) {
      return res.status(400).json({ message: `Minimum bid is ${minimum}.` });
    }

    const bid = await Bid.create({ 
      product: product._id, 
      bidder: req.user.id, 
      amount: req.body.amount 
    });

    product.currentBid = bid.amount;
    await product.save();

    res.status(201).json({ 
      bid, 
      currentBid: product.currentBid 
    });
  } catch (error) {
    next(error);
  }
});

// ✅ Admin overview
app.get('/api/admin/overview', requireAuth, requireAdmin, async (_, res, next) => {
  try {
    const [users, products, orders, revenue] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([{ 
        $group: { 
          _id: null, 
          total: { $sum: '$subtotal' } 
        } 
      }])
    ]);

    res.json({ 
      users, 
      products, 
      orders, 
      revenue: revenue[0]?.total || 0 
    });
  } catch (error) {
    next(error);
  }
});

// ✅ FIX 5: Better error handling middleware
app.use((error, _, res, __) => {
  console.error('Error:', error);
  
  // MongoDB connection errors
  if (error.message.includes('buffering timed out') || error.name === 'MongooseError') {
    return res.status(503).json({ 
      message: 'Database connection error. Please try again later.' 
    });
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation error',
      details: error.message 
    });
  }

  // Default error
  res.status(500).json({ 
    message: 'Something went wrong. Please try again.' 
  });
});

// ✅ Start server
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`NexaCart API is running on port ${PORT}`));
}

export default app;
