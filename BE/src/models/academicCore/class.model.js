/**
 * Class Model (MySQL/Sequelize)
 * Represents a class/course section
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sequelize');

const Class = sequelize.define('Class', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    className: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Class name is required' }
        },
        field: 'class_name'
    },
    semesterId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'semesters',
            key: 'id'
        },
        field: 'semester_id'
    },
    lecturerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        field: 'lecturer_id'
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    }
}, {
    tableName: 'classes',
    timestamps: false,
    indexes: [
        { fields: ['semester_id'] },
        { fields: ['lecturer_id'] }
    ]
});

module.exports = Class;
