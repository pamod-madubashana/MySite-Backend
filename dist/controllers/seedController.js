"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = exports.seedDatabaseIfEmpty = void 0;
const Timeline_1 = __importDefault(require("../models/Timeline"));
const Interests_1 = __importDefault(require("../models/Interests"));
const TechSkills_1 = __importDefault(require("../models/TechSkills"));
const TechStackCategory_1 = __importDefault(require("../models/TechStackCategory"));
// Default timeline data
const defaultTimelineData = [
    {
        year: "2025 - Present",
        role: "Network Engineering Student",
        company: "NIBM University",
        description: "Pursuing a degree in Network Engineering, focusing on networking fundamentals, system administration, and practical implementations of backend and cloud technologies.",
        icon: "Cloud",
        order: 1
    },
    {
        year: "2024 - 2025",
        role: "Full-Stack Developer",
        company: "",
        description: "Designed and developed full-stack web applications with React, Express, and MongoDB, emphasizing scalable architecture, API integration, and responsive UI/UX design.",
        icon: "Briefcase",
        order: 2
    },
    {
        year: "2023 - 2024",
        role: "Backend Developer",
        company: "",
        description: "Implemented robust backend systems, RESTful APIs, and asynchronous services using Node.js and Python, with a focus on reliability, modularity, and performance optimization.",
        icon: "Terminal",
        order: 3
    },
    {
        year: "2022 - 2023",
        role: "Frontend Developer",
        company: "",
        description: "Developed responsive and interactive web interfaces using React and Tailwind CSS, applying best practices for usability, accessibility, and modern frontend architecture.",
        icon: "Palette",
        order: 4
    }
];
// Default interests data
const defaultInterestsData = [
    { icon: "Code2", label: "Telegram Bot Development", order: 1 },
    { icon: "Database", label: "Backend Architecture", order: 2 },
    { icon: "Palette", label: "UI Design", order: 3 },
    { icon: "Coffee", label: "Late-Night Debugging", order: 4 }
];
// Default tech skills data
const defaultTechSkillsData = [
    { name: "Python", level: 95, order: 1 },
    { name: "JavaScript", level: 80, order: 2 },
    { name: "React", level: 65, order: 3 },
    { name: "TypeScript", level: 75, order: 4 },
    { name: "MongoDB", level: 85, order: 5 },
    { name: "AWS", level: 30, order: 6 }
];
// Default tech stack categories data
const defaultTechStackCategoriesData = [
    {
        title: "Frontend",
        icon: "Code",
        skills: ["React", "JavaScript", "TypeScript", "Tailwind CSS", "HTML", "CSS"],
        order: 1
    },
    {
        title: "Backend",
        icon: "Server",
        skills: ["Node.js", "Express", "Python", "Pyrogram", "aiohttp"],
        order: 2
    },
    {
        title: "Database",
        icon: "Database",
        skills: ["MongoDB", "MySQL", "Redis", "PostgreSQL"],
        order: 3
    },
    {
        title: "Cloud & DevOps",
        icon: "Cloud",
        skills: ["GitHub Actions", "Koyeb", "Vercel", "Docker (Basics)", "Git"],
        order: 4
    }
];
const seedDatabaseIfEmpty = async () => {
    try {
        const timelineCount = await Timeline_1.default.countDocuments();
        const interestsCount = await Interests_1.default.countDocuments();
        const techSkillsCount = await TechSkills_1.default.countDocuments();
        const techStackCategoriesCount = await TechStackCategory_1.default.countDocuments();
        if (timelineCount === 0) {
            await Timeline_1.default.insertMany(defaultTimelineData);
        }
        if (interestsCount === 0) {
            await Interests_1.default.insertMany(defaultInterestsData);
        }
        if (techSkillsCount === 0) {
            await TechSkills_1.default.insertMany(defaultTechSkillsData);
        }
        if (techStackCategoriesCount === 0) {
            await TechStackCategory_1.default.insertMany(defaultTechStackCategoriesData);
        }
    }
    catch (error) {
        console.error('Error during database seeding:', error);
    }
};
exports.seedDatabaseIfEmpty = seedDatabaseIfEmpty;
const seedDatabase = async (req, res) => {
    try {
        await (0, exports.seedDatabaseIfEmpty)();
        res.status(200).json({ message: 'Database seeded successfully' });
    }
    catch (error) {
        console.error('Error seeding database:', error);
        res.status(500).json({ error: 'Failed to seed database' });
    }
};
exports.seedDatabase = seedDatabase;
//# sourceMappingURL=seedController.js.map