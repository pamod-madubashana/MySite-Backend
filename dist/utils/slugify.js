"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeUniqueSlug = exports.slugifyProjectTitle = void 0;
const slugifyProjectTitle = (title) => {
    const normalized = title
        .trim()
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
        .replace(/[\s_]+/g, "-")
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    return normalized || "project";
};
exports.slugifyProjectTitle = slugifyProjectTitle;
const makeUniqueSlug = async (baseSlug, exists) => {
    if (!(await exists(baseSlug))) {
        return baseSlug;
    }
    let suffix = 2;
    let candidate = `${baseSlug}-${suffix}`;
    while (await exists(candidate)) {
        suffix += 1;
        candidate = `${baseSlug}-${suffix}`;
    }
    return candidate;
};
exports.makeUniqueSlug = makeUniqueSlug;
//# sourceMappingURL=slugify.js.map