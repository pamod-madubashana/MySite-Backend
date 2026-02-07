"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const techStackCategoryController_1 = require("../controllers/techStackCategoryController");
const router = express_1.default.Router();
// Public route for getting tech stack categories (no authentication required)
router.get('/public', techStackCategoryController_1.getAllTechStackCategories);
// All admin tech stack categories routes require admin authentication
router.use(auth_1.authenticateToken);
router.use(auth_1.requireAdmin);
// Get all tech stack categories (admin only)
router.get('/', techStackCategoryController_1.getAllTechStackCategories);
// Get a specific tech stack category
router.get('/:id', techStackCategoryController_1.getTechStackCategoryById);
// Create a new tech stack category
router.post('/', techStackCategoryController_1.createTechStackCategory);
// Update a tech stack category
router.put('/:id', techStackCategoryController_1.updateTechStackCategory);
// Delete a tech stack category
router.delete('/:id', techStackCategoryController_1.deleteTechStackCategory);
exports.default = router;
//# sourceMappingURL=techStackCategories.js.map