"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const database_1 = __importStar(require("./config/database"));
const auth_1 = __importDefault(require("./routes/auth"));
const articles_1 = __importDefault(require("./routes/articles"));
const github_1 = __importDefault(require("./routes/github"));
const settings_1 = __importDefault(require("./routes/settings"));
const projects_1 = __importDefault(require("./routes/projects"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const enhancedDashboard_1 = __importDefault(require("./routes/enhancedDashboard"));
const timeline_1 = __importDefault(require("./routes/timeline"));
const techSkills_1 = __importDefault(require("./routes/techSkills"));
const interests_1 = __importDefault(require("./routes/interests"));
const techStackCategories_1 = __importDefault(require("./routes/techStackCategories"));
const imageUpload_1 = __importDefault(require("./routes/imageUpload"));
const contact_1 = __importDefault(require("./routes/contact"));
const adminMessages_1 = __importDefault(require("./routes/adminMessages"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.set("trust proxy", 1);
const PORT = parseInt(process.env.PORT || '5000');
// Connect to MongoDB (non-blocking with retry)
(0, database_1.default)().catch(err => {
    console.error('❌ Initial database connection attempt failed:', err.message);
    console.log('🔄 Automatic retry will be attempted by the connection handler');
});
// Security middleware
app.use((0, helmet_1.default)());
// Determine allowed origins for CORS based on environment
const determineAllowedOrigins = () => {
    // Check for NODE_ENV to determine environment
    const isProduction = process.env.NODE_ENV === 'production';
    if (process.env.CORS_ORIGINS) {
        // Split multiple origins if provided
        return process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim());
    }
    else if (isProduction && process.env.FRONTEND_URL_PROD) {
        // Production environment
        return [process.env.FRONTEND_URL_PROD];
    }
    else if (!isProduction && process.env.FRONTEND_URL_DEV) {
        // Development environment
        return [process.env.FRONTEND_URL_DEV];
    }
    else if (process.env.FRONTEND_URL) {
        // Fallback to general FRONTEND_URL
        return [process.env.FRONTEND_URL];
    }
    else {
        // Default fallback
        return ['http://localhost:3000', 'http://localhost:8080'];
    }
};
const allowedOrigins = determineAllowedOrigins();
console.log('🔧 CORS:', process.env.NODE_ENV || 'development', '- Origins:', allowedOrigins.join(', '));
// Configure CORS to accept both development and production origins
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.log(`🚫 Origin blocked: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Routes
app.use('/auth', auth_1.default);
app.use('/articles', articles_1.default);
app.use('/github', github_1.default);
app.use('/settings', settings_1.default);
app.use('/projects', projects_1.default);
app.use('/dashboard', dashboard_1.default);
app.use('/dashboard/enhanced', enhancedDashboard_1.default);
app.use('/timeline', timeline_1.default);
app.use('/tech-skills', techSkills_1.default);
app.use('/interests', interests_1.default);
app.use('/tech-stack-categories', techStackCategories_1.default);
app.use('/image-upload', imageUpload_1.default);
app.use('/contact', contact_1.default);
app.use('/api/contact', contact_1.default);
app.use('/api/admin', adminMessages_1.default);
app.get("/", (req, res) => {
    res.json({
        status: "ok",
        service: "portfolio-backend",
        message: "Backend is running 🚀"
    });
});
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000,https://pamod.is-a.dev'}`);
    console.log(`📡 CORS Origins: ${process.env.CORS_ORIGINS || 'Not configured'}`);
    // Check database connection status after startup
    setTimeout(() => {
        if ((0, database_1.isDatabaseConnected)()) {
            console.log('✅ Database connected');
        }
        else {
            console.log('⚠️  Database connection unavailable - reconnection in progress');
        }
    }, 3000);
});
exports.default = app;
//# sourceMappingURL=index.js.map