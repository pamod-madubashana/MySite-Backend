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
const replyLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({ ok: false, error: 'Too many reply attempts. Please try again later.' });
    },
});
router.use(auth_1.authenticateToken);
router.use(auth_1.requireAdmin);
router.post('/messages/:id/reply', replyLimiter, contactController_1.replyToContactMessage);
exports.default = router;
//# sourceMappingURL=adminMessages.js.map