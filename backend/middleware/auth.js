import jwt from 'jsonwebtoken';
export const requireAuth = (req, res, next) => { const token = req.headers.authorization?.replace('Bearer ', ''); if (!token) return res.status(401).json({ message: 'Authentication required.' }); try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'development-secret'); next(); } catch { res.status(401).json({ message: 'Your session is invalid or expired.' }); } };
export const requireAdmin = (req, res, next) => req.user?.role === 'admin' ? next() : res.status(403).json({ message: 'Administrator access required.' });
