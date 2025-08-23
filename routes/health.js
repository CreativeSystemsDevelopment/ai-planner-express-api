const express = require('express');
const router = express.Router();

// GET /api/health - Health check endpoint
router.get('/', (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: require('../package.json').version,
    services: {
      geminiApi: process.env.GEMINI_API_KEY || process.env.API_KEY ? 'configured' : 'not configured'
    }
  };

  res.json(healthCheck);
});

// GET /api/health/detailed - Detailed health check
router.get('/detailed', async (req, res) => {
  const memUsage = process.memoryUsage();
  
  const detailedHealth = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: require('../package.json').version,
    system: {
      memory: {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)} MB`
      },
      nodeVersion: process.version,
      platform: process.platform
    },
    services: {
      geminiApi: process.env.GEMINI_API_KEY || process.env.API_KEY ? 'configured' : 'not configured'
    },
    endpoints: {
      plan: '/api/plan',
      health: '/api/health',
      healthDetailed: '/api/health/detailed'
    }
  };

  res.json(detailedHealth);
});

module.exports = router;