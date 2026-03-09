/**
 * AcademicCore Module - Index with Associations
 * Central export point for all Academic Core models
 */

const User = require('./user.model');
const Topic = require('./topic.model');
const Class = require('./class.model');
const StudentGroup = require('./studentGroup.model');
const GroupMember = require('./groupMember.model');
const Question = require('./question.model');
const Answer = require('./answer.model');

// ====================================
// Define Associations
// ====================================

// User Associations
User.hasMany(Class, { foreignKey: 'lecturerId', as: 'classesManaged' });
User.hasMany(Topic, { foreignKey: 'proposedBy', as: 'topicsProposed' });
User.hasMany(Topic, { foreignKey: 'approvedBy', as: 'topicsApproved' });
User.hasMany(Question, { foreignKey: 'askedBy', as: 'questionsAsked' });
User.hasMany(Answer, { foreignKey: 'answeredBy', as: 'answersGiven' });
User.belongsToMany(StudentGroup, { through: GroupMember, foreignKey: 'studentId', as: 'groups' });

// Topic Associations
Topic.belongsTo(User, { foreignKey: 'proposedBy', as: 'proposer' });
Topic.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });
Topic.hasMany(StudentGroup, { foreignKey: 'topicId', as: 'groups' });

// Class Associations
Class.belongsTo(User, { foreignKey: 'lecturerId', as: 'lecturer' });
Class.hasMany(StudentGroup, { foreignKey: 'classId', as: 'groups' });

// StudentGroup Associations
StudentGroup.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
StudentGroup.belongsTo(Topic, { foreignKey: 'topicId', as: 'topic' });
StudentGroup.hasMany(Question, { foreignKey: 'groupId', as: 'questions' });
StudentGroup.belongsToMany(User, { through: GroupMember, foreignKey: 'groupId', as: 'members' });

// GroupMember Associations
GroupMember.belongsTo(StudentGroup, { foreignKey: 'groupId', as: 'group' });
GroupMember.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

// Question Associations
Question.belongsTo(StudentGroup, { foreignKey: 'groupId', as: 'group' });
Question.belongsTo(User, { foreignKey: 'askedBy', as: 'asker' });
Question.hasMany(Answer, { foreignKey: 'questionId', as: 'answers' });

// Answer Associations
Answer.belongsTo(Question, { foreignKey: 'questionId', as: 'question' });
Answer.belongsTo(User, { foreignKey: 'answeredBy', as: 'answerer' });

// Export all models
module.exports = {
    User,
    Topic,
    Class,
    StudentGroup,
    GroupMember,
    Question,
    Answer
};
