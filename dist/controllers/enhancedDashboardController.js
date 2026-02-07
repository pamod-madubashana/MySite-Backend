"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTechSkills = exports.getInterests = exports.getTimeline = exports.getEnhancedDashboardData = void 0;
const Article_1 = __importDefault(require("../models/Article"));
const Project_1 = __importDefault(require("../models/Project"));
const Timeline_1 = __importDefault(require("../models/Timeline"));
const Interests_1 = __importDefault(require("../models/Interests"));
const TechSkills_1 = __importDefault(require("../models/TechSkills"));
const getEnhancedDashboardData = async (req, res) => {
    try {
        // Get counts for articles and projects
        const [articlesCount, projectsCount, timelineCount, interestsCount, techSkillsCount] = await Promise.all([
            Article_1.default.countDocuments(),
            Project_1.default.countDocuments(),
            Timeline_1.default.countDocuments(),
            Interests_1.default.countDocuments(),
            TechSkills_1.default.countDocuments()
        ]);
        // Get recent articles and projects
        const recentArticles = await Article_1.default.find()
            .populate('author', 'username')
            .sort({ createdAt: -1 })
            .limit(5)
            .select('_id title status createdAt author');
        const recentProjects = await Project_1.default.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('_id title status createdAt');
        // Get published counts
        const publishedArticlesCount = await Article_1.default.countDocuments({ status: 'published' });
        const publishedProjectsCount = await Project_1.default.countDocuments({ status: 'published' });
        // Calculate engagement (mock data for now, can be expanded with real metrics)
        const engagementData = {
            views: 12400,
            rate: '64%',
            change: '+18%'
        };
        res.status(200).json({
            stats: {
                articles: {
                    total: articlesCount,
                    published: publishedArticlesCount,
                    drafts: articlesCount - publishedArticlesCount,
                    change: '+12%'
                },
                projects: {
                    total: projectsCount,
                    published: publishedProjectsCount,
                    drafts: projectsCount - publishedProjectsCount,
                    change: '+3'
                },
                timeline: {
                    total: timelineCount
                },
                interests: {
                    total: interestsCount
                },
                techSkills: {
                    total: techSkillsCount
                },
                users: {
                    total: 1200,
                    change: '+8%'
                },
                engagement: engagementData
            },
            recentActivity: [
                ...recentArticles.map(article => ({
                    id: article._id.toString(),
                    title: article.title,
                    type: 'article',
                    date: article.createdAt.toISOString(),
                    status: article.status,
                    author: article.author ? article.author.username : 'Unknown'
                })),
                ...recentProjects.map(project => ({
                    id: project._id.toString(),
                    title: project.title,
                    type: 'project',
                    date: project.createdAt.toISOString(),
                    status: project.status,
                    author: 'System'
                }))
            ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
        });
    }
    catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
};
exports.getEnhancedDashboardData = getEnhancedDashboardData;
const getTimeline = async (req, res) => {
    try {
        const timeline = await Timeline_1.default.find().sort({ order: 1, createdAt: 1 });
        res.status(200).json(timeline);
    }
    catch (error) {
        console.error('Error fetching timeline:', error);
        res.status(500).json({ error: 'Failed to fetch timeline data' });
    }
};
exports.getTimeline = getTimeline;
const getInterests = async (req, res) => {
    try {
        const interests = await Interests_1.default.find().sort({ order: 1, createdAt: 1 });
        res.status(200).json(interests);
    }
    catch (error) {
        console.error('Error fetching interests:', error);
        res.status(500).json({ error: 'Failed to fetch interests data' });
    }
};
exports.getInterests = getInterests;
const getTechSkills = async (req, res) => {
    try {
        const techSkills = await TechSkills_1.default.find().sort({ order: 1, createdAt: 1 });
        res.status(200).json(techSkills);
    }
    catch (error) {
        console.error('Error fetching tech skills:', error);
        res.status(500).json({ error: 'Failed to fetch tech skills data' });
    }
};
exports.getTechSkills = getTechSkills;
//# sourceMappingURL=enhancedDashboardController.js.map