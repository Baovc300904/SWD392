// question.service.js
// Service xử lý logic liên quan đến câu hỏi

const db = require('../models');
const { generateGeminiDraft } = require('./ai/services/geminiDraft.service');

let questionDraftStorageReady = false;

async function ensureQuestionDraftStorage() {
    if (questionDraftStorageReady) {
        return;
    }

    await db.QuestionDraft.sync();
    questionDraftStorageReady = true;
}

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

/**
 * Sinh và lưu bản nháp AI cho một câu hỏi
 * @param {number} questionId - ID câu hỏi
 * @param {number} lecturerId - ID người yêu cầu sinh nháp
 * @returns {Promise<Object>} Bản ghi QuestionDraft vừa tạo
 */
async function generateDraftForQuestion(questionId, lecturerId) {
    let canPersistDraft = true;
    try {
        await ensureQuestionDraftStorage();
    } catch (storageError) {
        canPersistDraft = false;
        console.error('[generateDraftForQuestion] Draft storage unavailable:', storageError.message);
    }

    const question = await db.Question.findByPk(questionId, {
        include: [{
            model: db.StudentGroup,
            as: 'group',
            include: [
                { model: db.Class, as: 'class', attributes: ['id', 'className', 'lecturerId'] },
                { model: db.Topic, as: 'topic', attributes: ['id', 'title', 'description'] }
            ]
        }, {
            model: db.User,
            as: 'asker',
            attributes: ['id', 'fullName', 'email']
        }]
    });

    if (!question) {
        throw new Error('Question not found');
    }

    const prompt = [
        'Viết 1 bản nháp trả lời ngắn cho giảng viên gửi sinh viên.',
        'Yêu cầu: tiếng Việt lịch sự, rõ ý, 3-5 câu, tối đa 120 từ.',
        'Không giải thích dài, không liệt kê nhiều mục, không nhắc bạn là AI.',
        'Nếu thiếu dữ kiện thì trả lời ngắn gọn và gợi ý bước kiểm tra tiếp theo.',
        '',
        `Lớp: ${question.group?.class?.className || 'N/A'}`,
        `Đề tài: ${question.group?.topic?.title || 'N/A'}`,
        `Câu hỏi: ${question.title || 'N/A'}`,
        `Chi tiết: ${question.content || 'N/A'}`
    ].join('\n');

    const draftText = await generateGeminiDraft(prompt, process.env.GEMINI_MODEL || 'gemini-2.5-flash');

    const normalizedDraft = String(draftText || '').trim();

    if (canPersistDraft) {
        try {
            const draft = await db.QuestionDraft.create({
                questionId: question.id,
                lecturerId,
                draft: normalizedDraft
            });
            return draft;
        } catch (persistError) {
            console.error('[generateDraftForQuestion] Persist draft failed:', persistError.message);
        }
    }

    return {
        id: null,
        questionId: question.id,
        lecturerId,
        draft: normalizedDraft,
        createdAt: new Date(),
        updatedAt: new Date()
    };
}

module.exports = {
    getAllQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    generateDraftForQuestion,
};
