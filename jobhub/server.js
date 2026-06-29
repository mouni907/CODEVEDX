import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from './server/config/db';
import { createServer as createViteServer } from 'vite';
// Routes
import authRoutes from './server/routes/authRoutes';
import companyRoutes from './server/routes/companyRoutes';
import jobRoutes from './server/routes/jobRoutes';
import applicationRoutes from './server/routes/applicationRoutes';
dotenv.config();
async function startServer() {
    const app = express();
    const PORT = 3000;
    // Connect to Database (with automatic local mock DB fallback if missing)
    await connectDB();
    // Basic Middlewares
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    // API Route Registrations
    app.use('/api/auth', authRoutes);
    app.use('/api/companies', companyRoutes);
    app.use('/api/jobs', jobRoutes);
    app.use('/api/applications', applicationRoutes);
    // Health check endpoint
    app.get('/api/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date() });
    });
    // Serve static client assets or mount Vite dev middleware
    if (process.env.NODE_ENV !== 'production') {
        console.log('Mounting Vite middleware in development mode...');
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    }
    else {
        console.log('Serving static files in production mode...');
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }
    // Global Error Handler
    app.use((err, req, res, next) => {
        console.error('Unhandled Server Error:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Internal Server Error',
        });
    });
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`==========================================================`);
        console.log(`🚀 JobHub Server booted successfully on port ${PORT}`);
        console.log(`👉 Access development portal at http://localhost:${PORT}`);
        console.log(`==========================================================`);
    });
}
startServer();
