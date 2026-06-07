type Env = {
    NODE_ENV?: string;
    CORS_ORIGINS?: string;
    FRONTEND_URL?: string;
    FRONTEND_URL_PROD?: string;
    ADMIN_TOKEN?: string;
    JWT_SECRET?: string;
    MONGODB_DATA_API_URL?: string;
    MONGODB_DATA_API_KEY?: string;
    MONGODB_DATA_SOURCE?: string;
    MONGODB_DATABASE?: string;
};
declare const _default: {
    fetch(request: Request, env: Env): Promise<Response>;
};
export default _default;
//# sourceMappingURL=worker.d.ts.map