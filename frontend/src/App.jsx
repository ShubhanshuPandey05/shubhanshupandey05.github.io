import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import Designed, { BootScreen, PreviewBadge } from './components/Designed';
import WorkPage from './pages/WorkPage';

// Two designs for the public site; the CMS picks one (Appearance page). Each loads only when used.
const AsciiHome = lazy(() => import('./ascii/AsciiHome'));
const AsciiBlog = lazy(() => import('./ascii/pages/BlogPage'));
const AsciiPost = lazy(() => import('./ascii/pages/BlogPost'));
const AsciiResume = lazy(() => import('./ascii/pages/ResumeViewer'));
const AsciiNotFound = lazy(() => import('./ascii/pages/NotFound'));
const ClassicHome = lazy(() => import('./site/ClassicHome'));
const ClassicBlog = lazy(() => import('./site/pages/BlogPage'));
const ClassicPost = lazy(() => import('./site/pages/BlogPost'));
const ClassicResume = lazy(() => import('./site/pages/ResumeViewer'));
const ClassicNotFound = lazy(() => import('./site/pages/NotFound'));
const ClassicChrome = lazy(() => import('./site/ClassicChrome'));

// The CMS.
const Login = lazy(() => import('./pages/admin/Login'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Appearance = lazy(() => import('./pages/admin/Appearance'));
const ManageAbout = lazy(() => import('./pages/admin/ManageAbout'));
const ManageProjects = lazy(() => import('./pages/admin/ManageProjects'));
const ManageSkills = lazy(() => import('./pages/admin/ManageSkills'));
const ManageSocials = lazy(() => import('./pages/admin/ManageSocials'));
const ManageBlogs = lazy(() => import('./pages/admin/ManageBlogs'));

// Site-wide extras of the classic design (cursor, music); never in the CMS.
const PublicChrome = () => {
    const { pathname } = useLocation();
    const { design, ready } = useSettings();
    if (!ready || design !== 'classic' || pathname.startsWith('/admin')) return null;
    return (
        <Suspense fallback={null}>
            <ClassicChrome />
        </Suspense>
    );
};

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <SettingsProvider>
                    <Router>
                        <PublicChrome />
                        <PreviewBadge />
                        <Suspense fallback={<BootScreen />}>
                            <Routes>
                                {/* Public portfolio */}
                                <Route path="/" element={<Designed ascii={AsciiHome} classic={ClassicHome} />} />
                                <Route path="/work" element={<WorkPage />} />
                                <Route path="/blog" element={<Designed ascii={AsciiBlog} classic={ClassicBlog} />} />
                                <Route path="/blog/:slug" element={<Designed ascii={AsciiPost} classic={ClassicPost} />} />
                                <Route path="/resume" element={<Designed ascii={AsciiResume} classic={ClassicResume} />} />

                                {/* CMS */}
                                <Route path="/admin/login" element={<Login />} />
                                <Route path="/admin" element={<AdminLayout />}>
                                    <Route index element={<Dashboard />} />
                                    <Route path="appearance" element={<Appearance />} />
                                    <Route path="about" element={<ManageAbout />} />
                                    <Route path="projects" element={<ManageProjects />} />
                                    <Route path="skills" element={<ManageSkills />} />
                                    <Route path="socials" element={<ManageSocials />} />
                                    <Route path="blogs" element={<ManageBlogs />} />
                                </Route>

                                <Route path="*" element={<Designed ascii={AsciiNotFound} classic={ClassicNotFound} />} />
                            </Routes>
                        </Suspense>
                    </Router>
                </SettingsProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
