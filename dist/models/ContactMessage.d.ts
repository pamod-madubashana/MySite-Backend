import mongoose, { Document } from 'mongoose';
export type ContactMessageStatus = 'new' | 'read' | 'replied';
export interface IContactReply {
    subject: string;
    body: string;
    includeOriginal: boolean;
    sentAt: Date;
    sentBy: 'admin';
    toEmail: string;
}
export interface IContactMessage extends Document {
    name: string;
    email: string;
    message: string;
    ip: string;
    userAgent: string;
    status: ContactMessageStatus;
    replies: IContactReply[];
    lastRepliedAt?: Date;
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