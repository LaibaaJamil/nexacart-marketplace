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
app.use(cors({ origin: /^http:\/\/localhost:(5173|5174|5175)$/ }));
app.use(express.json());

const catalogue = [
  { id: 1, name: 'Aurelia Lounge Chair', category: 'Furniture', price: 349, stock: 8 },
  { id: 2, name: 'Solace Table Lamp', category: 'Lighting', price: 129, stock: 15 },
  { id: 3, name: 'Celine Ceramic Set', category: 'Decor', price: 89, stock: 10 }
];

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI).then(() => console.log('MongoDB connected')).catch(error => console.log(`MongoDB connection failed: ${error.message}`));
} else {
  console.log('MongoDB URI not configured: using catalogue demo mode');
}
const tokenFor = user => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'development-secret', { expiresIn: '7d' });

app.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'NexaCart API' }));
app.get('/api/products', async (_, res, next) => { try { const products = mongoose.connection.readyState === 1 ? await Product.find().lean() : catalogue; res.json(products); } catch (error) { next(error); } });
app.get('/api/re-loved', async (_, res, next) => { try { res.json(await Product.find({ listingType: 're-loved' }).populate('seller', 'name').sort({ createdAt: -1 }).lean()); } catch (error) { next(error); } });
app.post('/api/auth/register', async (req, res, next) => { try { const { name, email, password } = req.body; if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required.' }); if (await User.findOne({ email })) return res.status(409).json({ message: 'An account already exists for this email.' }); const user = await User.create({ name, email, password: await bcrypt.hash(password, 12) }); res.status(201).json({ token: tokenFor(user), user: { name: user.name, email: user.email, role: user.role } }); } catch (error) { next(error); } });
app.post('/api/auth/login', async (req, res, next) => { try { const user = await User.findOne({ email: req.body.email }); if (!user || !(await bcrypt.compare(req.body.password, user.password))) return res.status(401).json({ message: 'Incorrect email or password.' }); res.json({ token: tokenFor(user), user: { name: user.name, email: user.email, role: user.role } }); } catch (error) { next(error); } });
app.get('/api/orders/mine', requireAuth, async (req, res, next) => { try { res.json(await Order.find({ customer: req.user.id }).sort({ createdAt: -1 })); } catch (error) { next(error); } });
app.post('/api/orders', requireAuth, async (req, res, next) => { try { const { items, shippingAddress } = req.body; if (!items?.length) return res.status(400).json({ message: 'Your bag is empty.' }); const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0); const order = await Order.create({ customer: req.user.id, items, subtotal, shippingAddress }); res.status(201).json(order); } catch (error) { next(error); } });
app.post('/api/auctions/:productId/bids', requireAuth, async (req, res, next) => { try { const product = await Product.findOne({ _id: req.params.productId, listingType: 'auction' }); if (!product) return res.status(404).json({ message: 'Auction listing not found.' }); if (product.auctionEndsAt && product.auctionEndsAt < new Date()) return res.status(400).json({ message: 'This auction has ended.' }); const minimum = (product.currentBid || product.price) + (product.bidIncrement || 1); if (Number(req.body.amount) < minimum) return res.status(400).json({ message: `Minimum bid is ${minimum}.` }); const bid = await Bid.create({ product: product._id, bidder: req.user.id, amount: req.body.amount }); product.currentBid = bid.amount; await product.save(); res.status(201).json({ bid, currentBid: product.currentBid }); } catch (error) { next(error); } });
app.get('/api/admin/overview', requireAuth, requireAdmin, async (_, res, next) => { try { const [users, products, orders, revenue] = await Promise.all([User.countDocuments(), Product.countDocuments(), Order.countDocuments(), Order.aggregate([{ $group: { _id: null, total: { $sum: '$subtotal' } } }])]); res.json({ users, products, orders, revenue: revenue[0]?.total || 0 }); } catch (error) { next(error); } });
app.use((error, _, res, __) => {
  console.error(error);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
});
app.listen(process.env.PORT || 5001, () => console.log(`NexaCart API is running on port ${process.env.PORT || 5001}`));
