import api from '../config/api.config';
import firebaseStorageService from './firebase-storage.service';

/**
 * Topic Service
 * Manages project topics and approvals
 */
const topicService = {
    extractPayload: (response) => response?.data ?? response,

    /**
     * Get all topics
     * @param {Object} filters - Optional filters (status, proposedBy, etc.)
     * @returns {Promise<Array>} List of all topics
     */
    getAllTopics: async (filters = {}) => {
        try {
            const response = await api.get('/topics', { params: filters });
            return topicService.extractPayload(response);
        } catch (error) {
            console.error('Get all topics error:', error);
            throw error;
        }
    },

    /**
     * Get topic by ID
     * @param {number} id - Topic ID
     * @returns {Promise<Object>} Topic data
     */
    getTopicById: async (id) => {
        try {
            const response = await api.get(`/topics/${id}`);
            return topicService.extractPayload(response);
        } catch (error) {
            console.error('Get topic by ID error:', error);
            throw error;
        }
    },

    /**
     * Create new topic
     * @param {Object} topicData - Topic data (title, description, proposedBy)
     * @returns {Promise<Object>} Created topic
     */
    createTopic: async (topicData, syllabusFile = null) => {
        try {
            if (syllabusFile) {
                if (firebaseStorageService.isEnabled()) {
                    const uploaded = await firebaseStorageService.uploadFile(syllabusFile, 'topics/syllabus');
                    const payload = {
                        ...topicData,
                        descriptionFile: uploaded.url,
                    };

                    const response = await api.post('/topics', payload);
                    return topicService.extractPayload(response);
                }

                const payload = {
                    ...topicData,
                    descriptionFile: syllabusFile?.name || null,
                };
                const response = await api.post('/topics', payload);
                return topicService.extractPayload(response);
            }

            const response = await api.post('/topics', topicData);
            return topicService.extractPayload(response);
        } catch (error) {
            console.error('Create topic error:', error);
            throw error;
        }
    },

    /**
     * Update topic
     * @param {number} id - Topic ID
     * @param {Object} topicData - Updated topic data
     * @returns {Promise<Object>} Updated topic
     */
    updateTopic: async (id, topicData, syllabusFile = null) => {
        try {
            if (syllabusFile) {
                if (firebaseStorageService.isEnabled()) {
                    const uploaded = await firebaseStorageService.uploadFile(syllabusFile, 'topics/syllabus');
                    const payload = {
                        ...topicData,
                        descriptionFile: uploaded.url,
                    };

                    const response = await api.put(`/topics/${id}`, payload);
                    return topicService.extractPayload(response);
                }

                const payload = {
                    ...topicData,
                    descriptionFile: syllabusFile?.name || null,
                };
                const response = await api.put(`/topics/${id}`, payload);
                return topicService.extractPayload(response);
            }

            const response = await api.put(`/topics/${id}`, topicData);
            return topicService.extractPayload(response);
        } catch (error) {
            console.error('Update topic error:', error);
            throw error;
        }
    },

    /**
     * Delete topic
     * @param {number} id - Topic ID
     * @returns {Promise<Object>} Delete response
     */
    deleteTopic: async (id) => {
        try {
            const response = await api.delete(`/topics/${id}`);
            return topicService.extractPayload(response);
        } catch (error) {
            console.error('Delete topic error:', error);
            throw error;
        }
    },

    /**
     * Approve topic (Manager only)
     * @param {number} id - Topic ID
     * @param {number} approvedBy - Manager user ID
     * @returns {Promise<Object>} Approval response
     */
    approveTopic: async (id, approvedBy) => {
        try {
            const response = await api.put(`/topics/${id}/approve`, { approvedBy });
            return topicService.extractPayload(response);
        } catch (error) {
            console.error('Approve topic error:', error);
            throw error;
        }
    },

    /**
     * Reject topic (Manager only)
     * @param {number} id - Topic ID
     * @returns {Promise<Object>} Rejection response
     */
    rejectTopic: async (id, reason = '') => {
        try {
            const payload = reason ? { rejectionReason: reason } : undefined;
            const response = await api.put(`/topics/${id}/reject`, payload);
            return topicService.extractPayload(response);
        } catch (error) {
            console.error('Reject topic error:', error);
            throw error;
        }
    },

    registerTopicForGroup: async (topicId, groupId) => {
        try {
            const response = await api.post(`/topics/${topicId}/register`, { groupId });
            return topicService.extractPayload(response);
        } catch (error) {
            console.error('Register topic for group error:', error);
            throw error;
        }
    },
};

export default topicService;
