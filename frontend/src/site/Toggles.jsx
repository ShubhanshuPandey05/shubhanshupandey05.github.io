import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { subscribeSound, toggleSound } from './sound';

export const ThemeToggle = ({ className = '' }) => {
    const { theme, toggleTheme } = useTheme();
    const light = theme === 'light';
    return (
        <button
            type="button"
            className={`sp-toggle sp-theme ${light ? 'is-light' : ''} ${className}`}
            onClick={toggleTheme}
            aria-label={light ? 'Switch to dark theme' : 'Switch to light theme'}
            title={light ? 'Dark theme' : 'Light theme'}
            data-cursor={light ? 'dark' : 'light'}
        >
            <span className="sp-theme__icon" aria-hidden="true" />
        </button>
    );
};

// Five bars that move while the music plays. A dot means "on, starts when you click anywhere".
export const SoundToggle = ({ className = '' }) => {
    const [state, setState] = useState({ on: false, pref: 'on' });
    useEffect(() => subscribeSound(setState), []);
    const waiting = !state.on && state.pref === 'on';
    return (
        <button
            type="button"
            className={`sp-toggle sp-sound ${state.on ? 'is-on' : ''} ${waiting ? 'is-waiting' : ''} ${className}`}
            onClick={toggleSound}
            aria-pressed={state.on}
            aria-label={state.on ? 'Turn music off' : 'Turn music on'}
            title={state.on ? 'Music on' : waiting ? 'Music starts when you click anywhere' : 'Music off'}
            data-cursor={state.on ? 'mute' : 'music'}
            data-sound-toggle
        >
            <span className="sp-sound__bars" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
            </span>
        </button>
    );
};
