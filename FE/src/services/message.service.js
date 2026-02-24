import api from '../config/api.config';

/**
 * Message Service - Manages chat messages, reactions, and attachments
 * Based on MESSAGE, REACTION, and ATTACHMENT entities in database schema
 */
export const messageService = {
  /**
   * Get messages for a channel
   * @param {number} channelId - Channel ID
   * @param {Object} options - Pagination and filter options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Messages per page (default: 50)
   * @param {number} options.parentMsgId - Parent message ID for thread replies
   * @returns {Promise<Object>} Messages with pagination info
   */
  getChannelMessages: async (channelId, options = {}) => {
    const { page = 1, limit = 50, parentMsgId } = options;
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(parentMsgId && { parentMsgId: parentMsgId.toString() })
    });
    return await api.get(`/channels/${channelId}/messages?${params}`);
  },

  /**
   * Get message by ID
   * @param {number} messageId - Message ID
   * @returns {Promise<Object>} Message details
   */
  getMessageById: async (messageId) => {
    return await api.get(`/messages/${messageId}`);
  },

  /**
   * Send new message
   * @param {Object} messageData
   * @param {number} messageData.channelId - Channel ID
   * @param {string} messageData.content - Message content
   * @param {number} messageData.parentMsgId - Parent message ID (for thread replies)
   * @param {Array} messageData.attachments - File attachments
   * @returns {Promise<Object>} Created message
   */
  sendMessage: async (messageData) => {
    return await api.post('/messages', {
      channelId: messageData.channelId,
      content: messageData.content,
      parentMsgId: messageData.parentMsgId || null,
      attachments: messageData.attachments || []
    });
  },

  /**
   * Update message
   * @param {number} messageId - Message ID
   * @param {Object} updateData
   * @param {string} updateData.content - Updated content
   * @returns {Promise<Object>} Updated message
   */
  updateMessage: async (messageId, updateData) => {
    return await api.put(`/messages/${messageId}`, updateData);
  },

  /**
   * Delete message
   * @param {number} messageId - Message ID
   * @returns {Promise<Object>} Delete confirmation
   */
  deleteMessage: async (messageId) => {
    return await api.delete(`/messages/${messageId}`);
  },

  /**
   * Get thread replies for a message
   * @param {number} parentMessageId - Parent message ID
   * @returns {Promise<Array>} List of reply messages
   */
  getThreadReplies: async (parentMessageId) => {
    return await api.get(`/messages/${parentMessageId}/replies`);
  },

  // === REACTIONS ===

  /**
   * Add reaction to message
   * @param {number} messageId - Message ID
   * @param {string} emoji - Emoji reaction (e.g., "👍", "❤️")
   * @returns {Promise<Object>} Created reaction
   */
  addReaction: async (messageId, emoji) => {
    return await api.post(`/messages/${messageId}/reactions`, { emoji });
  },

  /**
   * Remove reaction from message
   * @param {number} messageId - Message ID
   * @param {number} reactionId - Reaction ID
   * @returns {Promise<Object>} Remove confirmation
   */
  removeReaction: async (messageId, reactionId) => {
    return await api.delete(`/messages/${messageId}/reactions/${reactionId}`);
  },

  /**
   * Get reactions for a message
   * @param {number} messageId - Message ID
   * @returns {Promise<Array>} List of reactions
   */
  getMessageReactions: async (messageId) => {
    return await api.get(`/messages/${messageId}/reactions`);
  },

  // === ATTACHMENTS ===

  /**
   * Upload file attachment
   * @param {File} file - File to upload
   * @param {Function} onProgress - Progress callback (optional)
   * @returns {Promise<Object>} Uploaded file info
   */
  uploadAttachment: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    return await api.post('/attachments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      }
    });
  },

  /**
   * Get attachment by ID
   * @param {number} attachmentId - Attachment ID
   * @returns {Promise<Object>} Attachment details
   */
  getAttachment: async (attachmentId) => {
    return await api.get(`/attachments/${attachmentId}`);
  },

  /**
   * Delete attachment
   * @param {number} attachmentId - Attachment ID
   * @returns {Promise<Object>} Delete confirmation
   */
  deleteAttachment: async (attachmentId) => {
    return await api.delete(`/attachments/${attachmentId}`);
  },

  /**
   * Get message attachments
   * @param {number} messageId - Message ID
   * @returns {Promise<Array>} List of attachments
   */
  getMessageAttachments: async (messageId) => {
    return await api.get(`/messages/${messageId}/attachments`);
  },

  // === REAL-TIME (WebSocket) ===

  /**
   * Mark channel as read (update last read timestamp)
   * @param {number} channelId - Channel ID
   * @returns {Promise<Object>} Update confirmation
   */
  markChannelAsRead: async (channelId) => {
    return await api.post(`/channels/${channelId}/read`);
  },

  /**
   * Get unread message count for a channel
   * @param {number} channelId - Channel ID
   * @returns {Promise<number>} Unread count
   */
  getUnreadCount: async (channelId) => {
    return await api.get(`/channels/${channelId}/unread`);
  }
};

export default messageService;
