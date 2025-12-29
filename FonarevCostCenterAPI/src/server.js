const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const { testConnection, initializeTables } = require('./config/database');
const hierarchicalRoutes = require('./routes/hierarchicalRoutes');
const costCenterRoutes = require('./routes/costCenterRoutes');

const app = express();
const PORT = process.env.PORT || 3001;
const API_VERSION = process.env.API_VERSION || 'v1';

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Fonarev Cost Center API',
            version: '1.0.0',
            description: 'Hierarchical API for Department, Activities, Sub-Activities, and Tasks with Budget Details',
            contact: {
                name: 'TCE Dev Team',
                email: 'dev@tce.com'
            }
        },
        servers: [
            {
                url: `http://localhost:${PORT}/api/${API_VERSION}`,
                description: 'Development server'
            }
        ],
        tags: [
            {
                name: 'Hierarchical',
                description: 'Hierarchical endpoints for cascading dropdowns'
            },
            {
                name: 'Cost Center',
                description: 'CRUD operations for cost center data'
            }
        ]
    },
    apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // Logging

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Fonarev Cost Center API Docs'
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Fonarev Cost Center API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API Routes
app.use(`/api/${API_VERSION}`, hierarchicalRoutes);
app.use(`/api/${API_VERSION}/cost-center`, costCenterRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Fonarev Cost Center API',
        version: '1.0.0',
        documentation: `http://localhost:${PORT}/api/docs`,
        endpoints: {
            hierarchical: {
                departments: `/api/${API_VERSION}/departments`,
                activities: `/api/${API_VERSION}/departments/:code/activities`,
                subActivities: `/api/${API_VERSION}/departments/:code/activities/:code/sub-activities`,
                tasks: `/api/${API_VERSION}/departments/:code/activities/:code/sub-activities/:code/tasks`
            },
            costCenter: {
                getAll: `/api/${API_VERSION}/cost-center`,
                getById: `/api/${API_VERSION}/cost-center/:id`,
                search: `/api/${API_VERSION}/cost-center/search/:term`,
                stats: `/api/${API_VERSION}/cost-center/stats`
            }
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.path
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Start server
const startServer = async () => {
    try {
        // Test database connection
        console.log('🔄 Testing database connection...');
        const dbConnected = await testConnection();

        if (!dbConnected) {
            console.error('❌ Failed to connect to database. Please check your configuration.');
            process.exit(1);
        }

        // Initialize tables
        console.log('🔄 Initializing database tables...');
        await initializeTables();

        // Start listening
        app.listen(PORT, () => {
            console.log('\n╔════════════════════════════════════════════════════════════════╗');
            console.log('║                                                                ║');
            console.log('║   🚀 FONAREV COST CENTER API - SERVER STARTED                 ║');
            console.log('║                                                                ║');
            console.log('╚════════════════════════════════════════════════════════════════╝\n');
            console.log(`📍 Server running on: http://localhost:${PORT}`);
            console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
            console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
            console.log(`\n🎯 Main Endpoints:`);
            console.log(`   • GET /api/${API_VERSION}/departments`);
            console.log(`   • GET /api/${API_VERSION}/departments/:code/activities`);
            console.log(`   • GET /api/${API_VERSION}/departments/:code/activities/:code/sub-activities`);
            console.log(`   • GET /api/${API_VERSION}/departments/:code/activities/:code/sub-activities/:code/tasks`);
            console.log(`\n📊 Additional Endpoints:`);
            console.log(`   • GET /api/${API_VERSION}/cost-center (CRUD operations)`);
            console.log(`   • GET /api/${API_VERSION}/cost-center/stats`);
            console.log(`\n✅ Ready to accept requests!\n`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\nSIGINT signal received: closing HTTP server');
    process.exit(0);
});

// Start the server
startServer();

module.exports = app;
