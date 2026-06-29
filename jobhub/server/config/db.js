import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
let mongoConnected = false;
export const connectDB = async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.warn('\x1b[33m%s\x1b[0m', '⚠️  No MONGODB_URI environment variable detected.');
        console.warn('\x1b[33m%s\x1b[0m', '👉 JobHub will run in Local/Mock DB mode with pre-populated seed data.');
        mongoConnected = false;
        return false;
    }
    try {
        // Lazy connect or direct connect
        mongoose.set('strictQuery', false);
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('\x1b[32m%s\x1b[0m', '✅ MongoDB Atlas Connected Successfully!');
        mongoConnected = true;
        return true;
    }
    catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `❌ Failed to connect to MongoDB Atlas: ${error.message}`);
        console.warn('\x1b[33m%s\x1b[0m', '👉 Falling back to Local/Mock DB mode for full sandbox interactive experience.');
        mongoConnected = false;
        return false;
    }
};
export const isMongoConnected = () => {
    return mongoConnected && mongoose.connection.readyState === 1;
};
