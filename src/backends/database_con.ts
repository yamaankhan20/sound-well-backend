import { Sequelize } from 'sequelize';

// Database connection setup
const sequelize = new Sequelize('sound-well', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
});

// Test the database connection
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to MySQL database');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

testConnection();

export default sequelize;
