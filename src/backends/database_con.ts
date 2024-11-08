import { Sequelize } from 'sequelize';

// Database connection setup
const sequelize = new Sequelize('thesoundwell-vibro-therapy-server', 'avfxmkkera', 'EHyN$sIJ6hKAW7Y3', {
    host: 'thesoundwell-vibro-therapy-server.mysql.database.azure.com',
    dialect: 'mysql',
    port: 3306, // Default MySQL port, use if required
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false // You might need this for secure connections
        }
    }
});

// Test the database connection
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to MySQL database successfully');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

testConnection();

export default sequelize;
