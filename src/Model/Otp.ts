// src/Model/Otp.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../backends/database_con';
import User from './Users';

class Otp extends Model {}

// Otp.belongsTo(User, {
//     foreignKey: 'user_id',
//     as: 'user',
// });


Otp.init(
    {
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
    },
    {
        sequelize,
        modelName: 'Otp_verification',  // Model name in the database
        timestamps: false,
    }
);




const syncDatabase = async () => {
    try {
        await sequelize.sync();
        console.log('Models synced successfully');
    } catch (error) {
        console.error('Error syncing models:', error);
    }
};

syncDatabase();

export default Otp;
