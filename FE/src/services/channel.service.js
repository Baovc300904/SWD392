import api from '../config/api.config';

/**
 * Channel Service - Manages chat channels (chat rooms)
 * Based on CHANNEL entity in database schema
 */
export const channelService = {
  /**
   * Get all channels for a group
   * @param {number} groupId - Group ID
   * @param {Object} filters - Optional filters (type: PUBLIC/PRIVATE)
   * @returns {Promise<Array>} List of channels
   */
  getGroupChannels: async (groupId, filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/groups/${groupId}/channels?${params}`);
  },

  /**
   * Get channel by ID
   * @param {number} channelId - Channel ID
   * @returns {Promise<Object>} Channel details
   */
  getChannelById: async (channelId) => {
    return await api.get(`/channels/${channelId}`);
  },

  /**
   * Create new channel
   * @param {Object} channelData
   * @param {number} channelData.groupId - Group ID
   * @param {number} channelData.classId - Class ID (optional)
   * @param {string} channelData.name - Channel name
   * @param {string} channelData.type - PUBLIC or PRIVATE
   * @returns {Promise<Object>} Created channel
   */
  createChannel: async (channelData) => {
    return await api.post('/channels', {
      groupId: channelData.groupId,
      classId: channelData.classId,
      name: channelData.name,
      type: channelData.type || 'PUBLIC'
    });
  },

  /**
   * Update channel
   * @param {number} channelId - Channel ID
   * @param {Object} channelData - Update data
   * @returns {Promise<Object>} Updated channel
   */
  updateChannel: async (channelId, channelData) => {
    return await api.put(`/channels/${channelId}`, channelData);
  },

  /**
   * Delete channel
   * @param {number} channelId - Channel ID
   * @returns {Promise<Object>} Delete confirmation
   */
  deleteChannel: async (channelId) => {
    return await api.delete(`/channels/${channelId}`);
  },

  /**
   * Get channel members
   * @param {number} channelId - Channel ID
   * @returns {Promise<Array>} List of channel members
   */
  getChannelMembers: async (channelId) => {
    return await api.get(`/channels/${channelId}/members`);
  },

  /**
   * Add member to channel
   * @param {number} channelId - Channel ID
   * @param {number} userId - User ID or Student ID
   * @returns {Promise<Object>} Added member
   */
  addMember: async (channelId, userId) => {
    return await api.post(`/channels/${channelId}/members`, { userId });
  },

  /**
   * Remove member from channel
   * @param {number} channelId - Channel ID
   * @param {number} memberId - Channel Member ID
   * @returns {Promise<Object>} Remove confirmation
   */
  removeMember: async (channelId, memberId) => {
    return await api.delete(`/channels/${channelId}/members/${memberId}`);
  },

  /**
   * Get default channel for a group
   * @param {number} groupId - Group ID
   * @returns {Promise<Object>} Default channel (general-chat)
   */
  getDefaultChannel: async (groupId) => {
    return await api.get(`/groups/${groupId}/channels/default`);
  }
};

export default channelService;
