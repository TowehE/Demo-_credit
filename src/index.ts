
import app from './app'; 
import { dbConfig } from './config/database';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 3000;

// Database connection test
dbConfig.raw('SELECT 1')
    .then(() => {
        logger.info('Database connected successfully');
        
        // Only start server after successful DB connection
        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
         console.error(' Database connection failed:', error);
        logger.error('Database connection failed:', error);
        process.exit(1);
    });

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    dbConfig.destroy();
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    dbConfig.destroy();
    process.exit(0);
});

