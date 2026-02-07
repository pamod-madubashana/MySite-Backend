"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTimelineItem = exports.updateTimelineItem = exports.createTimelineItem = exports.getTimelineItemById = exports.getAllTimelineItems = void 0;
const Timeline_1 = __importDefault(require("../models/Timeline"));
const getAllTimelineItems = async (req, res) => {
    try {
        const timelineItems = await Timeline_1.default.find().sort({ order: 1, createdAt: 1 });
        res.status(200).json(timelineItems);
    }
    catch (error) {
        console.error('Error fetching timeline items:', error);
        res.status(500).json({ error: 'Failed to fetch timeline items' });
    }
};
exports.getAllTimelineItems = getAllTimelineItems;
const getTimelineItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const timelineItem = await Timeline_1.default.findById(id);
        if (!timelineItem) {
            return res.status(404).json({ error: 'Timeline item not found' });
        }
        res.status(200).json(timelineItem);
    }
    catch (error) {
        console.error('Error fetching timeline item:', error);
        res.status(500).json({ error: 'Failed to fetch timeline item' });
    }
};
exports.getTimelineItemById = getTimelineItemById;
const createTimelineItem = async (req, res) => {
    try {
        const { year, role, company, description, icon, order } = req.body;
        const newTimelineItem = new Timeline_1.default({
            year,
            role,
            company,
            description,
            icon,
            order
        });
        const savedItem = await newTimelineItem.save();
        res.status(201).json(savedItem);
    }
    catch (error) {
        console.error('Error creating timeline item:', error);
        res.status(500).json({ error: 'Failed to create timeline item' });
    }
};
exports.createTimelineItem = createTimelineItem;
const updateTimelineItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { year, role, company, description, icon, order } = req.body;
        const updatedItem = await Timeline_1.default.findByIdAndUpdate(id, { year, role, company, description, icon, order }, { new: true, runValidators: true });
        if (!updatedItem) {
            return res.status(404).json({ error: 'Timeline item not found' });
        }
        res.status(200).json(updatedItem);
    }
    catch (error) {
        console.error('Error updating timeline item:', error);
        res.status(500).json({ error: 'Failed to update timeline item' });
    }
};
exports.updateTimelineItem = updateTimelineItem;
const deleteTimelineItem = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedItem = await Timeline_1.default.findByIdAndDelete(id);
        if (!deletedItem) {
            return res.status(404).json({ error: 'Timeline item not found' });
        }
        res.status(200).json({ message: 'Timeline item deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting timeline item:', error);
        res.status(500).json({ error: 'Failed to delete timeline item' });
    }
};
exports.deleteTimelineItem = deleteTimelineItem;
//# sourceMappingURL=timelineController.js.map