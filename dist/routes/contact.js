"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const contactController_1 = require("../controllers/contactController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const contactLimiter = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({ ok: false, error: 'Too many requests. Please try again later.' });
    },
});
router.post('/', contactLimiter, contactController_1.submitContactMessage);
router.get('/messages', auth_1.authenticateToken, auth_1.requireAdmin, contactController_1.getContactMessages);
router.patch('/messages/:id/status', auth_1.authenticateToken, auth_1.requireAdmin, contactController_1.updateContactMessageStatus);
exports.default = router;
//# sourceMappingURL=contact.js.map