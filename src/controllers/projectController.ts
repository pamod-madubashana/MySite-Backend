import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Project from '../models/Project';
import { handleProjectImageUpload } from '../utils/imageUploadHandler';

export const getPublishedProjects = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, featured } = req.query;
    
    const query: any = { status: 'published' };
    
    if (search) {
      // Use regular expression search instead of text index to avoid MongoDB text index errors
      const searchString = search as string;
      // Only create regex if search string is not empty
      if (searchString.trim()) {
        const searchRegex = new RegExp(searchString, 'i');
        query.$or = [
          { title: searchRegex },
          { description: searchRegex },
          { techStack: { $in: [searchRegex] } }
        ];
      }
    }
    
    if (featured === 'true') {
      query.featured = true;
    }
    
    try {
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
    } catch (dbError) {
      console.error('Database error in getPublishedProjects:', dbError);
      res.status(500).json({ error: 'Database error while fetching published projects' });
    }
  } catch (error) {
    console.error('General error in getPublishedProjects:', error);
    res.status(500).json({ error: 'Server error while fetching published projects' });
  }
};

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, status, featured } = req.query;
    
    const query: any = {};
    
    if (search) {
      // Use regular expression search instead of text index to avoid MongoDB text index errors
      const searchString = search as string;
      // Only create regex if search string is not empty
      if (searchString.trim()) {
        const searchRegex = new RegExp(searchString, 'i');
        query.$or = [
          { title: searchRegex },
          { description: searchRegex },
          { techStack: { $in: [searchRegex] } }
        ];
      }
    }
    
    if (status) {
      query.status = status;
    }
    
    if (featured !== undefined) {
      query.featured = featured === 'true';
    }
    
    try {
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
    } catch (dbError) {
      console.error('Database error in getAllProjects:', dbError);
      res.status(500).json({ error: 'Database error while fetching all projects' });
    }
  } catch (error) {
    console.error('General error in getAllProjects:', error);
    res.status(500).json({ error: 'Server error while fetching all projects' });
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
    console.error('Error in getProjectById:', error);
    res.status(500).json({ error: 'Server error while fetching project by ID' });
  }
};

