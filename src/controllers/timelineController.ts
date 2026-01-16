import { Request, Response } from 'express';
import Timeline from '../models/Timeline';

export const getAllTimelineItems = async (req: Request, res: Response) => {
  try {
    const timelineItems = await Timeline.find().sort({ order: 1, createdAt: 1 });
    res.status(200).json(timelineItems);
  } catch (error) {
    console.error('Error fetching timeline items:', error);
    res.status(500).json({ error: 'Failed to fetch timeline items' });
  }
};

export const getTimelineItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const timelineItem = await Timeline.findById(id);
    
    if (!timelineItem) {
      return res.status(404).json({ error: 'Timeline item not found' });
    }
    
    res.status(200).json(timelineItem);
  } catch (error) {
    console.error('Error fetching timeline item:', error);
    res.status(500).json({ error: 'Failed to fetch timeline item' });
  }
};

export const createTimelineItem = async (req: Request, res: Response) => {
  try {
    const { year, role, company, description, icon, order } = req.body;
    
    const newTimelineItem = new Timeline({
      year,
      role,
      company,
      description,
      icon,
      order
    });
    
    const savedItem = await newTimelineItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('Error creating timeline item:', error);
    res.status(500).json({ error: 'Failed to create timeline item' });
  }
};

export const updateTimelineItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { year, role, company, description, icon, order } = req.body;
    
    const updatedItem = await Timeline.findByIdAndUpdate(
      id,
      { year, role, company, description, icon, order },
      { new: true, runValidators: true }
    );
    
    if (!updatedItem) {
      return res.status(404).json({ error: 'Timeline item not found' });
    }
    
    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('Error updating timeline item:', error);
    res.status(500).json({ error: 'Failed to update timeline item' });
  }
};

export const deleteTimelineItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const deletedItem = await Timeline.findByIdAndDelete(id);
    
    if (!deletedItem) {
      return res.status(404).json({ error: 'Timeline item not found' });
    }
    
    res.status(200).json({ message: 'Timeline item deleted successfully' });
  } catch (error) {
    console.error('Error deleting timeline item:', error);
    res.status(500).json({ error: 'Failed to delete timeline item' });
  }
};