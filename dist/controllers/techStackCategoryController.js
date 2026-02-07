"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTechStackCategory = exports.updateTechStackCategory = exports.createTechStackCategory = exports.getTechStackCategoryById = exports.getAllTechStackCategories = void 0;
const TechStackCategory_1 = __importDefault(require("../models/TechStackCategory"));
const getAllTechStackCategories = async (req, res) => {
    try {
        const categories = await TechStackCategory_1.default.find().sort({ order: 1, createdAt: 1 });
        res.status(200).json(categories);
    }
    catch (error) {
        console.error('Error fetching tech stack categories:', error);
        res.status(500).json({ error: 'Failed to fetch tech stack categories' });
    }
};
exports.getAllTechStackCategories = getAllTechStackCategories;
const getTechStackCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await TechStackCategory_1.default.findById(id);
        if (!category) {
            return res.status(404).json({ error: 'Tech stack category not found' });
        }
        res.status(200).json(category);
    }
    catch (error) {
        console.error('Error fetching tech stack category:', error);
        res.status(500).json({ error: 'Failed to fetch tech stack category' });
    }
};
exports.getTechStackCategoryById = getTechStackCategoryById;
const createTechStackCategory = async (req, res) => {
    try {
        const { title, icon, skills, order } = req.body;
        const newCategory = new TechStackCategory_1.default({
            title,
            icon,
            skills,
            order
        });
        const savedCategory = await newCategory.save();
        res.status(201).json(savedCategory);
    }
    catch (error) {
        console.error('Error creating tech stack category:', error);
        res.status(500).json({ error: 'Failed to create tech stack category' });
    }
};
exports.createTechStackCategory = createTechStackCategory;
const updateTechStackCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, icon, skills, order } = req.body;
        const updatedCategory = await TechStackCategory_1.default.findByIdAndUpdate(id, { title, icon, skills, order }, { new: true, runValidators: true });
        if (!updatedCategory) {
            return res.status(404).json({ error: 'Tech stack category not found' });
        }
        res.status(200).json(updatedCategory);
    }
    catch (error) {
        console.error('Error updating tech stack category:', error);
        res.status(500).json({ error: 'Failed to update tech stack category' });
    }
};
exports.updateTechStackCategory = updateTechStackCategory;
const deleteTechStackCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCategory = await TechStackCategory_1.default.findByIdAndDelete(id);
        if (!deletedCategory) {
            return res.status(404).json({ error: 'Tech stack category not found' });
        }
        res.status(200).json({ message: 'Tech stack category deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting tech stack category:', error);
        res.status(500).json({ error: 'Failed to delete tech stack category' });
    }
};
exports.deleteTechStackCategory = deleteTechStackCategory;
//# sourceMappingURL=techStackCategoryController.js.map