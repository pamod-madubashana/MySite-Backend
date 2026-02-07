"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettings = exports.getSettings = void 0;
const express_validator_1 = require("express-validator");
const Settings_1 = __importDefault(require("../models/Settings"));
const getSettings = async (req, res) => {
    try {
        let settings = await Settings_1.default.findOne();
        if (!settings) {
            // Create default settings if none exist
            settings = new Settings_1.default();
            await settings.save();
        }
        res.json(settings);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error while fetching settings' });
    }
};
exports.getSettings = getSettings;
exports.updateSettings = [
    (0, express_validator_1.body)('aboutContent')
        .optional()
        .isString()
        .withMessage('About content must be a string'),
    (0, express_validator_1.body)('featuredRepos')
        .optional()
        .isArray()
        .withMessage('Featured repos must be an array'),
    (0, express_validator_1.body)('themeOptions.primaryColor')
        .optional()
        .isString()
        .withMessage('Primary color must be a string'),
    (0, express_validator_1.body)('themeOptions.secondaryColor')
        .optional()
        .isString()
        .withMessage('Secondary color must be a string'),
    (0, express_validator_1.body)('themeOptions.fontFamily')
        .optional()
        .isString()
        .withMessage('Font family must be a string'),
    (0, express_validator_1.body)('siteSections.showAbout')
        .optional()
        .isBoolean()
        .withMessage('Show about section must be a boolean'),
    (0, express_validator_1.body)('siteSections.showProjects')
        .optional()
        .isBoolean()
        .withMessage('Show projects section must be a boolean'),
    (0, express_validator_1.body)('siteSections.showArticles')
        .optional()
        .isBoolean()
        .withMessage('Show articles section must be a boolean'),
    (0, express_validator_1.body)('siteSections.showContact')
        .optional()
        .isBoolean()
        .withMessage('Show contact section must be a boolean'),
    (0, express_validator_1.body)('socialLinks.github')
        .optional()
        .isString()
        .withMessage('GitHub link must be a string'),
    (0, express_validator_1.body)('socialLinks.linkedin')
        .optional()
        .isString()
        .withMessage('LinkedIn link must be a string'),
    (0, express_validator_1.body)('socialLinks.twitter')
        .optional()
        .isString()
        .withMessage('Twitter link must be a string'),
    (0, express_validator_1.body)('socialLinks.email')
        .optional()
        .isString()
        .withMessage('Email link must be a string'),
    (0, express_validator_1.body)('githubUsername')
        .optional()
        .isString()
        .withMessage('GitHub username must be a string'),
    async (req, res) => {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            let settings = await Settings_1.default.findOne();
            if (!settings) {
                // Create new settings if none exist
                settings = new Settings_1.default(req.body);
            }
            else {
                // Update existing settings
                Object.assign(settings, req.body);
            }
            await settings.save();
            res.json({
                message: 'Settings updated successfully',
                settings
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Server error while updating settings' });
        }
    }
];
//# sourceMappingURL=settingsController.js.map