import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLock, FiMail, FiArrowRight } from 'react-icons/fi';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-900 bg-grid flex items-center justify-center px-6">
            {/* Gradient orbs */}
            <div className="absolute top-1/3 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/3 -right-20 w-72 h-72 bg-accent/10 rounded-full blur-[100px]" />

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <a href="/" className="inline-block text-2xl font-bold font-mono mb-2">
                        <span className="text-primary">&lt;</span>
                        <span className="text-text-primary">Dev</span>
                        <span className="text-primary">/&gt;</span>
                    </a>
                    <p className="text-text-muted text-sm">Admin Panel</p>
                </div>

                <div className="glass rounded-2xl p-8">
                    <h2 className="text-xl font-semibold text-text-primary mb-6 text-center">
                        Welcome Back
                    </h2>

                    {error && (
                        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-text-secondary text-sm mb-2">Email</label>
                            <div className="relative">
                                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-dark-700 border border-dark-500 rounded-lg py-3 pl-10 pr-4 text-text-primary text-sm focus:outline-none focus:border-primary transition-colors"
                                    placeholder="admin@portfolio.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-text-secondary text-sm mb-2">Password</label>
                            <div className="relative">
                                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-dark-700 border border-dark-500 rounded-lg py-3 pl-10 pr-4 text-text-primary text-sm focus:outline-none focus:border-primary transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary to-accent text-dark-900 font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In <FiArrowRight />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-6 text-text-muted text-xs">
                    <a href="/" className="hover:text-primary transition-colors">
                        ← Back to Portfolio
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Login;
