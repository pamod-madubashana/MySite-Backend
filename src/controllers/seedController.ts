import { Request, Response } from 'express';
import Timeline from '../models/Timeline';
import Interests from '../models/Interests';
// Default timeline data
const defaultTimelineData: Array<{
  year: string;
  role: string;
  company: string;
  description: string;
  icon: string;
  order: number;
}> = [
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
const defaultInterestsData: Array<{
  icon: string;
  label: string;
  order: number;
}> = [
  { icon: "Code2", label: "Telegram Bot Development", order: 1 },
  { icon: "Database", label: "Backend Architecture", order: 2 },
  { icon: "Palette", label: "UI Design", order: 3 },
  { icon: "Coffee", label: "Late-Night Debugging", order: 4 }
];

export const seedDatabaseIfEmpty = async () => {
  try {
    const timelineCount = await Timeline.countDocuments();
    const interestsCount = await Interests.countDocuments();
    
    if (timelineCount === 0) {
      console.log('Seeding timeline data...');
      await Timeline.insertMany(defaultTimelineData);
      console.log('Timeline data seeded successfully.');
    } else {
      console.log(`Timeline collection already has ${timelineCount} records. Skipping seeding.`);
    }
    
    if (interestsCount === 0) {
      console.log('Seeding interests data...');
      await Interests.insertMany(defaultInterestsData);
      console.log('Interests data seeded successfully.');
    } else {
      console.log(`Interests collection already has ${interestsCount} records. Skipping seeding.`);
    }
    
    console.log('Database seeding process completed.');
  } catch (error) {
    console.error('Error during database seeding:', error);
  }
};

export const seedDatabase = async (req: Request, res: Response) => {
  try {
    await seedDatabaseIfEmpty();
    res.status(200).json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Error seeding database:', error);
    res.status(500).json({ error: 'Failed to seed database' });
  }
};