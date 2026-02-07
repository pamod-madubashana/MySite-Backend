import mongoose, { Document } from 'mongoose';
export interface ITechSkill extends Document {
    name: string;
    level: number;
    category?: string;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ITechSkill, {}, {}, {}, mongoose.Document<unknown, {}, ITechSkill, {}, {}> & ITechSkill & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=TechSkills.d.ts.map