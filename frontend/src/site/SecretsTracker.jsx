import { useEffect, useRef, useState } from 'react';
import { SECRETS, confetti, resetSecrets, subscribeSecrets, useSecrets } from './secrets';

// Bottom-left tracker that counts what the visitor has discovered, plus unlock toasts.
const SecretsTracker = () => {
    const found = useSecrets();
    const [open, setOpen] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [bump, setBump] = useState(0);
    const panelRef = useRef(null);
    // Stay out of the way on the hero; appear once the visitor starts exploring.
    const [shown, setShown] = useState(() => found.length > 0);

    useEffect(() => {
        if (shown) return undefined;
        const onScroll = () => window.scrollY > window.innerHeight * 0.6 && setShown(true);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [shown]);

    useEffect(
        () =>
            subscribeSecrets((list, fresh) => {
                if (!fresh) return;
                const id = `${fresh.id}-${Date.now()}`;
                setToasts((t) => [...t, { ...fresh, key: id, count: list.length }]);
                setBump((b) => b + 1);
                setShown(true);
                setTimeout(() => setToasts((t) => t.filter((x) => x.key !== id)), 3600);
                if (list.length === SECRETS.length) setTimeout(() => confetti(80, window.innerHeight - 60, 180), 300);
            }),
        []
    );

    useEffect(() => {
        if (!open) return undefined;
        const onDown = (e) => {
            if (!panelRef.current?.contains(e.target)) setOpen(false);
        };
        const onKey = (e) => e.key === 'Escape' && setOpen(false);
        window.addEventListener('pointerdown', onDown);
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('pointerdown', onDown);
            window.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const all = found.length === SECRETS.length;

    return (
        <>
            <div className={`sp-quest ${shown ? '' : 'is-hidden'}`} ref={panelRef}>
                {open && (
                    <div className="sp-quest__panel" role="dialog" aria-label="Things to discover">
                        <p className="sp-quest__head">
                            {all ? 'You found everything. You should probably email me.' : 'Things hidden on this page'}
                        </p>
                        <ul>
                            {SECRETS.map((s) => {
                                const got = found.includes(s.id);
                                return (
                                    <li key={s.id} className={got ? 'is-got' : ''}>
                                        <span className="sp-quest__tick" aria-hidden="true">{got ? '✓' : ''}</span>
                                        <span>
                                            <strong>{got ? s.title : '???'}</strong>
                                            <small>{s.hint}</small>
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                        {found.length > 0 && (
                            <button type="button" className="sp-quest__reset" onClick={resetSecrets}>
                                reset progress
                            </button>
                        )}
                    </div>
                )}
                <button
                    type="button"
                    key={bump}
                    className={`sp-quest__pill ${bump ? 'is-bump' : ''} ${all ? 'is-done' : ''}`}
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    data-cursor="secrets"
                >
                    <span className="sp-quest__ring" style={{ '--p': found.length / SECRETS.length }} aria-hidden="true" />
                    <span>
                        {found.length}/{SECRETS.length} <em>found</em>
                    </span>
                </button>
            </div>
            <div className="sp-toasts" aria-live="polite">
                {toasts.map((t) => (
                    <div className="sp-toast" key={t.key}>
                        <span className="sp-toast__icon" aria-hidden="true">✦</span>
                        <span>
                            <small>Unlocked · {t.count}/{SECRETS.length}</small>
                            <strong>{t.title}</strong>
                        </span>
                    </div>
                ))}
            </div>
        </>
    );
};

export default SecretsTracker;
