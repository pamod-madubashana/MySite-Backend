import { Request, Response } from 'express';
export declare const getAllInterests: (req: Request, res: Response) => Promise<void>;
export declare const getInterestById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createInterest: (req: Request, res: Response) => Promise<void>;
export declare const updateInterest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteInterest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=interestsController.d.ts.map