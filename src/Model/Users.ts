// src/Model/Users.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../backends/database_con';
import Otp from './Otp';

class User extends Model {}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
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
            defaultValue: '0',
        },
        roles: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'user',
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'User',
        timestamps: false,
    }
);


User.hasMany(Otp, {
    foreignKey: 'user_id',
    as: 'otps',  // Using an alias to avoid conflict
});

export default User;
