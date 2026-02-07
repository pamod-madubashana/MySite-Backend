"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteArticle = exports.updateArticle = exports.updateArticleWithImage = exports.createArticle = exports.createArticleWithImage = exports.getArticleById = exports.getAllArticles = exports.getPublishedArticles = void 0;
const express_validator_1 = require("express-validator");
const Article_1 = __importDefault(require("../models/Article"));
const imageUploadHandler_1 = require("../utils/imageUploadHandler");
const getPublishedArticles = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, tags } = req.query;
        const query = { status: 'published' };
        if (search) {
            query.$text = { $search: search };
        }
        if (tags) {
            const tagArray = tags.split(',');
            query.tags = { $in: tagArray };
        }
        const articles = await Article_1.default.find(query)
            .populate('author', 'username')
            .sort({ createdAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit))
            .exec();
        const total = await Article_1.default.countDocuments(query);
        res.json({
            articles,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            total
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error while fetching articles' });
    }
};
exports.getPublishedArticles = getPublishedArticles;
const getAllArticles = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, status } = req.query;
        const query = {};
        if (search) {
            query.$text = { $search: search };
        }
        if (status) {
            query.status = status;
        }
        const articles = await Article_1.default.find(query)
            .populate('author', 'username email')
            .sort({ createdAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit))
            .exec();
        const total = await Article_1.default.countDocuments(query);
        res.json({
            articles,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            total
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error while fetching articles' });
    }
};
exports.getAllArticles = getAllArticles;
const getArticleById = async (req, res) => {
    try {
        const article = await Article_1.default.findById(req.params.id)
            .populate('author', 'username email');
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.json(article);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error while fetching article' });
    }
};
exports.getArticleById = getArticleById;
exports.createArticleWithImage = [
    (0, express_validator_1.body)('title')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Title is required and must be less than 200 characters'),
    (0, express_validator_1.body)('content')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Content is required'),
    (0, express_validator_1.body)('status')
        .isIn(['draft', 'published'])
        .withMessage('Status must be either draft or published'),
    (0, express_validator_1.body)('tags')
        .optional()
        .custom((value) => {
        // If it's a string (from form data), check if it can be parsed as an array
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                    return true;
                }
                throw new Error('Tags must be an array');
            }
            catch (e) {
                // If it's not valid JSON, try to split by commas
                return true; // Allow string format and handle conversion later
            }
        }
        // If it's already an array, validate it
        if (Array.isArray(value)) {
            return true;
        }
        throw new Error('Tags must be an array');
    })
        .withMessage('Tags must be an array'),
    async (req, res) => {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            let featuredImageUrl;
            // Handle image upload if present
            if (req.file) {
                try {
                    featuredImageUrl = await (0, imageUploadHandler_1.handleArticleImageUpload)(req);
                }
                catch (imageError) {
                    return res.status(400).json({ error: imageError.message });
                }
            }
            const { title, content, excerpt, status, tags } = req.body;
            // Parse tags if it's a string (from form data)
            let parsedTags = tags || [];
            if (typeof tags === 'string') {
                try {
                    parsedTags = JSON.parse(tags);
                }
                catch (e) {
                    // If it's not JSON, split by comma as fallback
                    parsedTags = tags.split(',').map((tag) => tag.trim()).filter((tag) => tag);
                }
            }
            // Generate slug from title
            const slug = title
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
            // Check if slug already exists
            const existingArticle = await Article_1.default.findOne({ slug });
            if (existingArticle) {
                return res.status(400).json({ error: 'Article with this title already exists' });
            }
            const article = new Article_1.default({
                title,
                slug,
                content,
                excerpt: excerpt || content.substring(0, 200),
                status,
                tags: parsedTags,
                featuredImage: featuredImageUrl,
                author: req.user._id
            });
            await article.save();
            res.status(201).json({
                message: 'Article created successfully',
                article
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Server error while creating article' });
        }
    }
];
exports.createArticle = [
    (0, express_validator_1.body)('title')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Title is required and must be less than 200 characters'),
    (0, express_validator_1.body)('content')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Content is required'),
    (0, express_validator_1.body)('status')
        .isIn(['draft', 'published'])
        .withMessage('Status must be either draft or published'),
    (0, express_validator_1.body)('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    async (req, res) => {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { title, content, excerpt, status, tags, featuredImage } = req.body;
            // Generate slug from title
            const slug = title
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
            // Check if slug already exists
            const existingArticle = await Article_1.default.findOne({ slug });
            if (existingArticle) {
                return res.status(400).json({ error: 'Article with this title already exists' });
            }
            const article = new Article_1.default({
                title,
                slug,
                content,
                excerpt: excerpt || content.substring(0, 200),
                status,
                tags: tags || [],
                featuredImage,
                author: req.user._id
            });
            await article.save();
            res.status(201).json({
                message: 'Article created successfully',
                article
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Server error while creating article' });
        }
    }
];
exports.updateArticleWithImage = [
    (0, express_validator_1.body)('title')
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be less than 200 characters'),
    (0, express_validator_1.body)('content')
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage('Content is required'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['draft', 'published'])
        .withMessage('Status must be either draft or published'),
    (0, express_validator_1.body)('tags')
        .optional()
        .custom((value) => {
        // If it's a string (from form data), check if it can be parsed as an array
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                    return true;
                }
                throw new Error('Tags must be an array');
            }
            catch (e) {
                // If it's not valid JSON, try to split by commas
                return true; // Allow string format and handle conversion later
            }
        }
        // If it's already an array, validate it
        if (Array.isArray(value)) {
            return true;
        }
        throw new Error('Tags must be an array');
    })
        .withMessage('Tags must be an array'),
    async (req, res) => {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            let featuredImageUrl = undefined;
            // Handle image upload if present
            if (req.file) {
                try {
                    featuredImageUrl = await (0, imageUploadHandler_1.handleArticleImageUpload)(req);
                }
                catch (imageError) {
                    return res.status(400).json({ error: imageError.message });
                }
            }
            const { title, content, excerpt, status, tags } = req.body;
            const updateData = {};
            if (title) {
                // If title is being updated, also update the slug
                updateData.title = title;
                updateData.slug = title
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/[\s_-]+/g, '-')
                    .replace(/^-+|-+$/g, '');
            }
            if (content)
                updateData.content = content;
            if (excerpt !== undefined)
                updateData.excerpt = excerpt;
            if (status)
                updateData.status = status;
            // Parse tags if it's a string (from form data)
            if (tags !== undefined) {
                if (typeof tags === 'string') {
                    try {
                        updateData.tags = JSON.parse(tags);
                    }
                    catch (e) {
                        // If it's not JSON, split by comma as fallback
                        updateData.tags = tags.split(',').map((tag) => tag.trim()).filter((tag) => tag);
                    }
                }
                else {
                    updateData.tags = tags;
                }
            }
            if (featuredImageUrl !== undefined)
                updateData.featuredImage = featuredImageUrl;
            const article = await Article_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate('author', 'username email');
            if (!article) {
                return res.status(404).json({ error: 'Article not found' });
            }
            res.json({
                message: 'Article updated successfully',
                article
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Server error while updating article' });
        }
    }
];
exports.updateArticle = [
    (0, express_validator_1.body)('title')
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be less than 200 characters'),
    (0, express_validator_1.body)('content')
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage('Content is required'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['draft', 'published'])
        .withMessage('Status must be either draft or published'),
    (0, express_validator_1.body)('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    async (req, res) => {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { title, content, excerpt, status, tags, featuredImage } = req.body;
            const updateData = {};
            if (title) {
                // If title is being updated, also update the slug
                updateData.title = title;
                updateData.slug = title
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/[\s_-]+/g, '-')
                    .replace(/^-+|-+$/g, '');
            }
            if (content)
                updateData.content = content;
            if (excerpt !== undefined)
                updateData.excerpt = excerpt;
            if (status)
                updateData.status = status;
            if (tags)
                updateData.tags = tags;
            if (featuredImage !== undefined)
                updateData.featuredImage = featuredImage;
            const article = await Article_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate('author', 'username email');
            if (!article) {
                return res.status(404).json({ error: 'Article not found' });
            }
            res.json({
                message: 'Article updated successfully',
                article
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Server error while updating article' });
        }
    }
];
const deleteArticle = async (req, res) => {
    try {
        const article = await Article_1.default.findByIdAndDelete(req.params.id);
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.json({ message: 'Article deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error while deleting article' });
    }
};
exports.deleteArticle = deleteArticle;
//# sourceMappingURL=articleController.js.map