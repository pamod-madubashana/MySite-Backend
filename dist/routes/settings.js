"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settingsController_1 = require("../controllers/settingsController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public route
router.get('/', settingsController_1.getSettings);
// Admin routes
router.use(auth_1.authenticateToken);
router.use(auth_1.requireAdmin);
router.put('/', settingsController_1.updateSettings);
exports.default = router;
//# sourceMappingURL=settings.js.map