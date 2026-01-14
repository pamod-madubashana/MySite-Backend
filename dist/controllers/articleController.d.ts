import { Request, Response } from 'express';
export declare const getPublishedArticles: (req: Request, res: Response) => Promise<void>;
export declare const getAllArticles: (req: Request, res: Response) => Promise<void>;
export declare const getArticleById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createArticle: (import("express-validator").ValidationChain | ((req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>))[];
export declare const updateArticle: (import("express-validator").ValidationChain | ((req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>))[];
export declare const deleteArticle: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=articleController.d.ts.map