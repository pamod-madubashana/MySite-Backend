import { Request, Response } from 'express';
export declare const getAllTechStackCategories: (req: Request, res: Response) => Promise<void>;
export declare const getTechStackCategoryById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createTechStackCategory: (req: Request, res: Response) => Promise<void>;
export declare const updateTechStackCategory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteTechStackCategory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=techStackCategoryController.d.ts.map