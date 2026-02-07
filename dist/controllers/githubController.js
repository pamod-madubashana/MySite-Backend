"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRepoDetails = exports.getGithubRepos = void 0;
const axios_1 = __importDefault(require("axios"));
const getGithubRepos = async (req, res) => {
    try {
        const { username, sort = 'updated', direction = 'desc', page = 1, per_page = 10 } = req.query;
        if (!username) {
            return res.status(400).json({ error: 'GitHub username is required' });
        }
        const response = await axios_1.default.get(`https://api.github.com/users/${username}/repos`, {
            params: {
                sort,
                direction,
                page,
                per_page,
                type: 'all'
            },
            headers: {
                Accept: 'application/vnd.github.v3+json',
                ...(process.env.GITHUB_TOKEN && { Authorization: `token ${process.env.GITHUB_TOKEN}` })
            }
        });
        // Filter out private repos if no token is provided
        let repos = response.data;
        if (!process.env.GITHUB_TOKEN) {
            repos = repos.filter((repo) => !repo.private);
        }
        // Add additional details for each repo
        const detailedRepos = await Promise.all(repos.map(async (repo) => {
            try {
                const languagesResponse = await axios_1.default.get(repo.languages_url, {
                    headers: {
                        Accept: 'application/vnd.github.v3+json',
                        ...(process.env.GITHUB_TOKEN && { Authorization: `token ${process.env.GITHUB_TOKEN}` })
                    }
                });
                const languagesData = languagesResponse.data || {};
                const languages = Object.entries(languagesData)
                    .sort(([_, a], [__, b]) => b - a)
                    .slice(0, 3)
                    .map(([lang]) => lang);
                return {
                    id: repo.id,
                    name: repo.name,
                    fullName: repo.full_name,
                    description: repo.description,
                    htmlUrl: repo.html_url,
                    stargazersCount: repo.stargazers_count,
                    forksCount: repo.forks_count,
                    language: repo.language,
                    languages: languages,
                    updatedAt: repo.updated_at,
                    createdAt: repo.created_at,
                    size: repo.size,
                    defaultBranch: repo.default_branch,
                    topics: repo.topics,
                    visibility: repo.private ? 'private' : 'public'
                };
            }
            catch (error) {
                // If we can't get languages, return basic info
                return {
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
                    visibility: repo.private ? 'private' : 'public'
                };
            }
        }));
        res.json(detailedRepos);
    }
    catch (error) {
        if (error instanceof Error && 'response' in error) {
            const axiosError = error;
            if (axiosError.response?.status === 404) {
                return res.status(404).json({ error: 'GitHub user not found' });
            }
            if (axiosError.response?.status === 403) {
                return res.status(403).json({ error: 'GitHub API rate limit exceeded' });
            }
        }
        res.status(500).json({ error: 'Server error while fetching GitHub repositories' });
    }
};
exports.getGithubRepos = getGithubRepos;
const getRepoDetails = async (req, res) => {
    try {
        const { owner, repo } = req.params;
        const repoResponse = await axios_1.default.get(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
                Accept: 'application/vnd.github.v3+json',
                ...(process.env.GITHUB_TOKEN && { Authorization: `token ${process.env.GITHUB_TOKEN}` })
            }
        });
        const languagesResponse = await axios_1.default.get(`https://api.github.com/repos/${owner}/${repo}/languages`, {
            headers: {
                Accept: 'application/vnd.github.v3+json',
                ...(process.env.GITHUB_TOKEN && { Authorization: `token ${process.env.GITHUB_TOKEN}` })
            }
        });
        const contributorsResponse = await axios_1.default.get(`https://api.github.com/repos/${owner}/${repo}/contributors`, {
            headers: {
                Accept: 'application/vnd.github.v3+json',
                ...(process.env.GITHUB_TOKEN && { Authorization: `token ${process.env.GITHUB_TOKEN}` })
            }
        });
        const repoData = repoResponse.data;
        const languagesData = languagesResponse.data || {};
        const languages = Object.entries(languagesData)
            .sort(([_, a], [__, b]) => b - a)
            .slice(0, 5)
            .map(([lang, bytes]) => ({ language: lang, bytes: bytes }));
        const contributors = contributorsResponse.data.slice(0, 10).map((contributor) => ({
            login: contributor.login,
            contributions: contributor.contributions,
            avatarUrl: contributor.avatar_url,
            htmlUrl: contributor.html_url
        }));
        res.json({
            id: repoData.id,
            name: repoData.name,
            fullName: repoData.full_name,
            description: repoData.description,
            htmlUrl: repoData.html_url,
            homepage: repoData.homepage || null,
            stargazersCount: repoData.stargazers_count,
            watchersCount: repoData.watchers_count,
            forksCount: repoData.forks_count,
            openIssuesCount: repoData.open_issues_count,
            language: repoData.language,
            languages,
            size: repoData.size,
            defaultBranch: repoData.default_branch,
            topics: repoData.topics,
            license: repoData.license?.name || null,
            visibility: repoData.private ? 'private' : 'public',
            createdAt: repoData.created_at,
            updatedAt: repoData.updated_at,
            cloneUrl: repoData.clone_url,
            sshUrl: repoData.ssh_url,
            contributors
        });
    }
    catch (error) {
        if (error instanceof Error && 'response' in error) {
            const axiosError = error;
            if (axiosError.response?.status === 404) {
                return res.status(404).json({ error: 'Repository not found' });
            }
            if (axiosError.response?.status === 403) {
                return res.status(403).json({ error: 'GitHub API rate limit exceeded' });
            }
        }
        res.status(500).json({ error: 'Server error while fetching repository details' });
    }
};
exports.getRepoDetails = getRepoDetails;
//# sourceMappingURL=githubController.js.map