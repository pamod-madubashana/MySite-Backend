import express from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/imageUploadController';

// Configure multer for handling multipart/form-data
const storage = multer.memoryStorage(); // Store files in memory as buffers
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
});

const router = express.Router();

// POST route for image upload
router.post('/upload', upload.single('image'), uploadImage);

export default router;