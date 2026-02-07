"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const dashboardController_1 = require("../controllers/dashboardController");
const seedController_1 = require("../controllers/seedController");
const router = (0, express_1.Router)();
// All dashboard routes require admin authentication
router.use(auth_1.authenticateToken);
router.use(auth_1.requireAdmin);
// Get dashboard statistics
router.get('/stats', dashboardController_1.getDashboardStats);
// Get detailed analytics
router.get('/analytics', dashboardController_1.getAnalytics);
// Seed database with default values
router.post('/seed', seedController_1.seedDatabase);
exports.default = router;
//# sourceMappingURL=dashboard.js.map