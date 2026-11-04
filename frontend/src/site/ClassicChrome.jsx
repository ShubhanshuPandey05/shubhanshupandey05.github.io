import { useEffect } from 'react';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource/inter-tight/500.css';
import '@fontsource/inter-tight/700.css';
import '@fontsource/jetbrains-mono/600.css';
import './site.css';
import Cursor from './Cursor';
import { armAutoplay, stopSound } from './sound';

// What the classic design adds around every public page: its page-level styles
// (scoped by .sp-on), the custom cursor and the ambient music. Mounted once,
// outside the routes, so moving between pages doesn't restart the music.
const ClassicChrome = () => {
    useEffect(() => {
        const root = document.documentElement;
        root.classList.add('sp-on');
        const disarm = armAutoplay();
        return () => {
            disarm();
            stopSound();
            root.classList.remove('sp-on');
        };
    }, []);
    return <Cursor />;
};

export default ClassicChrome;
