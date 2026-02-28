import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('portfolio_admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('portfolio_admin_token');
            if (window.location.pathname.startsWith('/admin')) {
                window.location.href = '/admin/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
