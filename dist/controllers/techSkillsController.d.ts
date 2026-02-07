import { Request, Response } from 'express';
export declare const getAllTechSkills: (req: Request, res: Response) => Promise<void>;
export declare const getTechSkillById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createTechSkill: (req: Request, res: Response) => Promise<void>;
export declare const updateTechSkill: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteTechSkill: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=techSkillsController.d.ts.map