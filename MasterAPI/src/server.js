const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const { testConnection, initializeDatabase } = require('./config/database');
const masterDataRoutes = require('./routes/masterDataRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const API_VERSION = process.env.API_VERSION || 'v1';
const API_PREFIX = process.env.API_PREFIX || '/api';

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Master API Documentation',
            version: '1.0.0',
            description: 'Professional REST API for Master Data Management',
            contact: {
                name: 'TCE Dev Team',
                email: 'dev@tce.com'
            }
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Development server'
            }
        ]
    },
    apis: ['./src/routes/*.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(compression()); // Compress responses
app.use(express.json({ limit: '10mb' })); // Parse JSON
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded
app.use(morgan('dev')); // Logging

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// API Documentation
app.use(`${API_PREFIX}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Master API Docs'
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API Routes
app.use(`${API_PREFIX}/${API_VERSION}/master-data`, masterDataRoutes);

// Welcome route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to Master API',
        version: API_VERSION,
        documentation: `${API_PREFIX}/docs`,
        endpoints: {
            health: '/health',
            masterData: `${API_PREFIX}/${API_VERSION}/master-data`,
            docs: `${API_PREFIX}/docs`
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start server
const startServer = async () => {
    try {
        // Test database connection
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('❌ Failed to connect to database. Please check your configuration.');
            process.exit(1);
        }

        // Initialize database
        await initializeDatabase();

        // Start listening
        app.listen(PORT, () => {
            console.log('\n╔════════════════════════════════════════════════════════════╗');
            console.log('║                                                            ║');
            console.log('║              🚀 MASTER API SERVER STARTED                  ║');
            console.log('║                                                            ║');
            console.log('╚════════════════════════════════════════════════════════════╝\n');
            console.log(`📍 Server running on: http://localhost:${PORT}`);
            console.log(`📚 API Documentation: http://localhost:${PORT}${API_PREFIX}/docs`);
            console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
            console.log(`📊 Master Data API: http://localhost:${PORT}${API_PREFIX}/${API_VERSION}/master-data`);
            console.log(`\n⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔒 Rate Limit: ${process.env.RATE_LIMIT_MAX_REQUESTS || 100} requests per ${(parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 60000} minutes\n`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n🛑 SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT signal received: closing HTTP server');
    process.exit(0);
});

// Start the server
startServer();

module.exports = app;
