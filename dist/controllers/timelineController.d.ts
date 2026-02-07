import { Request, Response } from 'express';
export declare const getAllTimelineItems: (req: Request, res: Response) => Promise<void>;
export declare const getTimelineItemById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createTimelineItem: (req: Request, res: Response) => Promise<void>;
export declare const updateTimelineItem: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteTimelineItem: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=timelineController.d.ts.map