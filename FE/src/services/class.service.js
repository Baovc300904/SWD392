import api from '../config/api.config';

/**
 * Class Service
 * Handles all class-related API operations
 * Maps to BE /api/classes routes
 */

const classService = {
  /**
   * Get all classes with optional filters
   * @param {Object} filters - Optional query parameters
   * @param {string} filters.semester_id - Filter by semester
   * @param {number} filters.lecturer_id - Filter by lecturer
   * @returns {Promise<Array>} List of classes
   */
  getAllClasses: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.semester_id || filters.semesterId) {
        queryParams.append('semesterId', filters.semester_id || filters.semesterId);
      }
      if (filters.lecturer_id || filters.lecturerId) {
        queryParams.append('lecturerId', filters.lecturer_id || filters.lecturerId);
      }
      if (filters.search) {
        queryParams.append('search', filters.search);
      }

      const queryString = queryParams.toString();
      const url = queryString ? `/classes?${queryString}` : '/classes';
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      throw error;
    }
  },

  /**
   * Get a single class by ID
   * @param {number} classId - The class ID
   * @returns {Promise<Object>} Class details
   */
  getClassById: async (classId) => {
    try {
      const response = await api.get(`/classes/${classId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch class ${classId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new class (Manager only)
   * @param {Object} classData - Class information
   * @param {string} classData.class_code - Unique class code (e.g., "SE1234")
   * @param {string} classData.class_name - Class name
   * @param {number} classData.semester_id - Semester ID
   * @param {number} classData.lecturer_id - Assigned lecturer user ID
   * @returns {Promise<Object>} Created class
   */
  createClass: async (classData) => {
    try {
      const response = await api.post('/classes', classData);
      return response.data;
    } catch (error) {
      console.error('Failed to create class:', error);
      throw error;
    }
  },

  /**
   * Update an existing class (Manager only)
   * @param {number} classId - The class ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated class
   */
  updateClass: async (classId, updates) => {
    try {
      const response = await api.put(`/classes/${classId}`, updates);
      return response.data;
    } catch (error) {
      console.error(`Failed to update class ${classId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a class (Manager only)
   * @param {number} classId - The class ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteClass: async (classId) => {
    try {
      const response = await api.delete(`/classes/${classId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete class ${classId}:`, error);
      throw error;
    }
  },

  /**
   * Get all students enrolled in a class
   * @param {number} classId - The class ID
   * @returns {Promise<Array>} List of students in the class
   */
  getClassStudents: async (classId) => {
    try {
      const response = await api.get(`/classes/${classId}/students`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch students for class ${classId}:`, error);
      throw error;
    }
  },

  /**
   * Add a student to a class (Manager only)
   * @param {number} classId - The class ID
   * @param {number} studentId - User ID of the student
   * @returns {Promise<Object>} Success message
   */
  addStudentToClass: async (classId, studentId) => {
    try {
      const response = await api.post(`/classes/${classId}/students`, { student_id: studentId });
      return response.data;
    } catch (error) {
      console.error(`Failed to add student to class ${classId}:`, error);
      throw error;
    }
  },

  /**
   * Remove a student from a class (Manager only)
   * @param {number} classId - The class ID
   * @param {number} studentId - User ID of the student
   * @returns {Promise<Object>} Success message
   */
  removeStudentFromClass: async (classId, studentId) => {
    try {
      const response = await api.delete(`/classes/${classId}/students/${studentId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to remove student from class ${classId}:`, error);
      throw error;
    }
  }
};

export default classService;
