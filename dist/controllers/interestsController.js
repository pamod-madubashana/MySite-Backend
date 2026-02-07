"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInterest = exports.updateInterest = exports.createInterest = exports.getInterestById = exports.getAllInterests = void 0;
const Interests_1 = __importDefault(require("../models/Interests"));
const getAllInterests = async (req, res) => {
    try {
        const interests = await Interests_1.default.find().sort({ order: 1, createdAt: 1 });
        res.status(200).json(interests);
    }
    catch (error) {
        console.error('Error fetching interests:', error);
        res.status(500).json({ error: 'Failed to fetch interests' });
    }
};
exports.getAllInterests = getAllInterests;
const getInterestById = async (req, res) => {
    try {
        const { id } = req.params;
        const interest = await Interests_1.default.findById(id);
        if (!interest) {
            return res.status(404).json({ error: 'Interest not found' });
        }
        res.status(200).json(interest);
    }
    catch (error) {
        console.error('Error fetching interest:', error);
        res.status(500).json({ error: 'Failed to fetch interest' });
    }
};
exports.getInterestById = getInterestById;
const createInterest = async (req, res) => {
    try {
        const { icon, label, order } = req.body;
        const newInterest = new Interests_1.default({
            icon,
            label,
            order
        });
        const savedInterest = await newInterest.save();
        res.status(201).json(savedInterest);
    }
    catch (error) {
        console.error('Error creating interest:', error);
        res.status(500).json({ error: 'Failed to create interest' });
    }
};
exports.createInterest = createInterest;
const updateInterest = async (req, res) => {
    try {
        const { id } = req.params;
        const { icon, label, order } = req.body;
        const updatedInterest = await Interests_1.default.findByIdAndUpdate(id, { icon, label, order }, { new: true, runValidators: true });
        if (!updatedInterest) {
            return res.status(404).json({ error: 'Interest not found' });
        }
        res.status(200).json(updatedInterest);
    }
    catch (error) {
        console.error('Error updating interest:', error);
        res.status(500).json({ error: 'Failed to update interest' });
    }
};
exports.updateInterest = updateInterest;
const deleteInterest = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedInterest = await Interests_1.default.findByIdAndDelete(id);
        if (!deletedInterest) {
            return res.status(404).json({ error: 'Interest not found' });
        }
        res.status(200).json({ message: 'Interest deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting interest:', error);
        res.status(500).json({ error: 'Failed to delete interest' });
    }
};
exports.deleteInterest = deleteInterest;
//# sourceMappingURL=interestsController.js.map