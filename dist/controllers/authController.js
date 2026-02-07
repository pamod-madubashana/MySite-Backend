"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.register = void 0;
const express_validator_1 = require("express-validator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
exports.register = [
    (0, express_validator_1.body)('username')
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail({ gmail_remove_dots: false }) // keep dots
        .withMessage('Valid email is required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    async (req, res) => {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { username, email, password } = req.body;
            // Check if user already exists
            const existingUser = await User_1.default.findOne({
                $or: [{ email }, { username }]
            });
            if (existingUser) {
                return res.status(400).json({
                    error: 'User with this email or username already exists'
                });
            }
            // Create new user
            const adminEmail = process.env.ADMIN_EMAIL;
            console.log('DEBUG: Incoming email (after validation):', email);
            console.log('DEBUG: Admin email from env:', adminEmail);
            console.log('DEBUG: Direct comparison result:', email === adminEmail);
            const user = new User_1.default({
                username,
                email,
                password,
                role: email === adminEmail ? 'admin' : 'user'
            });
            await user.save();
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
            res.status(201).json({
                message: 'User created successfully',
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Server error during registration' });
        }
    }
];
exports.login = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail({ gmail_remove_dots: false }) // keep dots
        .withMessage('Valid email is required'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required'),
    async (req, res) => {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { email, password } = req.body;
            // Find user
            const user = await User_1.default.findOne({ email }).select('+password');
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            // Check password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Server error during login' });
        }
    }
];
const getProfile = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user._id).select('-password');
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getProfile = getProfile;
//# sourceMappingURL=authController.js.map