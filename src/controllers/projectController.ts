import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Project from '../models/Project';

export const getPublishedProjects = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, featured } = req.query;
    
    const query: any = { status: 'published' };
    
    if (search) {
      query.$text = { $search: search as string };
    }
    
    if (featured === 'true') {
      query.featured = true;
    }
    
    const projects = await Project.find(query)
      .sort({ featured: -1, createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .exec();
      
    const total = await Project.countDocuments(query);
    
    res.json({
      projects,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error while fetching projects' });
  }
};

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, status, featured } = req.query;
    
    const query: any = {};
    
    if (search) {
      query.$text = { $search: search as string };
    }
    
    if (status) {
      query.status = status;
    }
    
    if (featured !== undefined) {
      query.featured = featured === 'true';
    }
    
    const projects = await Project.find(query)
      .sort({ featured: -1, createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .exec();
      
    const total = await Project.countDocuments(query);
    
    res.json({
      projects,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error while fetching projects' });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Server error while fetching project' });
  }
};

export const createProject = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description is required and must be less than 1000 characters'),
  
  body('techStack')
    .isArray({ min: 1 })
    .withMessage('Tech stack must be an array with at least one item'),
  
  body('status')
    .isIn(['draft', 'published'])
    .withMessage('Status must be either draft or published'),
  
  body('githubUrl')
    .optional()
    .isURL()
    .withMessage('GitHub URL must be a valid URL'),
  
  body('liveUrl')
    .optional()
    .isURL()
    .withMessage('Live URL must be a valid URL'),
  
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { title, description, techStack, githubUrl, liveUrl, featured, status, thumbnail, screenshots } = req.body;
      
      const project = new Project({
        title,
        description,
        techStack,
        githubUrl,
        liveUrl,
        featured: featured || false,
        status: status || 'draft',
        thumbnail,
        screenshots
      });
      
      await project.save();
      
      res.status(201).json({
        message: 'Project created successfully',
        project
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error while creating project' });
    }
  }
];

export const updateProject = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be less than 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  
  body('techStack')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Tech stack must be an array with at least one item'),
  
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be either draft or published'),
  
  body('githubUrl')
    .optional()
    .isURL()
    .withMessage('GitHub URL must be a valid URL'),
  
  body('liveUrl')
    .optional()
    .isURL()
    .withMessage('Live URL must be a valid URL'),
  
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { title, description, techStack, githubUrl, liveUrl, featured, status, thumbnail, screenshots } = req.body;
      
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (techStack !== undefined) updateData.techStack = techStack;
      if (githubUrl !== undefined) updateData.githubUrl = githubUrl;
      if (liveUrl !== undefined) updateData.liveUrl = liveUrl;
      if (featured !== undefined) updateData.featured = featured;
      if (status !== undefined) updateData.status = status;
      if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
      if (screenshots !== undefined) updateData.screenshots = screenshots;
      
      const project = await Project.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      res.json({
        message: 'Project updated successfully',
        project
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error while updating project' });
    }
  }
];

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error while deleting project' });
  }
};