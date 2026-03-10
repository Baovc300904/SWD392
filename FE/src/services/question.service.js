import api from '../config/api.config';

/**
 * Question Service
 * Manages Q&A questions and answers
 */
const questionService = {
    /**
     * Get all questions
     * @param {Object} filters - Optional filters (status, groupId, etc.)
     * @returns {Promise<Array>} List of questions
     */
    getAllQuestions: async (filters = {}) => {
        try {
            const response = await api.get('/questions', { params: filters });
            return response.data || [];
        } catch (error) {
            console.error('Get all questions error:', error);
            throw error;
        }
    },

    /**
     * Get question by ID
     * @param {number} id - Question ID
     * @returns {Promise<Object>} Question data with answers
     */
    getQuestionById: async (id) => {
        try {
            const response = await api.get(`/questions/${id}`);
            return response.data;
        } catch (error) {
            console.error('Get question by ID error:', error);
            throw error;
        }
    },

    /**
     * Create new question
     * @param {Object} questionData - Question data (title, content, groupId, askedBy)
     * @returns {Promise<Object>} Created question
     */
    createQuestion: async (questionData) => {
        try {
            const response = await api.post('/questions', questionData);
            return response.data;
        } catch (error) {
            console.error('Create question error:', error);
            throw error;
        }
    },

    /**
     * Escalate question to manager
     * @param {number} id - Question ID
     * @returns {Promise<Object>} Escalation response
     */
    escalateQuestion: async (id) => {
        try {
            const response = await api.put(`/questions/${id}/escalate`);
            return response.data;
        } catch (error) {
            console.error('Escalate question error:', error);
            throw error;
        }
    },

    /**
     * Resolve question
     * @param {number} id - Question ID
     * @returns {Promise<Object>} Resolution response
     */
    resolveQuestion: async (id) => {
        try {
            const response = await api.put(`/questions/${id}/resolve`);
            return response.data;
        } catch (error) {
            console.error('Resolve question error:', error);
            throw error;
        }
    },

    /**
     * Get answers for a question
     * @param {number} questionId - Question ID
     * @returns {Promise<Array>} List of answers
     */
    getAnswers: async (questionId) => {
        try {
            const response = await api.get(`/questions/${questionId}/answers`);
            return response.data || [];
        } catch (error) {
            console.error('Get answers error:', error);
            throw error;
        }
    },

    /**
     * Create answer for a question
     * @param {number} questionId - Question ID
     * @param {Object} answerData - Answer data (content, answeredBy, isPublic)
     * @returns {Promise<Object>} Created answer
     */
    createAnswer: async (questionId, answerData) => {
        try {
            const response = await api.post(`/questions/${questionId}/answers`, answerData);
            return response.data;
        } catch (error) {
            console.error('Create answer error:', error);
            throw error;
        }
    },

    /**
     * Update answer
     * @param {number} answerId - Answer ID
     * @param {Object} answerData - Updated answer data
     * @returns {Promise<Object>} Updated answer
     */
    updateAnswer: async (answerId, answerData) => {
        try {
            const response = await api.put(`/answers/${answerId}`, answerData);
            return response.data;
        } catch (error) {
            console.error('Update answer error:', error);
            throw error;
        }
    },

    /**
     * Delete answer
     * @param {number} answerId - Answer ID
     * @returns {Promise<Object>} Delete response
     */
    deleteAnswer: async (answerId) => {
        try {
            const response = await api.delete(`/answers/${answerId}`);
            return response.data;
        } catch (error) {
            console.error('Delete answer error:', error);
            throw error;
        }
    },
};

export default questionService;
