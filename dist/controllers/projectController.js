"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.createProject = exports.getProjectById = exports.getAllProjects = exports.getPublishedProjects = void 0;
const express_validator_1 = require("express-validator");
const Project_1 = __importDefault(require("../models/Project"));
const getPublishedProjects = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, featured } = req.query;
        const query = { status: 'published' };
        if (search) {
            query.$text = { $search: search };
        }
        if (featured === 'true') {
            query.featured = true;
        }
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
    catch (error) {
        res.status(500).json({ error: 'Server error while fetching projects' });
    }
};
exports.getPublishedProjects = getPublishedProjects;
const getAllProjects = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, status, featured } = req.query;
        const query = {};
        if (search) {
            query.$text = { $search: search };
        }
        if (status) {
            query.status = status;
        }
        if (featured !== undefined) {
            query.featured = featured === 'true';
        }
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
    catch (error) {
        res.status(500).json({ error: 'Server error while fetching projects' });
    }
};
exports.getAllProjects = getAllProjects;
const getProjectById = async (req, res) => {
    try {
        const project = await Project_1.default.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error while fetching project' });
    }
};
exports.getProjectById = getProjectById;
exports.createProject = [
    (0, express_validator_1.body)('title')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Title is required and must be less than 200 characters'),
    (0, express_validator_1.body)('description')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Description is required and must be less than 1000 characters'),
    (0, express_validator_1.body)('techStack')
        .isArray({ min: 1 })
        .withMessage('Tech stack must be an array with at least one item'),
    (0, express_validator_1.body)('status')
        .isIn(['draft', 'published'])
        .withMessage('Status must be either draft or published'),
    (0, express_validator_1.body)('githubUrl')
        .optional()
        .isURL()
        .withMessage('GitHub URL must be a valid URL'),
    (0, express_validator_1.body)('liveUrl')
        .optional()
        .isURL()
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
            const { title, description, techStack, githubUrl, liveUrl, featured, status, thumbnail, screenshots } = req.body;
            const project = new Project_1.default({
                title,
                description,
                techStack,
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
    (0, express_validator_1.body)('techStack')
        .optional()
        .isArray({ min: 1 })
        .withMessage('Tech stack must be an array with at least one item'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['draft', 'published'])
        .withMessage('Status must be either draft or published'),
    (0, express_validator_1.body)('githubUrl')
        .optional()
        .isURL()
        .withMessage('GitHub URL must be a valid URL'),
    (0, express_validator_1.body)('liveUrl')
        .optional()
        .isURL()
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
            const { title, description, techStack, githubUrl, liveUrl, featured, status, thumbnail, screenshots } = req.body;
            const updateData = {};
            if (title !== undefined)
                updateData.title = title;
            if (description !== undefined)
                updateData.description = description;
            if (techStack !== undefined)
                updateData.techStack = techStack;
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
            const project = await Project_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
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
        const project = await Project_1.default.findByIdAndDelete(req.params.id);
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
//# sourceMappingURL=projectController.js.map