import api from '../config/api.config';

/**
 * Group Service
 * Manages student groups and members
 */
const groupService = {
    /**
     * Get all groups
     * @param {Object} filters - Optional query params
     * @returns {Promise<Array>} List of all groups
     */
    getAllGroups: async (filters = {}) => {
        try {
            const params = new URLSearchParams(filters);
            const url = params.toString() ? `/groups?${params.toString()}` : '/groups';
            const response = await api.get(url);
            return response.data || [];
        } catch (error) {
            console.error('Get all groups error:', error);
            throw error;
        }
    },

    /**
     * Get group by ID
     * @param {number} id - Group ID
     * @returns {Promise<Object>} Group data
     */
    getGroupById: async (id) => {
        try {
            const response = await api.get(`/groups/${id}`);
            return response.data;
        } catch (error) {
            console.error('Get group by ID error:', error);
            throw error;
        }
    },

    /**
     * Get group members
     * @param {number} groupId - Group ID
     * @returns {Promise<Array>} List of group members
     */
    getGroupMembers: async (groupId) => {
        try {
            const response = await api.get(`/groups/${groupId}/members`);
            return response.data || [];
        } catch (error) {
            console.error('Get group members error:', error);
            throw error;
        }
    },

    /**
     * Create new group
     * @param {Object} groupData - Group data
     * @returns {Promise<Object>} Created group
     */
    createGroup: async (groupData) => {
        try {
            const response = await api.post('/groups', groupData);
            return response.data;
        } catch (error) {
            console.error('Create group error:', error);
            throw error;
        }
    },

    /**
     * Update group
     * @param {number} id - Group ID
     * @param {Object} groupData - Updated group data
     * @returns {Promise<Object>} Updated group
     */
    updateGroup: async (id, groupData) => {
        try {
            const response = await api.put(`/groups/${id}`, groupData);
            return response.data;
        } catch (error) {
            console.error('Update group error:', error);
            throw error;
        }
    },

    /**
     * Delete group
     * @param {number} id - Group ID
     * @returns {Promise<Object>} Delete response
     */
    deleteGroup: async (id) => {
        try {
            const response = await api.delete(`/groups/${id}`);
            return response.data;
        } catch (error) {
            console.error('Delete group error:', error);
            throw error;
        }
    },

    /**
     * Add member to group
     * @param {number} groupId - Group ID
     * @param {number} studentId - Student ID to add
     * @returns {Promise<Object>} Add member response
     */
    addGroupMember: async (groupId, studentId) => {
        try {
            const response = await api.post(`/groups/${groupId}/members`, { userId: studentId });
            return response.data;
        } catch (error) {
            console.error('Add group member error:', error);
            throw error;
        }
    },

    /**
     * Remove member from group
     * @param {number} groupId - Group ID
     * @param {number} memberId - Member ID to remove
     * @returns {Promise<Object>} Remove member response
     */
    removeGroupMember: async (groupId, memberId) => {
        try {
            const response = await api.delete(`/groups/${groupId}/members/${memberId}`);
            return response.data;
        } catch (error) {
            console.error('Remove group member error:', error);
            throw error;
        }
    },
};

export default groupService;
