/**
 * Submission Model (MySQL/Sequelize)
 * Represents group assignment submissions
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sequelize');

const Submission = sequelize.define('Submission', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'student_groups',
            key: 'id'
        },
        field: 'group_id'
    },
    submittedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        field: 'submitted_by'
    },
    milestoneName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'milestone_name'
    },
    fileUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'file_url'
    },
    filePath: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'file_path'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('SUBMITTED', 'GRADED'),
        defaultValue: 'SUBMITTED'
    },
    grade: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },
    feedback: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    gradedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        field: 'graded_by'
    },
    submittedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'submitted_at'
    },
    gradedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'graded_at'
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'updated_at'
    }
}, {
    tableName: 'submissions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['group_id'] },
        { fields: ['submitted_by'] },
        { fields: ['status'] },
        { fields: ['graded_by'] }
    ]
});

module.exports = Submission;
