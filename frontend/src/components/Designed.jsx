import { Suspense } from 'react';
import { useSettings } from '../context/SettingsContext';

// A plain page in the theme's background colour while the design (or its code) loads.
export const BootScreen = () => {
    const light = typeof document !== 'undefined' && document.documentElement.classList.contains('light');
    return (
        <div
            aria-busy="true"
            aria-label="Loading"
            style={{ position: 'fixed', inset: 0, background: light ? '#f4f3ef' : '#0b0b0c' }}
        />
    );
};

// Renders the page from whichever design the CMS has selected.
const Designed = ({ ascii: Ascii, classic: Classic }) => {
    const { design, ready } = useSettings();
    if (!ready) return <BootScreen />;
    const Page = design === 'classic' ? Classic : Ascii;
    return (
        <Suspense fallback={<BootScreen />}>
            <Page />
        </Suspense>
    );
};

// Shown on preview links (?design=…&portrait=…) so a preview is never mistaken for the live site.
export const PreviewBadge = () => {
    const { preview } = useSettings();
    const keys = Object.keys(preview);
    if (!keys.length) return null;
    const label = keys.map((k) => `${k}: ${preview[k]}`).join(' · ');
    return (
        <a
            href={window.location.pathname}
            style={{
                position: 'fixed',
                left: '50%',
                transform: 'translateX(-50%)',
                bottom: 12,
                zIndex: 300,
                padding: '8px 12px',
                borderRadius: 999,
                background: '#131313',
                color: '#f4f3ef',
                font: '500 12px/1 "JetBrains Mono", ui-monospace, monospace',
                textDecoration: 'none',
                boxShadow: '0 6px 24px rgba(0,0,0,.25)',
            }}
        >
            Preview · {label} · exit ✕
        </a>
    );
};

export default Designed;
