"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const articleController_1 = require("../controllers/articleController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.get('/', articleController_1.getPublishedArticles);
router.get('/:id', articleController_1.getArticleById);
// Admin routes
router.use(auth_1.authenticateToken);
router.use(auth_1.requireAdmin);
router.post('/', articleController_1.createArticle);
router.put('/:id', articleController_1.updateArticle);
router.delete('/:id', articleController_1.deleteArticle);
exports.default = router;
//# sourceMappingURL=articles.js.map