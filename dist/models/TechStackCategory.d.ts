import mongoose, { Document } from 'mongoose';
export interface ITechStackCategory extends Document {
    title: string;
    icon: string;
    skills: string[];
    order: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ITechStackCategory, {}, {}, {}, mongoose.Document<unknown, {}, ITechStackCategory, {}, {}> & ITechStackCategory & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=TechStackCategory.d.ts.map