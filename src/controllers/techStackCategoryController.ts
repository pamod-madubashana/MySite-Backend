import { Request, Response } from 'express';
import TechStackCategory from '../models/TechStackCategory';

export const getAllTechStackCategories = async (req: Request, res: Response) => {
  try {
    const categories = await TechStackCategory.find().sort({ order: 1, createdAt: 1 });
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching tech stack categories:', error);
    res.status(500).json({ error: 'Failed to fetch tech stack categories' });
  }
};

export const getTechStackCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await TechStackCategory.findById(id);
    
    if (!category) {
      return res.status(404).json({ error: 'Tech stack category not found' });
    }
    
    res.status(200).json(category);
  } catch (error) {
    console.error('Error fetching tech stack category:', error);
    res.status(500).json({ error: 'Failed to fetch tech stack category' });
  }
};

export const createTechStackCategory = async (req: Request, res: Response) => {
  try {
    const { title, icon, skills, order } = req.body;
    
    const newCategory = new TechStackCategory({
      title,
      icon,
      skills,
      order
    });
    
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    console.error('Error creating tech stack category:', error);
    res.status(500).json({ error: 'Failed to create tech stack category' });
  }
};

export const updateTechStackCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, icon, skills, order } = req.body;
    
    const updatedCategory = await TechStackCategory.findByIdAndUpdate(
      id,
      { title, icon, skills, order },
      { new: true, runValidators: true }
    );
    
    if (!updatedCategory) {
      return res.status(404).json({ error: 'Tech stack category not found' });
    }
    
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error('Error updating tech stack category:', error);
    res.status(500).json({ error: 'Failed to update tech stack category' });
  }
};

export const deleteTechStackCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const deletedCategory = await TechStackCategory.findByIdAndDelete(id);
    
    if (!deletedCategory) {
      return res.status(404).json({ error: 'Tech stack category not found' });
    }
    
    res.status(200).json({ message: 'Tech stack category deleted successfully' });
  } catch (error) {
    console.error('Error deleting tech stack category:', error);
    res.status(500).json({ error: 'Failed to delete tech stack category' });
  }
};