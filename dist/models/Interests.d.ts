import mongoose, { Document } from 'mongoose';
export interface IInterests extends Document {
    icon: string;
    label: string;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IInterests, {}, {}, {}, mongoose.Document<unknown, {}, IInterests, {}, {}> & IInterests & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Interests.d.ts.map