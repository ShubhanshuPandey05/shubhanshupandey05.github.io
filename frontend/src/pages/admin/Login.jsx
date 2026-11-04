import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { FiAlertTriangle, FiArrowLeft, FiLock, FiMail } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { PORTRAITS } from '../../ascii/portraits';
import PortraitPreview from '../../components/admin/PortraitPreview';
import { Field, Spinner } from '../../components/admin/ui';
import '../../components/admin/cms.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const { login, isAuthenticated, loading } = useAuth();
    const { portrait } = useSettings();
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Sign in · Studio';
    }, []);

    if (!loading && isAuthenticated) return <Navigate to="/admin" replace />;

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        setBusy(true);
        try {
            await login(email, password);
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || 'Sign-in failed. Check your connection and try again.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="cms">
            <div className="cms-login">
                <figure className="cms-login__art" style={{ margin: 0 }}>
                    <PortraitPreview url={(PORTRAITS[portrait] || PORTRAITS.sunset).url} rows={92} />
                    <figcaption>
                        <span>~/shubhanshu/studio</span>
                        <span>plain text, live</span>
                    </figcaption>
                </figure>
                <div className="cms-login__panel">
                    <form className="cms-login__form" onSubmit={submit}>
                        <span className="cms-brand__mark" aria-hidden="true">
                            SP
                        </span>
                        <h1>Sign in to Studio</h1>
                        <p>Manage the portfolio: appearance, profile, projects and notes.</p>

                        {error && (
                            <div className="cms-alert cms-alert--err" role="alert">
                                <FiAlertTriangle />
                                <div>{error}</div>
                            </div>
                        )}

                        <Field label="Email" htmlFor="login-email">
                            <div className="cms-input-wrap">
                                <FiMail />
                                <input
                                    id="login-email"
                                    type="email"
                                    className="cms-input"
                                    autoComplete="username"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </Field>
                        <Field label="Password" htmlFor="login-password">
                            <div className="cms-input-wrap">
                                <FiLock />
                                <input
                                    id="login-password"
                                    type="password"
                                    className="cms-input"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </Field>
                        <button type="submit" className="cms-btn cms-btn--primary" disabled={busy}>
                            {busy && <Spinner />}
                            {busy ? 'Signing in…' : 'Sign in'}
                        </button>
                        <a href="/" className="cms-login__back">
                            <FiArrowLeft /> Back to the site
                        </a>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
