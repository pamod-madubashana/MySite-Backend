import mongoose, { Document } from 'mongoose';
export type ContactMessageStatus = 'new' | 'read';
export interface IContactMessage extends Document {
    name: string;
    email: string;
    message: string;
    ip: string;
    userAgent: string;
    status: ContactMessageStatus;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IContactMessage, {}, {}, {}, mongoose.Document<unknown, {}, IContactMessage, {}, {}> & IContactMessage & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=ContactMessage.d.ts.map