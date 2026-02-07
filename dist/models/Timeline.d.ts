import mongoose, { Document } from 'mongoose';
export interface ITimeline extends Document {
    year: string;
    role: string;
    company?: string;
    description: string;
    icon: string;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ITimeline, {}, {}, {}, mongoose.Document<unknown, {}, ITimeline, {}, {}> & ITimeline & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Timeline.d.ts.map