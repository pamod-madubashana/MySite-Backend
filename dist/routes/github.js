"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const githubController_1 = require("../controllers/githubController");
const router = (0, express_1.Router)();
router.get('/repos', githubController_1.getGithubRepos);
router.get('/repo/:owner/:repo', githubController_1.getRepoDetails);
exports.default = router;
//# sourceMappingURL=github.js.map