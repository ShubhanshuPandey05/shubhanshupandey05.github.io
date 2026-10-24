import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Saved choice first, otherwise light.
        try {
            const saved = localStorage.getItem('portfolio_theme_v4');
            if (saved) return saved;
            return 'light';
        } catch {
            return 'light';
        }
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'light') {
            root.classList.add('light');
        } else {
            root.classList.remove('light');
        }
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f4f1ea' : '#0b0b0d');
        try {
            localStorage.setItem('portfolio_theme_v4', theme);
        } catch {
            /* ignore */
        }
    }, [theme]);

    const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
