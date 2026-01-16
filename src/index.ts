import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import connectDB, { isDatabaseConnected } from './config/database'
import authRoutes from './routes/auth';
import articleRoutes from './routes/articles';
import githubRoutes from './routes/github';
import settingsRoutes from './routes/settings';
import projectRoutes from './routes/projects';
import dashboardRoutes from './routes/dashboard';

dotenv.config()

const app = express()
app.set("trust proxy", 1);
const PORT = parseInt(process.env.PORT || '5000')

// Connect to MongoDB (non-blocking with retry)
connectDB().catch(err => {
  console.error('❌ Initial database connection attempt failed:', err.message);
  console.log('🔄 Automatic retry will be attempted by the connection handler');
});

// Security middleware
app.use(helmet())

// Determine allowed origins for CORS based on environment
const determineAllowedOrigins = (): string[] => {
  // Check for NODE_ENV to determine environment
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (process.env.CORS_ORIGINS) {
    // Split multiple origins if provided
    return process.env.CORS_ORIGINS.split(',').map((origin: string) => origin.trim());
  } else if (isProduction && process.env.FRONTEND_URL_PROD) {
    // Production environment
    return [process.env.FRONTEND_URL_PROD];
  } else if (!isProduction && process.env.FRONTEND_URL_DEV) {
    // Development environment
    return [process.env.FRONTEND_URL_DEV];
  } else if (process.env.FRONTEND_URL) {
    // Fallback to general FRONTEND_URL
    return [process.env.FRONTEND_URL];
  } else {
    // Default fallback
    return ['http://localhost:3000', 'http://localhost:8080'];
  }
};

const allowedOrigins = determineAllowedOrigins();

console.log('🔧 CORS:', process.env.NODE_ENV || 'development', '- Origins:', allowedOrigins.join(', '));

// Configure CORS to accept both development and production origins
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`🚫 Origin blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Routes


app.use('/api/auth', authRoutes)
app.use('/api/articles', articleRoutes)
app.use('/api/github', githubRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/dashboard', dashboardRoutes)


app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "portfolio-backend",
    message: "Backend is running 🚀"
  });
});


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000,https://pamod.is-a.dev'}`);
  console.log(`📡 CORS Origins: ${process.env.CORS_ORIGINS || 'Not configured'}`);
  
  // Check database connection status after startup
  setTimeout(() => {
    if (isDatabaseConnected()) {
      console.log('✅ Database connected');
    } else {
      console.log('⚠️  Database connection unavailable - reconnection in progress');
    }
  }, 3000);
})

export default app