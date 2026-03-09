/**
 * User Model (MySQL/Sequelize)
 * Represents Student, Lecturer, and Manager
 */
const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const { sequelize } = require('../../config/database.sequelize');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fullName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Full name is required' }
        },
        field: 'full_name'
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: {
            msg: 'Email already exists'
        },
        validate: {
            notEmpty: { msg: 'Email is required' },
            isEmail: { msg: 'Please provide a valid email' }
        }
    },
    passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Password is required' }
        },
        field: 'password_hash'
    },
    role: {
        type: DataTypes.ENUM('STUDENT', 'LECTURER', 'MANAGER'),
        allowNull: false,
        validate: {
            isIn: {
                args: [['STUDENT', 'LECTURER', 'MANAGER']],
                msg: 'Role must be STUDENT, LECTURER, or MANAGER'
            }
        }
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    }
}, {
    tableName: 'users',
    timestamps: false,
    indexes: [
        { fields: ['email'], unique: true },
        { fields: ['role'] }
    ]
});

// Hash password before saving
User.beforeCreate(async (user) => {
    if (user.passwordHash) {
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
    }
});

User.beforeUpdate(async (user) => {
    if (user.changed('passwordHash')) {
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
    }
});

// Method to compare password
User.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = User;
