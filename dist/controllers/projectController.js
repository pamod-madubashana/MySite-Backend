"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateProjectSlugs = exports.getProjectBySlug = exports.deleteProject = exports.updateProject = exports.updateProjectWithImage = exports.createProject = exports.createProjectWithImage = exports.getProjectById = exports.getAllProjects = exports.getPublishedProjects = void 0;
const express_validator_1 = require("express-validator");
const mongoose_1 = __importDefault(require("mongoose"));
const Project_1 = __importDefault(require("../models/Project"));
const imageUploadHandler_1 = require("../utils/imageUploadHandler");
const slugify_1 = require("../utils/slugify");
const isValidProjectId = (projectId) => mongoose_1.default.isValidObjectId(projectId);
const resolveUniqueProjectSlug = async (title, excludeProjectId) => {
    const baseSlug = (0, slugify_1.slugifyProjectTitle)(title);
    return (0, slugify_1.makeUniqueSlug)(baseSlug, async (candidateSlug) => {
        const query = { slug: candidateSlug };
        if (excludeProjectId) {
            query._id = { $ne: excludeProjectId };
        }
        const existing = await Project_1.default.exists(query);
        return Boolean(existing);
    });
};
const getPublishedProjects = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, featured } = req.query;
        const query = { status: 'published' };
        if (search) {
            // Use regular expression search instead of text index to avoid MongoDB text index errors
            const searchString = search;
            // Only create regex if search string is not empty
            if (searchString.trim()) {
                const searchRegex = new RegExp(searchString, 'i');
                query.$or = [
                    { title: searchRegex },
                    { description: searchRegex },
                    { techStack: { $in: [searchRegex] } }
                ];
            }
        }
        if (featured === 'true') {
            query.featured = true;
        }
        try {
            const projects = await Project_1.default.find(query)
                .sort({ featured: -1, createdAt: -1 })
                .limit(Number(limit) * 1)
                .skip((Number(page) - 1) * Number(limit))
                .exec();
            const total = await Project_1.default.countDocuments(query);
            res.json({
                projects,
                totalPages: Math.ceil(total / Number(limit)),
                currentPage: Number(page),
                total
            });
        }
        catch (dbError) {
            console.error('Database error in getPublishedProjects:', dbError);
            res.status(500).json({ error: 'Database error while fetching published projects' });
        }
    }
    catch (error) {
        console.error('General error in getPublishedProjects:', error);
        res.status(500).json({ error: 'Server error while fetching published projects' });
    }
};
exports.getPublishedProjects = getPublishedProjects;
const getAllProjects = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, status, featured } = req.query;
        const query = {};
        if (search) {
            // Use regular expression search instead of text index to avoid MongoDB text index errors
            const searchString = search;
            // Only create regex if search string is not empty
            if (searchString.trim()) {
                const searchRegex = new RegExp(searchString, 'i');
                query.$or = [
                    { title: searchRegex },
                    { description: searchRegex },
                    { techStack: { $in: [searchRegex] } }
                ];
            }
        }
        if (status) {
            query.status = status;
        }
        if (featured !== undefined) {
            query.featured = featured === 'true';
        }
        try {
            const projects = await Project_1.default.find(query)
                .sort({ featured: -1, createdAt: -1 })
                .limit(Number(limit) * 1)
                .skip((Number(page) - 1) * Number(limit))
                .exec();
            const total = await Project_1.default.countDocuments(query);
            res.json({
                projects,
                totalPages: Math.ceil(total / Number(limit)),
                currentPage: Number(page),
                total
            });
        }
        catch (dbError) {
            console.error('Database error in getAllProjects:', dbError);
            res.status(500).json({ error: 'Database error while fetching all projects' });
        }
    }
    catch (error) {
        console.error('General error in getAllProjects:', error);
        res.status(500).json({ error: 'Server error while fetching all projects' });
    }
};
exports.getAllProjects = getAllProjects;
const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidProjectId(id)) {
            return res.status(404).json({ error: 'Project not found' });
        }
        const project = await Project_1.default.findById(id);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json(project);
    }
    catch (error) {
        console.error('Error in getProjectById:', error);
        res.status(500).json({ error: 'Server error while fetching project by ID' });
    }
};
exports.getProjectById = getProjectById;
exports.createProjectWithImage = [
    (0, express_validator_1.body)('title')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Title is required and must be less than 200 characters'),
    (0, express_validator_1.body)('description')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Description is required and must be less than 1000 characters'),
    (0, express_validator_1.body)('tags')
        .custom((value) => {
        // Check if it's an array with at least one item
        if (Array.isArray(value) && value.length >= 1) {
            return true;
        }
        // If it's a string, check if it can be parsed as an array with at least one item
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed) && parsed.length >= 1) {
                    return true;
                }
                // Also check if it's a comma-separated string
                const splitValues = value.split(',').map(tag => tag.trim()).filter(tag => tag);
                if (splitValues.length >= 1) {
                    return true;
                }
            }
            catch (e) {
                // If it's not valid JSON, try to split by commas
                const splitValues = value.split(',').map(tag => tag.trim()).filter(tag => tag);
                if (splitValues.length >= 1) {
                    return true;
                }
            }
        }
        // If neither condition is met, throw an error
        throw new Error('Tags must be an array with at least one item');
    }),
    (0, express_validator_1.body)('languages')
        .custom((value) => {
        // Check if it's an array
        if (Array.isArray(value)) {
            return true;
        }
        // If it's a string, check if it can be parsed as an array
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                    return true;
                }
                // Also check if it's a comma-separated string
                const splitValues = value.split(',').map(lang => lang.trim()).filter(lang => lang);
                if (splitValues.length >= 0) { // Allow empty arrays
                    return true;
                }
            }
            catch (e) {
                // If it's not valid JSON, try to split by commas
                const splitValues = value.split(',').map(lang => lang.trim()).filter(lang => lang);
                if (splitValues.length >= 0) { // Allow empty arrays
                    return true;
                }
            }
        }
        // If it's undefined, that's also acceptable
        if (value === undefined) {
            return true;
        }
        // If none of the conditions are met, throw an error
        throw new Error('Languages must be an array or a comma-separated string');
    }),
    (0, express_validator_1.body)('status')
        .isIn(['draft', 'published'])
        .withMessage('Status must be either draft or published'),
    (0, express_validator_1.body)('githubUrl')
        .optional()
        .custom((value) => {
        // Allow null, undefined, empty string, or valid URLs
        if (value === null || value === undefined || value === '')
            return true;
        try {
            new URL(value);
            return true;
        }
        catch {
            return false;
        }
    })
        .withMessage('GitHub URL must be a valid URL'),
    (0, express_validator_1.body)('liveUrl')
        .optional()
        .custom((value) => {
        // Allow null, undefined, empty string, or valid URLs
        if (value === null || value === undefined || value === '')
            return true;
        try {
            new URL(value);
            return true;
        }
        catch {
            return false;
        }
    })
        .withMessage('Live URL must be a valid URL'),
    (0, express_validator_1.body)('featured')
        .optional()
        .isBoolean()
        .withMessage('Featured must be a boolean'),
    async (req, res) => {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            // Handle image uploads
            let imageResults;
            try {
                imageResults = await (0, imageUploadHandler_1.handleProjectImageUpload)(req);
            }
            catch (imageError) {
                return res.status(400).json({ error: imageError.message });
            }
            const { title, description, tags, languages, githubUrl, liveUrl, featured, status } = req.body;
            const slug = await resolveUniqueProjectSlug(title);
            // Parse tags if it's a string (from form data)
            let parsedTags = tags;
            if (typeof tags === 'string') {
                try {
                    parsedTags = JSON.parse(tags);
                }
                catch (e) {
                    // If it's not JSON, split by comma as fallback
                    parsedTags = tags.split(',').map((tag) => tag.trim()).filter((tag) => tag);
                }
            }
            // Parse languages if it's a string (from form data)
            let parsedLanguages = languages || [];
            if (typeof languages === 'string') {
                try {
                    parsedLanguages = JSON.parse(languages);
                }
                catch (e) {
                    // If it's not JSON, split by comma as fallback
                    parsedLanguages = languages.split(',').map((lang) => lang.trim()).filter((lang) => lang);
                }
            }
            const project = new Project_1.default({
                title,
                slug,
                description,
                tags: parsedTags,
                languages: parsedLanguages,
                githubUrl,
                liveUrl,
                featured: featured || false,
                status: status || 'draft',
                thumbnail: imageResults.thumbnail,
                screenshots: imageResults.screenshots
            });
            await project.save();
            res.status(201).json({
                message: 'Project created successfully',
                project
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Server error while creating project' });
        }
    }
];
exports.createProject = [
    (0, express_validator_1.body)('title')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Title is required and must be less than 200 characters'),
    (0, express_validator_1.body)('description')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Description is required and must be less than 1000 characters'),
    (0, express_validator_1.body)('tags')
        .custom((value) => {
        // Check if it's an array with at least one item
        if (Array.isArray(value) && value.length >= 1) {
            return true;
        }
        // If it's a string, check if it can be parsed as an array with at least one item
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed) && parsed.length >= 1) {
                    return true;
                }
                // Also check if it's a comma-separated string
                const splitValues = value.split(',').map(tag => tag.trim()).filter(tag => tag);
                if (splitValues.length >= 1) {
                    return true;
                }
            }
            catch (e) {
                // If it's not valid JSON, try to split by commas
                const splitValues = value.split(',').map(tag => tag.trim()).filter(tag => tag);
                if (splitValues.length >= 1) {
                    return true;
                }
            }
        }
        // If neither condition is met, throw an error
        throw new Error('Tags must be an array with at least one item');
    }),
    (0, express_validator_1.body)('languages')
        .custom((value) => {
        // Check if it's an array
        if (Array.isArray(value)) {
            return true;
        }
        // If it's a string, check if it can be parsed as an array
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                    return true;
                }
                // Also check if it's a comma-separated string
                const splitValues = value.split(',').map(lang => lang.trim()).filter(lang => lang);
                if (splitValues.length >= 0) { // Allow empty arrays
                    return true;
                }
            }
            catch (e) {
                // If it's not valid JSON, try to split by commas
                const splitValues = value.split(',').map(lang => lang.trim()).filter(lang => lang);
                if (splitValues.length >= 0) { // Allow empty arrays
                    return true;
                }
            }
        }
        // If it's undefined, that's also acceptable
        if (value === undefined) {
            return true;
        }
        // If none of the conditions are met, throw an error
        throw new Error('Languages must be an array or a comma-separated string');
    }),
    (0, express_validator_1.body)('status')
        .isIn(['draft', 'published'])
        .withMessage('Status must be either draft or published'),
    (0, express_validator_1.body)('githubUrl')
        .optional()
        .custom((value) => {
        // Allow null, undefined, empty string, or valid URLs
        if (value === null || value === undefined || value === '')
            return true;
        try {
            new URL(value);
            return true;
        }
        catch {
            return false;
        }
    })
        .withMessage('GitHub URL must be a valid URL'),
    (0, express_validator_1.body)('liveUrl')
        .optional()
        .custom((value) => {
        // Allow null, undefined, empty string, or valid URLs
        if (value === null || value === undefined || value === '')
            return true;
        try {
            new URL(value);
            return true;
        }
        catch {
            return false;
        }
    })
        .withMessage('Live URL must be a valid URL'),
    (0, express_validator_1.body)('featured')
        .optional()
        .isBoolean()
        .withMessage('Featured must be a boolean'),
    async (req, res) => {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { title, description, tags, languages, githubUrl, liveUrl, featured, status, thumbnail, screenshots } = req.body;
            const slug = await resolveUniqueProjectSlug(title);
            const project = new Project_1.default({
                title,
                slug,
                description,
                tags,
                languages: languages || [],
                githubUrl,
                liveUrl,
                featured: featured || false,
                status: status || 'draft',
                thumbnail,
                screenshots
            });
            await project.save();
            res.status(201).json({
                message: 'Project created successfully',
                project
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Server error while creating project' });
        }
    }
];
exports.updateProjectWithImage = [
    (0, express_validator_1.body)('title')
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be less than 200 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Description must be less than 1000 characters'),
    (0, express_validator_1.body)('tags')
        .optional()
        .custom((value) => {
        // Check if it's an array with at least one item
        if (Array.isArray(value) && value.length >= 1) {
            return true;
        }
        // If it's a string, check if it can be parsed as an array with at least one item
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed) && parsed.length >= 1) {
                    return true;
                }
                // Also check if it's a comma-separated string
                const splitValues = value.split(',').map(tag => tag.trim()).filter(tag => tag);
                if (splitValues.length >= 1) {
                    return true;
                }
            }
            catch (e) {
                // If it's not valid JSON, try to split by commas
                const splitValues = value.split(',').map(tag => tag.trim()).filter(tag => tag);
                if (splitValues.length >= 1) {
                    return true;
                }
            }
        }
        // If neither condition is met, throw an error
        throw new Error('Tags must be an array with at least one item');
    }),
    (0, express_validator_1.body)('languages')
        .optional()
        .custom((value) => {
        // Check if it's an array
        if (Array.isArray(value)) {
            return true;
        }
        // If it's a string, check if it can be parsed as an array
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                    return true;
                }
                // Also check if it's a comma-separated string
                const splitValues = value.split(',').map(lang => lang.trim()).filter(lang => lang);
                if (splitValues.length >= 0) { // Allow empty arrays
                    return true;
                }
            }
            catch (e) {
                // If it's not valid JSON, try to split by commas
                const splitValues = value.split(',').map(lang => lang.trim()).filter(lang => lang);
                if (splitValues.length >= 0) { // Allow empty arrays
                    return true;
                }
            }
        }
        // If it's undefined, that's also acceptable
        if (value === undefined) {
            return true;
        }
        // If none of the conditions are met, throw an error
        throw new Error('Languages must be an array or a comma-separated string');
    }),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['draft', 'published'])
        .withMessage('Status must be either draft or published'),
    (0, express_validator_1.body)('githubUrl')
        .optional()
        .custom((value) => {
        // Allow empty/null values or valid URLs
        if (!value)
            return true;
        try {
            new URL(value);
            return true;
        }
        catch {
            return false;
        }
    })
        .withMessage('GitHub URL must be a valid URL'),
    (0, express_validator_1.body)('liveUrl')
        .optional()
        .custom((value) => {
        // Allow empty/null values or valid URLs
        if (!value)
            return true;
        try {
            new URL(value);
            return true;
        }
        catch {
            return false;
        }
    })
        .withMessage('Live URL must be a valid URL'),
    (0, express_validator_1.body)('featured')
        .optional()
        .isBoolean()
        .withMessage('Featured must be a boolean'),
    async (req, res) => {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            // Handle image uploads
            let imageResults;
            try {
                imageResults = await (0, imageUploadHandler_1.handleProjectImageUpload)(req);
            }
            catch (imageError) {
                return res.status(400).json({ error: imageError.message });
            }
            const { title, description, tags, languages, githubUrl, liveUrl, featured, status } = req.body;
            const { id } = req.params;
            if (!isValidProjectId(id)) {
                return res.status(404).json({ error: 'Project not found' });
            }
            const updateData = {};
            if (title !== undefined) {
                updateData.title = title;
                updateData.slug = await resolveUniqueProjectSlug(title, id);
            }
            if (description !== undefined)
                updateData.description = description;
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
            // Parse languages if it's a string (from form data)
            if (languages !== undefined) {
                if (typeof languages === 'string') {
                    try {
                        updateData.languages = JSON.parse(languages);
                    }
                    catch (e) {
                        // If it's not JSON, split by comma as fallback
                        updateData.languages = languages.split(',').map((lang) => lang.trim()).filter((lang) => lang);
                    }
                }
                else {
                    updateData.languages = languages;
                }
            }
            if (githubUrl !== undefined)
                updateData.githubUrl = githubUrl;
            if (liveUrl !== undefined)
                updateData.liveUrl = liveUrl;
            if (featured !== undefined)
                updateData.featured = featured;
            if (status !== undefined)
                updateData.status = status;
            if (imageResults.thumbnail !== undefined)
                updateData.thumbnail = imageResults.thumbnail;
            if (imageResults.screenshots !== undefined)
                updateData.screenshots = imageResults.screenshots;
            const project = await Project_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }
            res.json({
                message: 'Project updated successfully',
                project
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Server error while updating project' });
        }
    }
];
exports.updateProject = [
    (0, express_validator_1.body)('title')
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be less than 200 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Description must be less than 1000 characters'),
    (0, express_validator_1.body)('tags')
        .optional()
        .custom((value) => {
        // Check if it's an array with at least one item
        if (Array.isArray(value) && value.length >= 1) {
            return true;
        }
        // If it's a string, check if it can be parsed as an array with at least one item
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed) && parsed.length >= 1) {
                    return true;
                }
                // Also check if it's a comma-separated string
                const splitValues = value.split(',').map(tag => tag.trim()).filter(tag => tag);
                if (splitValues.length >= 1) {
                    return true;
                }
            }
            catch (e) {
                // If it's not valid JSON, try to split by commas
                const splitValues = value.split(',').map(tag => tag.trim()).filter(tag => tag);
                if (splitValues.length >= 1) {
                    return true;
                }
            }
        }
        // If neither condition is met, throw an error
        throw new Error('Tags must be an array with at least one item');
    }),
    (0, express_validator_1.body)('languages')
        .optional()
        .custom((value) => {
        // Check if it's an array
        if (Array.isArray(value)) {
            return true;
        }
        // If it's a string, check if it can be parsed as an array
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                    return true;
                }
                // Also check if it's a comma-separated string
                const splitValues = value.split(',').map(lang => lang.trim()).filter(lang => lang);
                if (splitValues.length >= 0) { // Allow empty arrays
                    return true;
                }
            }
            catch (e) {
                // If it's not valid JSON, try to split by commas
                const splitValues = value.split(',').map(lang => lang.trim()).filter(lang => lang);
                if (splitValues.length >= 0) { // Allow empty arrays
                    return true;
                }
            }
        }
        // If it's undefined, that's also acceptable
        if (value === undefined) {
            return true;
        }
        // If none of the conditions are met, throw an error
        throw new Error('Languages must be an array or a comma-separated string');
    }),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['draft', 'published'])
        .withMessage('Status must be either draft or published'),
    (0, express_validator_1.body)('githubUrl')
        .optional()
        .custom((value) => {
        // Allow empty/null values or valid URLs
        if (!value)
            return true;
        try {
            new URL(value);
            return true;
        }
        catch {
            return false;
        }
    })
        .withMessage('GitHub URL must be a valid URL'),
    (0, express_validator_1.body)('liveUrl')
        .optional()
        .custom((value) => {
        // Allow empty/null values or valid URLs
        if (!value)
            return true;
        try {
            new URL(value);
            return true;
        }
        catch {
            return false;
        }
    })
        .withMessage('Live URL must be a valid URL'),
    (0, express_validator_1.body)('featured')
        .optional()
        .isBoolean()
        .withMessage('Featured must be a boolean'),
    async (req, res) => {
        try {
            const { id } = req.params;
            if (!isValidProjectId(id)) {
                return res.status(404).json({ error: 'Project not found' });
            }
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { title, description, tags, languages, githubUrl, liveUrl, featured, status, thumbnail, screenshots } = req.body;
            const updateData = {};
            if (title !== undefined) {
                updateData.title = title;
                updateData.slug = await resolveUniqueProjectSlug(title, id);
            }
            if (description !== undefined)
                updateData.description = description;
            if (tags !== undefined)
                updateData.tags = tags;
            if (languages !== undefined)
                updateData.languages = languages;
            if (githubUrl !== undefined)
                updateData.githubUrl = githubUrl;
            if (liveUrl !== undefined)
                updateData.liveUrl = liveUrl;
            if (featured !== undefined)
                updateData.featured = featured;
            if (status !== undefined)
                updateData.status = status;
            if (thumbnail !== undefined)
                updateData.thumbnail = thumbnail;
            if (screenshots !== undefined)
                updateData.screenshots = screenshots;
            const project = await Project_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }
            res.json({
                message: 'Project updated successfully',
                project
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Server error while updating project' });
        }
    }
];
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidProjectId(id)) {
            return res.status(404).json({ error: 'Project not found' });
        }
        const project = await Project_1.default.findByIdAndDelete(id);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json({ message: 'Project deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error while deleting project' });
    }
};
exports.deleteProject = deleteProject;
const getProjectBySlug = async (req, res) => {
    try {
        const project = await Project_1.default.findOne({ slug: req.params.slug, status: 'published' });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json(project);
    }
    catch (error) {
        console.error('Error in getProjectBySlug:', error);
        res.status(500).json({ error: 'Server error while fetching project by slug' });
    }
};
exports.getProjectBySlug = getProjectBySlug;
const migrateProjectSlugs = async (req, res) => {
    try {
        const projectsWithoutSlug = await Project_1.default.find({
            $or: [
                { slug: { $exists: false } },
                { slug: null },
                { slug: '' }
            ]
        }).select('_id title slug');
        let updatedCount = 0;
        for (const project of projectsWithoutSlug) {
            const slug = await resolveUniqueProjectSlug(project.title, String(project._id));
            project.slug = slug;
            await project.save();
            updatedCount += 1;
        }
        res.json({
            message: 'Project slug migration completed',
            scanned: projectsWithoutSlug.length,
            updated: updatedCount
        });
    }
    catch (error) {
        console.error('Error in migrateProjectSlugs:', error);
        res.status(500).json({ error: 'Server error while migrating project slugs' });
    }
};
exports.migrateProjectSlugs = migrateProjectSlugs;
//# sourceMappingURL=projectController.js.map