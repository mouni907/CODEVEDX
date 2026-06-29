import jwt from 'jsonwebtoken';
import { dbService } from '../services/dbService';
const JWT_SECRET = process.env.JWT_SECRET || 'jobhub_super_secret_key_123';
export const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await dbService.findUserById(decoded.id);
            if (!user) {
                res.status(401).json({ success: false, message: 'Not authorized, user not found' });
                return;
            }
            req.user = {
                id: user.id,
                role: user.role,
            };
            next();
        }
        catch (error) {
            res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }
    else {
        res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }
};
export const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ success: false, message: `Role '${req.user?.role}' is not authorized to access this resource` });
            return;
        }
        next();
    };
};
