import { Request, Response } from 'express';
export declare const register: (import("express-validator").ValidationChain | ((req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>))[];
export declare const login: (import("express-validator").ValidationChain | ((req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>))[];
export declare const getProfile: (req: any, res: Response) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map