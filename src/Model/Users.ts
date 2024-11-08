import { DataTypes } from 'sequelize';
import sequelize from '../backends/database_con';

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    is_verified: {
        type: DataTypes.STRING,
        defaultValue: 0,
    },
    roles:{
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'user',
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    timestamps: false,
});

const syncDatabase = async () => {
    try {
        await sequelize.sync();
        console.log('User model synced with database');
    } catch (error) {
        console.error('Error syncing database:', error);
    }
};

syncDatabase();

export default User; // User model ko export karein
