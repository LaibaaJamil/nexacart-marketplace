import mongoose from 'mongoose';
const orderSchema = new mongoose.Schema({ customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, name: String, price: Number, quantity: Number }], subtotal: { type: Number, required: true }, shippingAddress: { fullName: String, address: String, city: String }, status: { type: String, enum: ['confirmed', 'processing', 'shipped', 'delivered'], default: 'confirmed' } }, { timestamps: true });
export default mongoose.model('Order', orderSchema);
