import { DataTypes } from 'sequelize';
import sequelize from '../backends/database_con';

const Otp = sequelize.define('Otp_verification', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Otp: {
        type: DataTypes.INTEGER,
        allowNull: false,
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

export default Otp;
