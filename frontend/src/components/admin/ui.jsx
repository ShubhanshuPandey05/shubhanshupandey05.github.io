import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import { FiAlertTriangle, FiCheck, FiCheckCircle, FiFileText, FiImage, FiUploadCloud, FiX } from 'react-icons/fi';
import uploadMedia from '../../utils/uploadMedia';

// Errors from axios carry the server's message; fall back to the generic one.
export const errorText = (error) =>
    error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Something went wrong.';

/* ---------- toasts ---------- */

const ToastContext = createContext(() => {});

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const show = useCallback((text, kind = 'ok') => {
        const id = Math.random().toString(36).slice(2);
        setToasts((list) => [...list, { id, text, kind }]);
        setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), kind === 'err' ? 6000 : 3200);
    }, []);
    return (
        <ToastContext.Provider value={show}>
            {children}
            <div className="cms-toasts" role="status" aria-live="polite">
                {toasts.map((t) => (
                    <div key={t.id} className={`cms-toast cms-toast--${t.kind}`}>
                        {t.kind === 'err' ? <FiAlertTriangle /> : <FiCheckCircle />}
                        {t.text}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);

/* ---------- confirm dialog ---------- */

const ConfirmContext = createContext(async () => false);

export const ConfirmProvider = ({ children }) => {
    const [dialog, setDialog] = useState(null);
    const confirm = useCallback(
        (options) =>
            new Promise((resolve) => {
                setDialog({ ...options, resolve });
            }),
        []
    );
    const close = (answer) => {
        dialog?.resolve(answer);
        setDialog(null);
    };
    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            {dialog && (
                <>
                    <div className="cms-overlay" onClick={() => close(false)} />
                    <div className="cms-dialog" role="alertdialog" aria-modal="true" aria-labelledby="cms-confirm-title">
                        <h2 id="cms-confirm-title">{dialog.title}</h2>
                        {dialog.body && <p>{dialog.body}</p>}
                        <div className="cms-dialog__actions">
                            <button type="button" className="cms-btn" onClick={() => close(false)} autoFocus>
                                Cancel
                            </button>
                            <button type="button" className="cms-btn cms-btn--danger" onClick={() => close(true)}>
                                {dialog.action || 'Delete'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => useContext(ConfirmContext);

/* ---------- layout pieces ---------- */

export const PageHeader = ({ eyebrow, title, description, actions }) => (
    <header className="cms-head">
        <div>
            {eyebrow && <p className="cms-head__eyebrow">{eyebrow}</p>}
            <h1>{title}</h1>
            {description && <p>{description}</p>}
        </div>
        {actions && <div className="cms-head__actions">{actions}</div>}
    </header>
);

export const Card = ({ title, description, actions, children, className = '', bodyClass = 'cms-card__body' }) => (
    <section className={`cms-card ${className}`}>
        {(title || actions) && (
            <div className="cms-card__head">
                <div>
                    {title && <h2>{title}</h2>}
                    {description && <p>{description}</p>}
                </div>
                {actions}
            </div>
        )}
        <div className={bodyClass}>{children}</div>
    </section>
);

export const Field = ({ label, hint, children, className = '', htmlFor }) => (
    <div className={`cms-field ${className}`}>
        {label && <label htmlFor={htmlFor}>{label}</label>}
        {children}
        {hint && <span className="cms-field__hint">{hint}</span>}
    </div>
);

export const Switch = ({ checked, onChange, label, note }) => (
    <label className="cms-switch">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="cms-switch__track" aria-hidden="true" />
        <span className="cms-switch__text">
            {label}
            {note && <small>{note}</small>}
        </span>
    </label>
);

export const Spinner = () => <span className="cms-spin" aria-hidden="true" />;

export const EmptyState = ({ icon: Icon, title, body, action }) => (
    <div className="cms-empty">
        {Icon && <Icon />}
        <strong>{title}</strong>
        {body && <span>{body}</span>}
        {action}
    </div>
);

export const Skeleton = ({ height = 64, count = 3 }) => (
    <div style={{ display: 'grid', gap: 10 }} aria-busy="true" aria-label="Loading">
        {Array.from({ length: count }, (_, i) => (
            <div key={i} className="cms-skeleton" style={{ height }} />
        ))}
    </div>
);

/* ---------- tag input: type and press Enter or comma ---------- */

export const TagInput = ({ value, onChange, placeholder, id }) => {
    const [draft, setDraft] = useState('');
    const add = (raw) => {
        const parts = raw
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
            .filter((t) => !value.includes(t));
        if (parts.length) onChange([...value, ...parts]);
        setDraft('');
    };
    return (
        <div className="cms-tags" onClick={(e) => e.currentTarget.querySelector('input')?.focus()}>
            {value.map((tag) => (
                <span className="cms-chip" key={tag}>
                    {tag}
                    <button type="button" aria-label={`Remove ${tag}`} onClick={() => onChange(value.filter((t) => t !== tag))}>
                        <FiX size={12} />
                    </button>
                </span>
            ))}
            <input
                id={id}
                value={draft}
                placeholder={value.length ? '' : placeholder}
                onChange={(e) => {
                    if (e.target.value.includes(',')) add(e.target.value);
                    else setDraft(e.target.value);
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        add(draft);
                    } else if (e.key === 'Backspace' && !draft && value.length) {
                        onChange(value.slice(0, -1));
                    }
                }}
                onBlur={() => draft && add(draft)}
            />
        </div>
    );
};

/* ---------- file upload to Cloudinary through the API ---------- */

export const FileField = ({ value, onChange, accept, folder, kind = 'image', label = 'Upload' }) => {
    const toast = useToast();
    const inputId = useId();
    const [busy, setBusy] = useState(false);
    const pick = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setBusy(true);
        try {
            const url = await uploadMedia(file, { folder, resourceType: 'image' });
            onChange(url);
            toast(`${file.name} uploaded`);
        } catch (error) {
            toast(`Upload failed: ${errorText(error)}`, 'err');
        } finally {
            setBusy(false);
        }
    };
    const isImage = kind === 'image';
    return (
        <div className="cms-file">
            <div className="cms-file__thumb">{isImage && value ? <img src={value} alt="" /> : isImage ? <FiImage /> : <FiFileText />}</div>
            <div className="cms-file__info">
                <strong>{busy ? 'Uploading…' : value ? 'Uploaded' : 'Nothing uploaded yet'}</strong>
                {value ? (
                    <a href={value} target="_blank" rel="noreferrer">
                        {value.split('/').pop()}
                    </a>
                ) : (
                    <span className="cms-muted">{isImage ? 'PNG, JPG or WebP' : 'PDF'}</span>
                )}
            </div>
            <input id={inputId} type="file" accept={accept} onChange={pick} />
            <label htmlFor={inputId} className="cms-btn cms-btn--sm" aria-disabled={busy}>
                {busy ? <Spinner /> : <FiUploadCloud />}
                {value ? 'Replace' : label}
            </label>
            {value && !busy && (
                <button type="button" className="cms-btn cms-btn--sm cms-btn--ghost" onClick={() => onChange('')}>
                    Remove
                </button>
            )}
        </div>
    );
};

/* ---------- slide-over editor ---------- */

export const Drawer = ({ open, title, onClose, children, footer, wide = false, onSubmit }) => {
    const ref = useRef(null);
    useEffect(() => {
        if (!open) return undefined;
        const onKey = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const t = setTimeout(() => ref.current?.querySelector('input, textarea, select')?.focus(), 60);
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
            clearTimeout(t);
        };
    }, [open, onClose]);
    if (!open) return null;
    const Tag = onSubmit ? 'form' : 'div';
    return (
        <>
            <div className="cms-overlay" onClick={onClose} />
            <Tag
                ref={ref}
                className={`cms-drawer ${wide ? 'cms-drawer--wide' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                onSubmit={
                    onSubmit
                        ? (e) => {
                              e.preventDefault();
                              onSubmit();
                          }
                        : undefined
                }
            >
                <div className="cms-drawer__head">
                    <h2>{title}</h2>
                    <button type="button" className="cms-btn cms-btn--ghost cms-btn--icon" onClick={onClose} aria-label="Close">
                        <FiX />
                    </button>
                </div>
                <div className="cms-drawer__body">{children}</div>
                {footer && <div className="cms-drawer__foot">{footer}</div>}
            </Tag>
        </>
    );
};

/* ---------- floating bar for unsaved changes ---------- */

export const SaveBar = ({ dirty, saving, onSave, onDiscard, label = 'Unsaved changes', action = 'Save changes' }) => (
    <div className={`cms-savebar ${dirty ? 'is-open' : ''}`} role="region" aria-label="Unsaved changes" aria-hidden={!dirty}>
        <span>{label}</span>
        <button type="button" className="cms-btn cms-btn--ghost" onClick={onDiscard} disabled={saving} tabIndex={dirty ? 0 : -1}>
            Discard
        </button>
        <button type="button" className="cms-btn cms-btn--primary" onClick={onSave} disabled={saving} tabIndex={dirty ? 0 : -1}>
            {saving ? <Spinner /> : <FiCheck />}
            {action}
        </button>
    </div>
);
