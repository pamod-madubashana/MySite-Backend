import mongoose, { Document } from 'mongoose';
export interface IArticle extends Document {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    status: 'draft' | 'published';
    tags: string[];
    featuredImage?: string;
    author: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IArticle, {}, {}, {}, mongoose.Document<unknown, {}, IArticle, {}, {}> & IArticle & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Article.d.ts.map