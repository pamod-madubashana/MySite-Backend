import mongoose, { Document } from 'mongoose';
export interface ISettings extends Document {
    aboutContent: string;
    featuredRepos: string[];
    themeOptions: {
        primaryColor: string;
        secondaryColor: string;
        fontFamily: string;
    };
    siteSections: {
        showAbout: boolean;
        showProjects: boolean;
        showArticles: boolean;
        showContact: boolean;
    };
    socialLinks: {
        github?: string;
        linkedin?: string;
        twitter?: string;
        email?: string;
    };
    githubUsername?: string;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ISettings, {}, {}, {}, mongoose.Document<unknown, {}, ISettings, {}, {}> & ISettings & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Settings.d.ts.map