export const createProjectWithImage = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description is required and must be less than 1000 characters'),
  
  body('tags')
    .custom((value) => {
      // Check if it's an array with at least one item
      if (Array.isArray(value) && value.length >= 1) {
        return true;
      }
      
      // If it's a string, check if it can be parsed as an array with at least one item
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed) && parsed.length >= 1) {
            return true;
          }
          // Also check if it's a comma-separated string
          const splitValues = value.split(',').map(tag => tag.trim()).filter(tag => tag);
          if (splitValues.length >= 1) {
            return true;
          }
        } catch (e) {
          // If it's not valid JSON, try to split by commas
          const splitValues = value.split(',').map(tag => tag.trim()).filter(tag => tag);
          if (splitValues.length >= 1) {
            return true;
          }
        }
      }
      
      // If neither condition is met, throw an error
      throw new Error('Tags must be an array with at least one item');
    }),
  
  body('languages')
    .custom((value) => {
      // Check if it's an array
      if (Array.isArray(value)) {
        return true;
      }
      
      // If it's a string, check if it can be parsed as an array
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            return true;
          }
          // Also check if it's a comma-separated string
          const splitValues = value.split(',').map(lang => lang.trim()).filter(lang => lang);
          if (splitValues.length >= 0) {  // Allow empty arrays
            return true;
          }
        } catch (e) {
          // If it's not valid JSON, try to split by commas
          const splitValues = value.split(',').map(lang => lang.trim()).filter(lang => lang);
          if (splitValues.length >= 0) {  // Allow empty arrays
            return true;
          }
        }
      }
      
      // If it's undefined, that's also acceptable
      if (value === undefined) {
        return true;
      }
      
      // If none of the conditions are met, throw an error
      throw new Error('Languages must be an array or a comma-separated string');
    }),
  
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
      
      // Handle image uploads
      let imageResults: { thumbnail?: string; screenshots?: string[] };
      try {
        imageResults = await handleProjectImageUpload(req);
      } catch (imageError: any) {
        return res.status(400).json({ error: imageError.message });
      }
      
      const { title, description, tags, languages, githubUrl, liveUrl, featured, status } = req.body;
      
      // Parse tags if it's a string (from form data)
      let parsedTags = tags;
      if (typeof tags === 'string') {
        try {
          parsedTags = JSON.parse(tags);
        } catch (e) {
          // If it's not JSON, split by comma as fallback
          parsedTags = tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
        }
      }
      
      // Parse languages if it's a string (from form data)
      let parsedLanguages = languages || [];
      if (typeof languages === 'string') {
        try {
          parsedLanguages = JSON.parse(languages);
        } catch (e) {
          // If it's not JSON, split by comma as fallback
          parsedLanguages = languages.split(',').map((lang: string) => lang.trim()).filter((lang: string) => lang);
        }
      }
      
      const project = new Project({
        title,
        description,
        tags: parsedTags,
        languages: parsedLanguages,
        githubUrl,
        liveUrl,
        featured: featured || false,
        status: status || 'draft',
        thumbnail: imageResults.thumbnail,
        screenshots: imageResults.screenshots
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

export const createProject = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description is required and must be less than 1000 characters'),
  
  body('tags')
    .custom((value) => {
      // Check if it's an array with at least one item
      if (Array.isArray(value) && value.length >= 1) {
        return true;
      }
      
      // If it's a string, check if it can be parsed as an array with at least one item
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed) && parsed.length >= 1) {
            return true;
          }
          // Also check if it's a comma-separated string
          const splitValues = value.split(',').map(tag => tag.trim()).filter(tag => tag);
          if (splitValues.length >= 1) {
            return true;
          }
        } catch (e) {
          // If it's not valid JSON, try to split by commas
          const splitValues = value.split(',').map(tag => tag.trim()).filter(tag => tag);
          if (splitValues.length >= 1) {
            return true;
          }
        }
      }
      
      // If neither condition is met, throw an error
      throw new Error('Tags must be an array with at least one item');
    }),
  
  body('languages')
    .custom((value) => {
      // Check if it's an array
      if (Array.isArray(value)) {
        return true;
      }
      
      // If it's a string, check if it can be parsed as an array
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            return true;
          }
          // Also check if it's a comma-separated string
          const splitValues = value.split(',').map(lang => lang.trim()).filter(lang => lang);
          if (splitValues.length >= 0) {  // Allow empty arrays
            return true;
          }
        } catch (e) {
          // If it's not valid JSON, try to split by commas
          const splitValues = value.split(',').map(lang => lang.trim()).filter(lang => lang);
          if (splitValues.length >= 0) {  // Allow empty arrays
            return true;
          }
        }
      }
      
      // If it's undefined, that's also acceptable
      if (value === undefined) {
        return true;
      }
      
      // If none of the conditions are met, throw an error
      throw new Error('Languages must be an array or a comma-separated string');
    }),
  
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
      
      const { title, description, tags, languages, githubUrl, liveUrl, featured, status, thumbnail, screenshots } = req.body;
      
      const project = new Project({
        title,
        description,
        tags,
        languages: languages || [],
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

export const updateProjectWithImage = [
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
  
  body('tags')
    .optional()
    .custom((value) => {
      // Check if it's an array with at least one item
      if (Array.isArray(value) && value.length >= 1) {
        return true;
      }
      
      // If it's a string, check if it can be parsed as an array with at least one item
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed) && parsed.length >= 1) {
            return true;
          }
          // Also check if it's a comma-separated string
          const splitValues = value.split(',').map(tag => tag.trim()).filter(tag => tag);
          if (splitValues.length >= 1) {
            return true;
          }
        } catch (e) {
          // If it's not valid JSON, try to split by commas
          const splitValues = value.split(',').map(tag => tag.trim()).filter(tag => tag);
          if (splitValues.length >= 1) {
            return true;
          }
        }
      }
      
      // If neither condition is met, throw an error
      throw new Error('Tags must be an array with at least one item');
    }),
  
  body('languages')
    .optional()
    .custom((value) => {
      // Check if it's an array
      if (Array.isArray(value)) {
        return true;
      }
      
      // If it's a string, check if it can be parsed as an array
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            return true;
          }
          // Also check if it's a comma-separated string
          const splitValues = value.split(',').map(lang => lang.trim()).filter(lang => lang);
          if (splitValues.length >= 0) {  // Allow empty arrays
            return true;
          }
        } catch (e) {
          // If it's not valid JSON, try to split by commas
          const splitValues = value.split(',').map(lang => lang.trim()).filter(lang => lang);
          if (splitValues.length >= 0) {  // Allow empty arrays
            return true;
          }
        }
      }
      
      // If it's undefined, that's also acceptable
      if (value === undefined) {
        return true;
      }
      
      // If none of the conditions are met, throw an error
      throw new Error('Languages must be an array or a comma-separated string');
    }),
  
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
      
      // Handle image uploads
      let imageResults: { thumbnail?: string; screenshots?: string[] };
      try {
        imageResults = await handleProjectImageUpload(req);
      } catch (imageError: any) {
        return res.status(400).json({ error: imageError.message });
      }
      
      const { title, description, tags, languages, githubUrl, liveUrl, featured, status } = req.body;
      
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      
      // Parse tags if it's a string (from form data)
      if (tags !== undefined) {
        if (typeof tags === 'string') {
          try {
            updateData.tags = JSON.parse(tags);
          } catch (e) {
            // If it's not JSON, split by comma as fallback
            updateData.tags = tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
          }
        } else {
          updateData.tags = tags;
        }
      }
      
      // Parse languages if it's a string (from form data)
      if (languages !== undefined) {
        if (typeof languages === 'string') {
          try {
            updateData.languages = JSON.parse(languages);
          } catch (e) {
            // If it's not JSON, split by comma as fallback
            updateData.languages = languages.split(',').map((lang: string) => lang.trim()).filter((lang: string) => lang);
          }
        } else {
          updateData.languages = languages;
        }
      }
      
      if (githubUrl !== undefined) updateData.githubUrl = githubUrl;
      if (liveUrl !== undefined) updateData.liveUrl = liveUrl;
      if (featured !== undefined) updateData.featured = featured;
      if (status !== undefined) updateData.status = status;
      if (imageResults.thumbnail !== undefined) updateData.thumbnail = imageResults.thumbnail;
      if (imageResults.screenshots !== undefined) updateData.screenshots = imageResults.screenshots;
      
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
  
  body('tags')
    .optional()
    .custom((value) => {
      // Check if it's an array with at least one item
      if (Array.isArray(value) && value.length >= 1) {
        return true;
      }
      
      // If it's a string, check if it can be parsed as an array with at least one item
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed) && parsed.length >= 1) {
            return true;
          }
          // Also check if it's a comma-separated string
          const splitValues = value.split(',').map(tag => tag.trim()).filter(tag => tag);
          if (splitValues.length >= 1) {
            return true;
          }
        } catch (e) {
          // If it's not valid JSON, try to split by commas
          const splitValues = value.split(',').map(tag => tag.trim()).filter(tag => tag);
          if (splitValues.length >= 1) {
            return true;
          }
        }
      }
      
      // If neither condition is met, throw an error
      throw new Error('Tags must be an array with at least one item');
    }),
  
  body('languages')
    .optional()
    .custom((value) => {
      // Check if it's an array
      if (Array.isArray(value)) {
        return true;
      }
      
      // If it's a string, check if it can be parsed as an array
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            return true;
          }
          // Also check if it's a comma-separated string
          const splitValues = value.split(',').map(lang => lang.trim()).filter(lang => lang);
          if (splitValues.length >= 0) {  // Allow empty arrays
            return true;
          }
        } catch (e) {
          // If it's not valid JSON, try to split by commas
          const splitValues = value.split(',').map(lang => lang.trim()).filter(lang => lang);
          if (splitValues.length >= 0) {  // Allow empty arrays
            return true;
          }
        }
      }
      
      // If it's undefined, that's also acceptable
      if (value === undefined) {
        return true;
      }
      
      // If none of the conditions are met, throw an error
      throw new Error('Languages must be an array or a comma-separated string');
    }),
  
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
      
      const { title, description, tags, languages, githubUrl, liveUrl, featured, status, thumbnail, screenshots } = req.body;
      
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (tags !== undefined) updateData.tags = tags;
      if (languages !== undefined) updateData.languages = languages;
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