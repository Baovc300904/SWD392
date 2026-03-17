// src/models/academicCore/questionDraft.model.js
// Sequelize model cho bảng QuestionDraft

module.exports = (sequelize, DataTypes) => {
    const QuestionDraft = sequelize.define('QuestionDraft', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        questionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Questions',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        lecturerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        draft: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'QuestionDrafts',
        timestamps: true,
    });

    QuestionDraft.associate = function (models) {
        QuestionDraft.belongsTo(models.Question, { foreignKey: 'questionId', as: 'question' });
        QuestionDraft.belongsTo(models.User, { foreignKey: 'lecturerId', as: 'lecturer' });
    };

    return QuestionDraft;
};
