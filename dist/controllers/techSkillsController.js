"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTechSkill = exports.updateTechSkill = exports.createTechSkill = exports.getTechSkillById = exports.getAllTechSkills = void 0;
const TechSkills_1 = __importDefault(require("../models/TechSkills"));
const getAllTechSkills = async (req, res) => {
    try {
        const techSkills = await TechSkills_1.default.find().sort({ order: 1, createdAt: 1 });
        res.status(200).json(techSkills);
    }
    catch (error) {
        console.error('Error fetching tech skills:', error);
        res.status(500).json({ error: 'Failed to fetch tech skills' });
    }
};
exports.getAllTechSkills = getAllTechSkills;
const getTechSkillById = async (req, res) => {
    try {
        const { id } = req.params;
        const techSkill = await TechSkills_1.default.findById(id);
        if (!techSkill) {
            return res.status(404).json({ error: 'Tech skill not found' });
        }
        res.status(200).json(techSkill);
    }
    catch (error) {
        console.error('Error fetching tech skill:', error);
        res.status(500).json({ error: 'Failed to fetch tech skill' });
    }
};
exports.getTechSkillById = getTechSkillById;
const createTechSkill = async (req, res) => {
    try {
        const { name, level, category, order } = req.body;
        const newTechSkill = new TechSkills_1.default({
            name,
            level,
            category,
            order
        });
        const savedSkill = await newTechSkill.save();
        res.status(201).json(savedSkill);
    }
    catch (error) {
        console.error('Error creating tech skill:', error);
        res.status(500).json({ error: 'Failed to create tech skill' });
    }
};
exports.createTechSkill = createTechSkill;
const updateTechSkill = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, level, category, order } = req.body;
        const updatedSkill = await TechSkills_1.default.findByIdAndUpdate(id, { name, level, category, order }, { new: true, runValidators: true });
        if (!updatedSkill) {
            return res.status(404).json({ error: 'Tech skill not found' });
        }
        res.status(200).json(updatedSkill);
    }
    catch (error) {
        console.error('Error updating tech skill:', error);
        res.status(500).json({ error: 'Failed to update tech skill' });
    }
};
exports.updateTechSkill = updateTechSkill;
const deleteTechSkill = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSkill = await TechSkills_1.default.findByIdAndDelete(id);
        if (!deletedSkill) {
            return res.status(404).json({ error: 'Tech skill not found' });
        }
        res.status(200).json({ message: 'Tech skill deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting tech skill:', error);
        res.status(500).json({ error: 'Failed to delete tech skill' });
    }
};
exports.deleteTechSkill = deleteTechSkill;
//# sourceMappingURL=techSkillsController.js.map