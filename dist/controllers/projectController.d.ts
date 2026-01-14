import { Request, Response } from 'express';
export declare const getPublishedProjects: (req: Request, res: Response) => Promise<void>;
export declare const getAllProjects: (req: Request, res: Response) => Promise<void>;
export declare const getProjectById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createProject: (import("express-validator").ValidationChain | ((req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>))[];
export declare const updateProject: (import("express-validator").ValidationChain | ((req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>))[];
export declare const deleteProject: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=projectController.d.ts.map