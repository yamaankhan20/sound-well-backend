import { Sequelize } from 'sequelize';
// Database connection setup
const sequelize = new Sequelize('sound-well', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    port: 3306, // Default MySQL port, use if required
    dialectOptions: {
        ssl: false
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
