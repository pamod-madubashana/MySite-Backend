"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDatabaseConnected = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const seedController_1 = require("../controllers/seedController");
let isConnected = false;
const connectDB = async () => {
    try {
        // Check if already connected
        if (isConnected) {
            console.log('Using existing MongoDB connection');
            return;
        }
        const conn = await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio', {
            serverSelectionTimeoutMS: 10000, // Increased to 10 seconds for better reliability
            socketTimeoutMS: 45000,
            maxPoolSize: 10, // Maintain up to 10 socket connections
        });
        isConnected = true;
        console.log(`📊 Database: ${conn.connection.name}`);
        // Seed database with default values if collections are empty
        await (0, seedController_1.seedDatabaseIfEmpty)();
        // Handle connection events
        mongoose_1.default.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
            isConnected = false;
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.log('🔌 MongoDB disconnected');
            isConnected = false;
            // Attempt to reconnect
            setTimeout(connectDB, 5000);
        });
        mongoose_1.default.connection.on('reconnected', () => {
            console.log('🔁 MongoDB reconnected successfully');
            isConnected = true;
            // Seed database with default values if collections are empty
            (0, seedController_1.seedDatabaseIfEmpty)().catch(console.error);
        });
    }
    catch (error) {
        console.error('❌ Database connection error:', error);
        console.log('⚠️  MongoDB connection failed - API will run without database persistence');
        console.log('💡 Retrying connection in 5 seconds...');
        // Don't exit - let the application continue without DB
        isConnected = false;
        // Retry connection after delay
        setTimeout(connectDB, 5000);
    }
};
// Function to check if database is connected
const isDatabaseConnected = () => isConnected;
exports.isDatabaseConnected = isDatabaseConnected;
exports.default = connectDB;
//# sourceMappingURL=database.js.map