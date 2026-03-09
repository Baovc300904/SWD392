/**
 * Topic Model (MySQL/Sequelize)
 * Represents project topics proposed by lecturers
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sequelize');

const Topic = sequelize.define('Topic', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Title is required' }
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
        defaultValue: 'PENDING'
    },
    proposedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        field: 'proposed_by'
    },
    approvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        field: 'approved_by'
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    }
}, {
    tableName: 'topics',
    timestamps: false,
    indexes: [
        { fields: ['status'] },
        { fields: ['proposed_by'] },
        { fields: ['approved_by'] }
    ]
});

module.exports = Topic;
