import { Request } from 'express';
import { uploadImage } from '../controllers/imageUploadController';
export { uploadImage };
export declare const handleArticleImageUpload: (req: Request) => Promise<string | undefined>;
export declare const handleProjectImageUpload: (req: Request) => Promise<{
    thumbnail?: string;
    screenshots?: string[];
}>;
//# sourceMappingURL=imageUploadHandler.d.ts.map