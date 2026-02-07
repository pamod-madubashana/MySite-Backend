"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleProjectImageUpload = exports.handleArticleImageUpload = exports.uploadImage = void 0;
const imageUploadController_1 = require("../controllers/imageUploadController");
Object.defineProperty(exports, "uploadImage", { enumerable: true, get: function () { return imageUploadController_1.uploadImage; } });
// Helper function to handle image upload for articles
const handleArticleImageUpload = async (req) => {
    if (!req.file) {
        return undefined;
    }
    // Create a temporary request object to pass to uploadImage
    const tempReq = {
        ...req,
        file: req.file
    };
    // Create a temporary response object to capture the result
    let imageUrlResult = undefined;
    let errorResult = null;
    const tempRes = {
        status: function (code) {
            // We'll handle the status internally
            return this;
        },
        json: function (data) {
            if (data.success && data.imageUrl) {
                imageUrlResult = data.imageUrl;
            }
            else {
                errorResult = data;
            }
        },
        // Add other needed methods
    };
    await (0, imageUploadController_1.uploadImage)(tempReq, tempRes);
    if (errorResult) {
        throw new Error(errorResult.message || 'Failed to upload image');
    }
    return imageUrlResult;
};
exports.handleArticleImageUpload = handleArticleImageUpload;
// Helper function to handle image upload for projects
const handleProjectImageUpload = async (req) => {
    const result = {};
    // Handle single file upload (legacy case)
    if (req.file) {
        // Single file upload (for thumbnail)
        const tempReq = {
            ...req,
            file: req.file
        };
        let imageUrlResult = undefined;
        let errorResult = null;
        const tempRes = {
            status: function (code) {
                return this;
            },
            json: function (data) {
                if (data.success && data.imageUrl) {
                    imageUrlResult = data.imageUrl;
                }
                else {
                    errorResult = data;
                }
            },
        };
        await (0, imageUploadController_1.uploadImage)(tempReq, tempRes);
        if (errorResult) {
            throw new Error(errorResult.message || 'Failed to upload image');
        }
        result.thumbnail = imageUrlResult;
    }
    else if (req.files && typeof req.files === 'object' && !Array.isArray(req.files)) {
        // Handle named fields from upload.fields() - { thumbnail: [file], screenshots: [file1, file2, ...] }
        // Process thumbnail if provided
        if (req.files['thumbnail'] && Array.isArray(req.files['thumbnail']) && req.files['thumbnail'].length > 0) {
            const thumbnailFile = req.files['thumbnail'][0];
            const tempReq = {
                ...req,
                file: thumbnailFile
            };
            let imageUrlResult = undefined;
            let errorResult = null;
            const tempRes = {
                status: function (code) {
                    return this;
                },
                json: function (data) {
                    if (data.success && data.imageUrl) {
                        imageUrlResult = data.imageUrl;
                    }
                    else {
                        errorResult = data;
                    }
                },
            };
            await (0, imageUploadController_1.uploadImage)(tempReq, tempRes);
            if (errorResult) {
                throw new Error(errorResult.message || 'Failed to upload thumbnail');
            }
            result.thumbnail = imageUrlResult;
        }
        // Process screenshots if provided
        if (req.files['screenshots'] && Array.isArray(req.files['screenshots']) && req.files['screenshots'].length > 0) {
            const screenshotUrls = [];
            for (const file of req.files['screenshots']) {
                const tempReq = {
                    ...req,
                    file: file
                };
                let imageUrlResult = undefined;
                let errorResult = null;
                const tempRes = {
                    status: function (code) {
                        return this;
                    },
                    json: function (data) {
                        if (data.success && data.imageUrl) {
                            imageUrlResult = data.imageUrl;
                        }
                        else {
                            errorResult = data;
                        }
                    },
                };
                await (0, imageUploadController_1.uploadImage)(tempReq, tempRes);
                if (errorResult) {
                    throw new Error(errorResult.message || 'Failed to upload screenshot');
                }
                if (imageUrlResult) {
                    screenshotUrls.push(imageUrlResult);
                }
            }
            result.screenshots = screenshotUrls;
        }
    }
    else if (req.files && Array.isArray(req.files)) {
        // Multiple file upload (for screenshots - fallback)
        const screenshotUrls = [];
        for (const file of req.files) {
            const tempReq = {
                ...req,
                file: file
            };
            let imageUrlResult = undefined;
            let errorResult = null;
            const tempRes = {
                status: function (code) {
                    return this;
                },
                json: function (data) {
                    if (data.success && data.imageUrl) {
                        imageUrlResult = data.imageUrl;
                    }
                    else {
                        errorResult = data;
                    }
                },
            };
            await (0, imageUploadController_1.uploadImage)(tempReq, tempRes);
            if (errorResult) {
                throw new Error(errorResult.message || 'Failed to upload image');
            }
            if (imageUrlResult) {
                screenshotUrls.push(imageUrlResult);
            }
        }
        result.screenshots = screenshotUrls;
    }
    return result;
};
exports.handleProjectImageUpload = handleProjectImageUpload;
//# sourceMappingURL=imageUploadHandler.js.map