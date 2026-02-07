"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const imageUploadController_1 = require("../controllers/imageUploadController");
// Configure multer for handling multipart/form-data
const storage = multer_1.default.memoryStorage(); // Store files in memory as buffers
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit
    },
});
const router = express_1.default.Router();
// POST route for image upload
router.post('/upload', upload.single('image'), imageUploadController_1.uploadImage);
exports.default = router;
//# sourceMappingURL=imageUpload.js.map