import axios from 'axios';

// Use local development API or production API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Helper: Get user from correct storage (localStorage or sessionStorage)
const getStoredUser = () => {
    const localUser = localStorage.getItem('user');
    const sessionUser = sessionStorage.getItem('user');
    return JSON.parse(localUser || sessionUser || '{}');
};

// Helper: Save user to correct storage
const saveStoredUser = (userData) => {
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(userData));
};

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
    withCredentials: false
});

// Request interceptor - Add JWT token to all requests
api.interceptors.request.use(
    (config) => {
        const user = getStoredUser();
        if (user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Track if we're currently refreshing to avoid multiple refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Response interceptor - Handle responses and errors with auto-refresh
api.interceptors.response.use(
    (response) => {
        // Return response.data directly for cleaner usage
        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;

        // If error is 401/403 and we haven't tried to refresh yet
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const user = getStoredUser();

            if (!user.refreshToken) {
                isRefreshing = false;
                // No refresh token, clear session and reload
                localStorage.removeItem('user');
                sessionStorage.removeItem('user');
                window.location.reload();
                return Promise.reject(error);
            }

            try {
                // Call refresh token API
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refreshToken: user.refreshToken
                });

                if (response.data.success && response.data.data) {
                    const newToken = response.data.data.accessToken;

                    // Update user in storage
                    const updatedUser = {
                        ...user,
                        token: newToken
                    };
                    saveStoredUser(updatedUser);

                    // Update Authorization header
                    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;

                    processQueue(null, newToken);
                    isRefreshing = false;

                    // Retry original request
                    return api(originalRequest);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;

                // Refresh failed, clear session and reload
                sessionStorage.removeItem('user');
                localStorage.removeItem('user');
                window.location.reload();
                return Promise.reject(refreshError);
            }
        }

        // Return error with consistent structure
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
        return Promise.reject({
            status: error.response?.status,
            message: errorMessage,
            data: error.response?.data
        });
    }
);

export default api;
