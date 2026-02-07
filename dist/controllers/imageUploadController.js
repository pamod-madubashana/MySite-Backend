"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const crypto_1 = __importDefault(require("crypto"));
const uploadImage = async (req, res) => {
    try {
        // Access environment variables at runtime, not at module load time
        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        const GITHUB_ASSETS_REPO = process.env.GITHUB_ASSETS_REPO || '';
        const GITHUB_ASSETS_BRANCH = process.env.GITHUB_ASSETS_BRANCH || 'main';
        // Check if required environment variables are set
        if (!GITHUB_TOKEN) {
            res.status(500).json({
                success: false,
                message: 'Server configuration error: GITHUB_TOKEN is not set'
            });
            return;
        }
        if (!GITHUB_ASSETS_REPO) {
            res.status(500).json({
                success: false,
                message: 'Server configuration error: GITHUB_ASSETS_REPO is not set'
            });
            return;
        }
        // Check if file exists
        if (!req.file) {
            res.status(400).json({ success: false, message: 'No file uploaded' });
            return;
        }
        const { buffer, originalname, mimetype } = req.file;
        // Validate file type
        const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/webp'];
        if (!allowedMimeTypes.includes(mimetype)) {
            res.status(400).json({
                success: false,
                message: 'Invalid file type. Only PNG, JPEG, and WebP images are allowed.',
            });
            return;
        }
        // Validate file size (max 2MB)
        if (buffer.length > 2 * 1024 * 1024) {
            res.status(400).json({
                success: false,
                message: 'File size exceeds 2MB limit.',
            });
            return;
        }
        // Generate a cryptographically safe random filename
        // Determine the correct extension based on the allowed mime types
        let fileExtension;
        switch (mimetype) {
            case 'image/png':
                fileExtension = 'png';
                break;
            case 'image/jpeg':
                fileExtension = 'jpeg';
                break;
            case 'image/webp':
                fileExtension = 'webp';
                break;
            default:
                fileExtension = 'webp'; // fallback
        }
        const randomFileName = `${crypto_1.default.randomBytes(16).toString('hex')}.${fileExtension}`;
        // Create the file path in the format: images/uploads/YYYY/MM/<random-filename>.webp
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const filePath = `images/uploads/${year}/${month}/${randomFileName}`;
        // Convert buffer to base64
        const base64Content = buffer.toString('base64');
        // Prepare GitHub API request
        const apiUrl = `https://api.github.com/repos/${GITHUB_ASSETS_REPO}/contents/${filePath}`;
        const requestBody = {
            message: `Upload image: ${randomFileName}`,
            content: base64Content,
            branch: GITHUB_ASSETS_BRANCH,
        };
        // Make request to GitHub API
        const githubResponse = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Node.js Image Uploader',
            },
            body: JSON.stringify(requestBody),
        });
        if (!githubResponse.ok) {
            const errorData = await githubResponse.json().catch(() => ({ message: 'Unknown error' }));
            console.error('GitHub API error:', errorData);
            res.status(500).json({
                success: false,
                message: 'Failed to upload image to GitHub',
            });
            return;
        }
        const responseData = await githubResponse.json();
        // Construct the raw.githubusercontent.com URL
        const imageUrl = `https://raw.githubusercontent.com/${GITHUB_ASSETS_REPO}/${GITHUB_ASSETS_BRANCH}/${filePath}`;
        res.status(200).json({
            success: true,
            imageUrl,
        });
    }
    catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during image upload',
        });
    }
};
exports.uploadImage = uploadImage;
//# sourceMappingURL=imageUploadController.js.map