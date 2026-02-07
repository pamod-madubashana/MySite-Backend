"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const interestsController_1 = require("../controllers/interestsController");
const router = express_1.default.Router();
// Public route for getting interests (no authentication required)
router.get('/public', interestsController_1.getAllInterests);
// All admin interests routes require admin authentication
router.use(auth_1.authenticateToken);
router.use(auth_1.requireAdmin);
// Get all interests (admin only)
router.get('/', interestsController_1.getAllInterests);
// Get a specific interest
router.get('/:id', interestsController_1.getInterestById);
// Create a new interest
router.post('/', interestsController_1.createInterest);
// Update an interest
router.put('/:id', interestsController_1.updateInterest);
// Delete an interest
router.delete('/:id', interestsController_1.deleteInterest);
exports.default = router;
//# sourceMappingURL=interests.js.map