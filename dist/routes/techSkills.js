"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const techSkillsController_1 = require("../controllers/techSkillsController");
const router = express_1.default.Router();
// Public route for getting tech skills (no authentication required)
router.get('/public', techSkillsController_1.getAllTechSkills);
// All admin tech skills routes require admin authentication
router.use(auth_1.authenticateToken);
router.use(auth_1.requireAdmin);
// Get all tech skills (admin only)
router.get('/', techSkillsController_1.getAllTechSkills);
// Get a specific tech skill
router.get('/:id', techSkillsController_1.getTechSkillById);
// Create a new tech skill
router.post('/', techSkillsController_1.createTechSkill);
// Update a tech skill
router.put('/:id', techSkillsController_1.updateTechSkill);
// Delete a tech skill
router.delete('/:id', techSkillsController_1.deleteTechSkill);
exports.default = router;
//# sourceMappingURL=techSkills.js.map