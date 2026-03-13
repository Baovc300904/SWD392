import api from '../config/api.config';

const taskService = {
    extractPayload: (response) => response?.data ?? response,

    getAllTasks: async (filters = {}) => {
        const response = await api.get('/tasks', { params: filters });
        return taskService.extractPayload(response);
    },

    getTaskById: async (id) => {
        const response = await api.get(`/tasks/${id}`);
        return taskService.extractPayload(response);
    },

    createTask: async (data) => {
        const response = await api.post('/tasks', data);
        return taskService.extractPayload(response);
    },

    updateTask: async (id, data) => {
        const response = await api.put(`/tasks/${id}`, data);
        return taskService.extractPayload(response);
    },

    deleteTask: async (id) => {
        const response = await api.delete(`/tasks/${id}`);
        return taskService.extractPayload(response);
    }
};

export default taskService;
