"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const projectController_1 = require("../controllers/projectController");
const multer_1 = __importDefault(require("multer"));
// Configure multer for handling multipart/form-data
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
const router = (0, express_1.Router)();
// Public routes - only published projects
router.get('/', projectController_1.getPublishedProjects);
// Specific route for 'all' to avoid conflict with :id parameter
router.get('/all', auth_1.authenticateToken, auth_1.requireAdmin, projectController_1.getAllProjects); // Get all projects (including drafts) - requires auth
// Specific route for slug-based lookup must come before :id
router.get('/slug/:slug', projectController_1.getProjectBySlug); // Get published project by slug - public
// One-time admin route to backfill project slugs
router.post('/migrate-slugs', auth_1.authenticateToken, auth_1.requireAdmin, projectController_1.migrateProjectSlugs);
// Route for specific project by ID - must come after /all to avoid conflict
router.get('/:id', projectController_1.getProjectById); // Get specific project by ID - public
// Admin routes for CRUD operations
// Regular project routes (without image upload)
router.post('/', auth_1.authenticateToken, auth_1.requireAdmin, projectController_1.createProject);
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, projectController_1.updateProject);
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, projectController_1.deleteProject);
// Project routes with image upload capability
// Handle both thumbnail and screenshots for creation
router.post('/upload', auth_1.authenticateToken, auth_1.requireAdmin, upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'screenshots', maxCount: 10 }
]), projectController_1.createProjectWithImage);
// Handle both thumbnail and screenshots for updates
router.put('/upload/:id', auth_1.authenticateToken, auth_1.requireAdmin, upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'screenshots', maxCount: 10 }
]), projectController_1.updateProjectWithImage);
exports.default = router;
//# sourceMappingURL=projects.js.map