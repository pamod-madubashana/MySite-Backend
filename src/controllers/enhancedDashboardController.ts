import { Request, Response } from 'express';
import Article from '../models/Article';
import Project from '../models/Project';
import Timeline from '../models/Timeline';
import Interests from '../models/Interests';
import User from '../models/User';

export const getEnhancedDashboardData = async (req: Request, res: Response) => {
  try {
    // Get counts for articles and projects
    const [articlesCount, projectsCount, timelineCount, interestsCount] = await Promise.all([
      Article.countDocuments(),
      Project.countDocuments(),
      Timeline.countDocuments(),
      Interests.countDocuments()
    ]);

    // Get recent articles and projects
    const recentArticles = await Article.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id title status createdAt author');

    const recentProjects = await Project.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id title status createdAt');

    // Get published counts
    const publishedArticlesCount = await Article.countDocuments({ status: 'published' });
    const publishedProjectsCount = await Project.countDocuments({ status: 'published' });

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
          type: 'article' as const,
          date: article.createdAt.toISOString(),
          status: article.status,
          author: article.author ? (article.author as any).username : 'Unknown'
        })),
        ...recentProjects.map(project => ({
          id: project._id.toString(),
          title: project.title,
          type: 'project' as const,
          date: project.createdAt.toISOString(),
          status: project.status,
          author: 'System'
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

export const getTimeline = async (req: Request, res: Response) => {
  try {
    const timeline = await Timeline.find().sort({ order: 1, createdAt: 1 });
    res.status(200).json(timeline);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline data' });
  }
};

export const getInterests = async (req: Request, res: Response) => {
  try {
    const interests = await Interests.find().sort({ order: 1, createdAt: 1 });
    res.status(200).json(interests);
  } catch (error) {
    console.error('Error fetching interests:', error);
    res.status(500).json({ error: 'Failed to fetch interests data' });
  }
};

export const getTechSkills = async (req: Request, res: Response) => {
  try {
    // For now, returning hardcoded tech skills
    // In a real application, this would come from a dedicated TechSkill model
    const techSkills = [
      { name: 'Python', level: 95 },
      { name: 'JavaScript', level: 80 },
      { name: 'React', level: 65 },
      { name: 'TypeScript', level: 75 },
      { name: 'MongoDB', level: 85 },
      { name: 'AWS', level: 30 }
    ];
    
    res.status(200).json(techSkills);
  } catch (error) {
    console.error('Error fetching tech skills:', error);
    res.status(500).json({ error: 'Failed to fetch tech skills data' });
  }
};