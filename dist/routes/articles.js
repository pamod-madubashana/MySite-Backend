"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const articleController_1 = require("../controllers/articleController");
const auth_1 = require("../middleware/auth");
// Configure multer for handling multipart/form-data
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
const router = (0, express_1.Router)();
// Public routes
router.get('/', articleController_1.getPublishedArticles);
router.get('/all', auth_1.authenticateToken, auth_1.requireAdmin, articleController_1.getAllArticles);
router.get('/:id', articleController_1.getArticleById);
// Admin routes
router.use(auth_1.authenticateToken);
router.use(auth_1.requireAdmin);
// Regular article routes (without image upload)
router.post('/', articleController_1.createArticle);
router.put('/:id', articleController_1.updateArticle);
router.delete('/:id', articleController_1.deleteArticle);
// Article routes with image upload capability
router.post('/upload', upload.single('featuredImage'), articleController_1.createArticleWithImage);
router.put('/upload/:id', upload.single('featuredImage'), articleController_1.updateArticleWithImage);
exports.default = router;
//# sourceMappingURL=articles.js.map