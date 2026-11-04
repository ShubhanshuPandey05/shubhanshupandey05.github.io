import axios from 'axios';

// VITE_API_URL points the site at another API (for example a local backend); see .env.example.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://shubhanshupandey05.vercel.app/api',
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
        // An expired session sends the CMS back to sign-in. A wrong password on the
        // sign-in form itself is just an error to show there, not a redirect.
        const isLogin = error.config?.url?.includes('/auth/login');
        if (error.response?.status === 401 && !isLogin) {
            localStorage.removeItem('portfolio_admin_token');
            const path = window.location.pathname;
            if (path.startsWith('/admin') && path !== '/admin/login') {
                window.location.href = '/admin/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
