import { Request, Response } from 'express';
import Article from '../models/Article';
import Project from '../models/Project';
import User from '../models/User';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Get counts for different entities
    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      totalProjects,
      publishedProjects,
      draftProjects,
      totalUsers
    ] = await Promise.all([
      Article.countDocuments(),
      Article.countDocuments({ status: 'published' }),
      Article.countDocuments({ status: 'draft' }),
      Project.countDocuments(),
      Project.countDocuments({ status: 'published' }),
      Project.countDocuments({ status: 'draft' }),
      User.countDocuments()
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentArticles = await Article.find({
      createdAt: { $gte: sevenDaysAgo }
    })
    .populate('author', 'username')
    .sort({ createdAt: -1 })
    .limit(5);

    const recentProjects = await Project.find({
      createdAt: { $gte: sevenDaysAgo }
    })
    .sort({ createdAt: -1 })
    .limit(5);

    // Combine and sort recent activity
    const recentActivity = [
      ...recentArticles.map(article => ({
        id: article._id.toString(),
        title: article.title,
        type: 'article' as const,
        date: article.createdAt.toISOString(),
        status: article.status,
        author: (article.author as any)?.username || 'Unknown'
      })),
      ...recentProjects.map(project => ({
        id: project._id.toString(),
        title: project.title,
        type: 'project' as const,
        date: project.createdAt.toISOString(),
        status: project.status,
        author: 'You'
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

    // Calculate percentage changes (mock data for now - would need historical data)
    const stats = {
      articles: {
        total: totalArticles,
        published: publishedArticles,
        drafts: draftArticles,
        change: '+12%' // Would calculate from historical data
      },
      projects: {
        total: totalProjects,
        published: publishedProjects,
        drafts: draftProjects,
        change: '+8%'
      },
      users: {
        total: totalUsers,
        change: '+5%'
      },
      engagement: {
        views: 12400, // Would come from analytics
        rate: '64%',
        change: '+18%'
      }
    };

    res.json({
      stats,
      recentActivity,
      success: true
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard statistics',
      success: false 
    });
  }
};

// Get detailed analytics data
export const getAnalytics = async (req: Request, res: Response) => {
  try {
    // Monthly breakdown for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // This would typically come from an analytics service or database
    // For now, returning mock data that looks realistic
    const monthlyData = [
      { month: 'Jun', articles: 3, projects: 1, views: 1800 },
      { month: 'Jul', articles: 5, projects: 2, views: 2400 },
      { month: 'Aug', articles: 4, projects: 1, views: 3200 },
      { month: 'Sep', articles: 6, projects: 3, views: 4100 },
      { month: 'Oct', articles: 7, projects: 2, views: 5600 },
      { month: 'Nov', articles: 8, projects: 4, views: 8900 }
    ];

    // Top performing content
    const topArticles = await Article.find({ status: 'published' })
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(5);

    const topProjects = await Project.find({ status: 'published', featured: true })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      monthlyData,
      topArticles,
      topProjects,
      success: true
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch analytics data',
      success: false 
    });
  }
};