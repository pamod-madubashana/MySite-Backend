"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const enhancedDashboardController_1 = require("../controllers/enhancedDashboardController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/dashboard', auth_1.authenticateToken, enhancedDashboardController_1.getEnhancedDashboardData);
router.get('/timeline', enhancedDashboardController_1.getTimeline);
router.get('/interests', enhancedDashboardController_1.getInterests);
router.get('/tech-skills', enhancedDashboardController_1.getTechSkills);
exports.default = router;
//# sourceMappingURL=enhancedDashboard.js.map