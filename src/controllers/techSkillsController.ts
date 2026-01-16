import { Request, Response } from 'express';
import TechSkill from '../models/TechSkills';

export const getAllTechSkills = async (req: Request, res: Response) => {
  try {
    const techSkills = await TechSkill.find().sort({ order: 1, createdAt: 1 });
    res.status(200).json(techSkills);
  } catch (error) {
    console.error('Error fetching tech skills:', error);
    res.status(500).json({ error: 'Failed to fetch tech skills' });
  }
};

export const getTechSkillById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const techSkill = await TechSkill.findById(id);
    
    if (!techSkill) {
      return res.status(404).json({ error: 'Tech skill not found' });
    }
    
    res.status(200).json(techSkill);
  } catch (error) {
    console.error('Error fetching tech skill:', error);
    res.status(500).json({ error: 'Failed to fetch tech skill' });
  }
};

export const createTechSkill = async (req: Request, res: Response) => {
  try {
    const { name, level, category, order } = req.body;
    
    const newTechSkill = new TechSkill({
      name,
      level,
      category,
      order
    });
    
    const savedSkill = await newTechSkill.save();
    res.status(201).json(savedSkill);
  } catch (error) {
    console.error('Error creating tech skill:', error);
    res.status(500).json({ error: 'Failed to create tech skill' });
  }
};

export const updateTechSkill = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, level, category, order } = req.body;
    
    const updatedSkill = await TechSkill.findByIdAndUpdate(
      id,
      { name, level, category, order },
      { new: true, runValidators: true }
    );
    
    if (!updatedSkill) {
      return res.status(404).json({ error: 'Tech skill not found' });
    }
    
    res.status(200).json(updatedSkill);
  } catch (error) {
    console.error('Error updating tech skill:', error);
    res.status(500).json({ error: 'Failed to update tech skill' });
  }
};

export const deleteTechSkill = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const deletedSkill = await TechSkill.findByIdAndDelete(id);
    
    if (!deletedSkill) {
      return res.status(404).json({ error: 'Tech skill not found' });
    }
    
    res.status(200).json({ message: 'Tech skill deleted successfully' });
  } catch (error) {
    console.error('Error deleting tech skill:', error);
    res.status(500).json({ error: 'Failed to delete tech skill' });
  }
};