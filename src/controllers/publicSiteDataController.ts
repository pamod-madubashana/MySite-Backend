import { Request, Response } from 'express';
import axios from 'axios';
import Article from '../models/Article';
import Interests from '../models/Interests';
import Project from '../models/Project';
import Settings from '../models/Settings';
import TechSkill from '../models/TechSkills';
import TechStackCategory from '../models/TechStackCategory';
import Timeline from '../models/Timeline';

const SITE_DATA_CACHE_TTL_MS = 180 * 1000;

interface CachedSiteData {
  expiresAt: number;
  payload: Record<string, unknown>;
}

let siteDataCache: CachedSiteData | null = null;

const fallbackBySection = {
  about: null,
  projects: [],
  featuredProjects: [],
  timeline: [],
  techStackCategories: [],
  techSkills: [],
  interests: [],
  articles: [],
  github: {
    repos: [],
    projectStats: {},
  },
  settings: null,
  contactInfo: null,
};

const githubHeaders = {
  Accept: 'application/vnd.github.v3+json',
  ...(process.env.GITHUB_TOKEN && { Authorization: `token ${process.env.GITHUB_TOKEN}` }),
};

const getOrCreateSettings = async () => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = new Settings();
    await settings.save();
  }

  return settings;
};

const fetchGithubData = async (settings: any, projects: any[]) => {
  const username = settings?.githubUsername;

  if (!username) {
    return fallbackBySection.github;
  }

  const response = await axios.get<any[]>(`https://api.github.com/users/${username}/repos`, {
    params: {
      sort: 'updated',
      direction: 'desc',
      page: 1,
      per_page: 10,
      type: 'all',
    },
    headers: githubHeaders,
  });

  const repos = (response.data || [])
    .filter((repo: any) => process.env.GITHUB_TOKEN || !repo.private)
    .map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      htmlUrl: repo.html_url,
      stargazersCount: repo.stargazers_count,
      forksCount: repo.forks_count,
      language: repo.language,
      languages: repo.language ? [repo.language] : [],
      updatedAt: repo.updated_at,
      createdAt: repo.created_at,
      size: repo.size,
      defaultBranch: repo.default_branch,
      topics: repo.topics,
      visibility: repo.private ? 'private' : 'public',
    }));

  const statsByFullName = new Map(
    repos.map((repo: any) => [repo.fullName?.toLowerCase(), {
      stars: repo.stargazersCount,
      forks: repo.forksCount,
    }])
  );

  const projectStats = projects.reduce<Record<string, { stars: number; forks: number }>>((stats, project) => {
    const githubUrl = project.githubUrl;

    if (!githubUrl) {
      return stats;
    }

    const match = githubUrl.match(/github\.com\/([^/]+\/[^/?#]+)/i);
    const repoStats = match ? statsByFullName.get(match[1].toLowerCase()) : undefined;

    if (repoStats) {
      stats[String(project._id)] = repoStats;
    }

    return stats;
  }, {});

  return {
    repos,
    projectStats,
  };
};

const safeSection = async <T>(
  section: keyof typeof fallbackBySection,
  loader: () => Promise<T>,
  errors: Record<string, string>
): Promise<T | (typeof fallbackBySection)[typeof section]> => {
  try {
    return await loader();
  } catch (error) {
    console.error(`Error loading public site-data section "${section}":`, error);

    if (process.env.NODE_ENV === 'development') {
      errors[section] = error instanceof Error ? error.message : 'Unknown error';
    }

    return fallbackBySection[section];
  }
};

export const getPublicSiteData = async (_req: Request, res: Response) => {
  const now = Date.now();

  if (siteDataCache && siteDataCache.expiresAt > now) {
    return res.json(siteDataCache.payload);
  }

  const errors: Record<string, string> = {};

  const [
    settings,
    projects,
    featuredProjects,
    timeline,
    techStackCategories,
    techSkills,
    interests,
    articles,
  ] = await Promise.all([
    safeSection('settings', getOrCreateSettings, errors),
    safeSection('projects', () => Project.find({ status: 'published' }).sort({ featured: -1, createdAt: -1 }).limit(12).exec(), errors),
    safeSection('featuredProjects', () => Project.find({ status: 'published', featured: true }).sort({ createdAt: -1 }).limit(6).exec(), errors),
    safeSection('timeline', () => Timeline.find().sort({ order: 1, createdAt: 1 }).exec(), errors),
    safeSection('techStackCategories', () => TechStackCategory.find().sort({ order: 1, createdAt: 1 }).exec(), errors),
    safeSection('techSkills', () => TechSkill.find().sort({ order: 1, createdAt: 1 }).exec(), errors),
    safeSection('interests', () => Interests.find().sort({ order: 1, createdAt: 1 }).exec(), errors),
    safeSection('articles', () => Article.find({ status: 'published' }).populate('author', 'username').sort({ createdAt: -1 }).limit(6).exec(), errors),
  ]);
  const settingsData = settings as any;

  const github = await safeSection(
    'github',
    () => fetchGithubData(settingsData, Array.isArray(projects) ? projects : []),
    errors
  );

  const payload = {
    about: {
      content: settingsData?.aboutContent || '',
    },
    projects,
    featuredProjects,
    timeline,
    techStackCategories,
    techSkills,
    interests,
    articles,
    github,
    settings,
    contactInfo: settingsData?.socialLinks ? {
      email: settingsData.socialLinks.email,
      github: settingsData.socialLinks.github,
      linkedin: settingsData.socialLinks.linkedin,
      telegram: settingsData.socialLinks.telegram,
    } : null,
    ...(process.env.NODE_ENV === 'development' && Object.keys(errors).length > 0 ? { errors } : {}),
  };

  siteDataCache = {
    expiresAt: now + SITE_DATA_CACHE_TTL_MS,
    payload,
  };

  res.json(payload);
};
