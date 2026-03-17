/**
 * QuestionDraft Model (MySQL/Sequelize)
 * Stores AI-generated draft answers for lecturer/manager review
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sequelize');

const QuestionDraft = sequelize.define('QuestionDraft', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    questionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'questions',
            key: 'id'
        },
        field: 'question_id'
    },
    lecturerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        field: 'lecturer_id'
    },
    draft: {
        type: DataTypes.TEXT,
        allowNull: false
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
    tableName: 'question_drafts',
    timestamps: true,
    indexes: [
        { fields: ['question_id'] },
        { fields: ['lecturer_id'] },
        { fields: ['created_at'] }
    ]
});

module.exports = QuestionDraft;
