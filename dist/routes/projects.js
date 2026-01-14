"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const projectController_1 = require("../controllers/projectController");
const router = (0, express_1.Router)();
// Public routes - only published projects
router.get('/', projectController_1.getPublishedProjects);
router.get('/:id', projectController_1.getProjectById);
// Admin routes - requires authentication
router.use(auth_1.authenticateToken);
router.use(auth_1.requireAdmin);
router.get('/all', projectController_1.getAllProjects); // Get all projects (including drafts)
router.post('/', projectController_1.createProject);
router.put('/:id', projectController_1.updateProject);
router.delete('/:id', projectController_1.deleteProject);
exports.default = router;
//# sourceMappingURL=projects.js.map