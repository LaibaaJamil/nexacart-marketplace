import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({ name: { type: String, required: true, trim: true, maxlength: 60 }, email: { type: String, required: true, unique: true, lowercase: true, trim: true }, password: { type: String, required: true, minlength: 6 }, role: { type: String, enum: ['customer', 'admin'], default: 'customer' }, wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }] }, { timestamps: true });
export default mongoose.model('User', userSchema);
