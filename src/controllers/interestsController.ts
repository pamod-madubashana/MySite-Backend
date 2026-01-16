import { Request, Response } from 'express';
import Interests from '../models/Interests';

export const getAllInterests = async (req: Request, res: Response) => {
  try {
    const interests = await Interests.find().sort({ order: 1, createdAt: 1 });
    res.status(200).json(interests);
  } catch (error) {
    console.error('Error fetching interests:', error);
    res.status(500).json({ error: 'Failed to fetch interests' });
  }
};

export const getInterestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const interest = await Interests.findById(id);
    
    if (!interest) {
      return res.status(404).json({ error: 'Interest not found' });
    }
    
    res.status(200).json(interest);
  } catch (error) {
    console.error('Error fetching interest:', error);
    res.status(500).json({ error: 'Failed to fetch interest' });
  }
};

export const createInterest = async (req: Request, res: Response) => {
  try {
    const { icon, label, order } = req.body;
    
    const newInterest = new Interests({
      icon,
      label,
      order
    });
    
    const savedInterest = await newInterest.save();
    res.status(201).json(savedInterest);
  } catch (error) {
    console.error('Error creating interest:', error);
    res.status(500).json({ error: 'Failed to create interest' });
  }
};

export const updateInterest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { icon, label, order } = req.body;
    
    const updatedInterest = await Interests.findByIdAndUpdate(
      id,
      { icon, label, order },
      { new: true, runValidators: true }
    );
    
    if (!updatedInterest) {
      return res.status(404).json({ error: 'Interest not found' });
    }
    
    res.status(200).json(updatedInterest);
  } catch (error) {
    console.error('Error updating interest:', error);
    res.status(500).json({ error: 'Failed to update interest' });
  }
};

export const deleteInterest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const deletedInterest = await Interests.findByIdAndDelete(id);
    
    if (!deletedInterest) {
      return res.status(404).json({ error: 'Interest not found' });
    }
    
    res.status(200).json({ message: 'Interest deleted successfully' });
  } catch (error) {
    console.error('Error deleting interest:', error);
    res.status(500).json({ error: 'Failed to delete interest' });
  }
};