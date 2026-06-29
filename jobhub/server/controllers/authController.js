import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbService } from '../services/dbService';
import { uploadToCloudinary } from '../utils/upload';
const JWT_SECRET = process.env.JWT_SECRET || 'jobhub_super_secret_key_123';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const signToken = (id, role) => {
    return jwt.sign({ id, role }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};
export const register = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;
        if (!name || !email || !password || !role) {
            res.status(400).json({ success: false, message: 'Please provide all required fields' });
            return;
        }
        if (role !== 'candidate' && role !== 'employer') {
            res.status(400).json({ success: false, message: 'Role must be either candidate or employer' });
            return;
        }
        const existingUser = await dbService.findUserByEmail(email);
        if (existingUser) {
            res.status(400).json({ success: false, message: 'Email already registered' });
            return;
        }
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hashSync(password, salt);
        // Save user
        const user = await dbService.createUser({
            name,
            email,
            password: hashedPassword,
            role,
            phone: phone || '',
            resume: '',
            profileImage: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150`,
        });
        // Sign Token
        const token = signToken(user.id, user.role);
        // Clean sensitive data
        const safeUser = { ...user };
        delete safeUser.password;
        res.status(201).json({
            success: true,
            token,
            user: safeUser,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message || 'Server error during registration' });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Please provide email and password' });
            return;
        }
        const user = await dbService.findUserByEmail(email);
        if (!user || !user.password) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }
        // Sign Token
        const token = signToken(user.id, user.role);
        const safeUser = { ...user };
        delete safeUser.password;
        res.status(200).json({
            success: true,
            token,
            user: safeUser,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message || 'Server error during login' });
    }
};
export const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }
        const user = await dbService.findUserById(req.user.id);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        const safeUser = { ...user };
        delete safeUser.password;
        res.status(200).json({
            success: true,
            user: safeUser,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message || 'Server error fetching profile' });
    }
};
export const updateProfile = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }
        const { name, phone } = req.body;
        const updateData = {};
        if (name)
            updateData.name = name;
        if (phone !== undefined)
            updateData.phone = phone;
        // Handle File Uploads via Multer
        if (req.file) {
            const folderName = req.file.mimetype.startsWith('image/') ? 'profiles' : 'resumes';
            const fileUrl = await uploadToCloudinary(req.file.buffer, req.file.mimetype, folderName);
            if (req.file.mimetype.startsWith('image/')) {
                updateData.profileImage = fileUrl;
            }
            else {
                updateData.resume = fileUrl;
            }
        }
        const updatedUser = await dbService.updateUser(req.user.id, updateData);
        if (!updatedUser) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        const safeUser = { ...updatedUser };
        delete safeUser.password;
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: safeUser,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message || 'Server error updating profile' });
    }
};
export const changePassword = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            res.status(400).json({ success: false, message: 'Please provide current and new passwords' });
            return;
        }
        const user = await dbService.findUserById(req.user.id);
        if (!user || !user.password) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            res.status(400).json({ success: false, message: 'Current password is incorrect' });
            return;
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hashSync(newPassword, salt);
        await dbService.updateUser(req.user.id, { password: hashedPassword });
        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message || 'Server error changing password' });
    }
};
