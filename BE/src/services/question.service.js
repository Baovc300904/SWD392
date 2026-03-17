// question.service.js
// Service xử lý logic liên quan đến câu hỏi

const db = require('../models');

/**
 * Lấy danh sách tất cả câu hỏi
 * @returns {Promise<Array>} Danh sách câu hỏi
 */
async function getAllQuestions() {
    return db.Question.findAll();
}

/**
 * Lấy chi tiết một câu hỏi theo ID
 * @param {number} id - ID của câu hỏi
 * @returns {Promise<Object|null>} Câu hỏi hoặc null nếu không tìm thấy
 */
async function getQuestionById(id) {
    return db.Question.findByPk(id);
}

/**
 * Tạo mới một câu hỏi
 * @param {Object} data - Dữ liệu câu hỏi
 * @returns {Promise<Object>} Câu hỏi vừa tạo
 */
async function createQuestion(data) {
    return db.Question.create(data);
}

/**
 * Cập nhật một câu hỏi
 * @param {number} id - ID câu hỏi
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Promise<[number, Object[]]>} Số lượng bản ghi cập nhật và mảng câu hỏi cập nhật
 */
async function updateQuestion(id, data) {
    return db.Question.update(data, { where: { id } });
}

/**
 * Xóa một câu hỏi
 * @param {number} id - ID câu hỏi
 * @returns {Promise<number>} Số lượng bản ghi đã xóa
 */
async function deleteQuestion(id) {
    return db.Question.destroy({ where: { id } });
}

module.exports = {
    getAllQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
};
