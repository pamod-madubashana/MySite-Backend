"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const publicSiteDataController_1 = require("../controllers/publicSiteDataController");
const router = (0, express_1.Router)();
router.get('/site-data', publicSiteDataController_1.getPublicSiteData);
exports.default = router;
//# sourceMappingURL=publicSiteData.js.map