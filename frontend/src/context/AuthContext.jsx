import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('portfolio_admin_token'));
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }
            try {
                const { data } = await api.get('/auth/verify');
                setIsAuthenticated(data.valid);
                setEmail(data.email || '');
            } catch {
                setIsAuthenticated(false);
                localStorage.removeItem('portfolio_admin_token');
                setToken(null);
            }
            setLoading(false);
        };
        verifyToken();
    }, [token]);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('portfolio_admin_token', data.token);
        setToken(data.token);
        setIsAuthenticated(true);
        setEmail(data.email || email);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('portfolio_admin_token');
        setToken(null);
        setIsAuthenticated(false);
        setEmail('');
    };

    return (
        <AuthContext.Provider value={{ token, isAuthenticated, loading, email, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
