"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const timelineController_1 = require("../controllers/timelineController");
const router = express_1.default.Router();
// Public route for getting timeline items (no authentication required)
router.get('/public', timelineController_1.getAllTimelineItems);
// All admin timeline routes require admin authentication
router.use(auth_1.authenticateToken);
router.use(auth_1.requireAdmin);
// Get all timeline items (admin only)
router.get('/', timelineController_1.getAllTimelineItems);
// Get a specific timeline item
router.get('/:id', timelineController_1.getTimelineItemById);
// Create a new timeline item
router.post('/', timelineController_1.createTimelineItem);
// Update a timeline item
router.put('/:id', timelineController_1.updateTimelineItem);
// Delete a timeline item
router.delete('/:id', timelineController_1.deleteTimelineItem);
exports.default = router;
//# sourceMappingURL=timeline.js.map