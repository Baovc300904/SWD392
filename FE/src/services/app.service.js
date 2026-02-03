import api from '../config/api.config';

// Topic Services
export const topicService = {
  // Get all topics
  getAllTopics: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/topics?${params}`);
  },

  // Get topic by ID
  getTopicById: async (id) => {
    return await api.get(`/topics/${id}`);
  },

  // Create new topic
  createTopic: async (topicData) => {
    return await api.post('/topics', topicData);
  },

  // Update topic
  updateTopic: async (id, topicData) => {
    return await api.put(`/topics/${id}`, topicData);
  },

  // Delete topic
  deleteTopic: async (id) => {
    return await api.delete(`/topics/${id}`);
  },

  // Approve topic (admin/lecturer only)
  approveTopic: async (id) => {
    return await api.put(`/topics/${id}/approve`);
  },

  // Reject topic (admin/lecturer only)
  rejectTopic: async (id) => {
    return await api.put(`/topics/${id}/reject`);
  }
};

// Group Services
export const groupService = {
  // Get all groups
  getAllGroups: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/groups?${params}`);
  },

  // Get group by ID
  getGroupById: async (id) => {
    return await api.get(`/groups/${id}`);
  },

  // Create new group
  createGroup: async (groupData) => {
    return await api.post('/groups', groupData);
  },

  // Update group
  updateGroup: async (id, groupData) => {
    return await api.put(`/groups/${id}`, groupData);
  },

  // Delete group
  deleteGroup: async (id) => {
    return await api.delete(`/groups/${id}`);
  },

  // Add member to group
  addMember: async (groupId, userId) => {
    return await api.post(`/groups/${groupId}/members`, { userId });
  },

  // Remove member from group
  removeMember: async (groupId, memberId) => {
    return await api.delete(`/groups/${groupId}/members/${memberId}`);
  },

  // Get group members
  getGroupMembers: async (groupId) => {
    return await api.get(`/groups/${groupId}/members`);
  }
};

// Question Services
export const questionService = {
  // Get all questions for a group
  getGroupQuestions: async (groupId, filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/groups/${groupId}/questions?${params}`);
  },

  // Get question by ID
  getQuestionById: async (id) => {
    return await api.get(`/questions/${id}`);
  },

  // Create new question
  createQuestion: async (groupId, questionData) => {
    return await api.post(`/groups/${groupId}/questions`, questionData);
  },

  // Update question
  updateQuestion: async (id, questionData) => {
    return await api.put(`/questions/${id}`, questionData);
  },

  // Delete question
  deleteQuestion: async (id) => {
    return await api.delete(`/questions/${id}`);
  },

  // Assign question to user
  assignQuestion: async (id, userId) => {
    return await api.put(`/questions/${id}/assign`, { userId });
  },

  // Close question
  closeQuestion: async (id) => {
    return await api.put(`/questions/${id}/close`);
  }
};

// Answer Services
export const answerService = {
  // Get all answers for a question
  getQuestionAnswers: async (questionId) => {
    return await api.get(`/questions/${questionId}/answers`);
  },

  // Get answer by ID
  getAnswerById: async (id) => {
    return await api.get(`/answers/${id}`);
  },

  // Create new answer
  createAnswer: async (questionId, answerData) => {
    return await api.post(`/questions/${questionId}/answers`, answerData);
  },

  // Update answer
  updateAnswer: async (id, answerData) => {
    return await api.put(`/answers/${id}`, answerData);
  },

  // Delete answer
  deleteAnswer: async (id) => {
    return await api.delete(`/answers/${id}`);
  }
};

// Semester Services
export const semesterService = {
  // Get all semesters
  getAllSemesters: async () => {
    return await api.get('/semesters');
  },

  // Get semester by ID
  getSemesterById: async (id) => {
    return await api.get(`/semesters/${id}`);
  },

  // Create new semester (admin only)
  createSemester: async (semesterData) => {
    return await api.post('/semesters', semesterData);
  },

  // Update semester (admin only)
  updateSemester: async (id, semesterData) => {
    return await api.put(`/semesters/${id}`, semesterData);
  },

  // Delete semester (admin only)
  deleteSemester: async (id) => {
    return await api.delete(`/semesters/${id}`);
  }
};

// AI Suggestion Services
export const aiSuggestionService = {
  // Get AI suggestion for a question
  getQuestionSuggestion: async (questionId) => {
    return await api.get(`/questions/${questionId}/ai-suggestion`);
  },

  // Generate AI suggestion
  generateSuggestion: async (questionId) => {
    return await api.post(`/questions/${questionId}/ai-suggestion`);
  }
};

export default {
  topic: topicService,
  group: groupService,
  question: questionService,
  answer: answerService,
  semester: semesterService,
  aiSuggestion: aiSuggestionService
};
