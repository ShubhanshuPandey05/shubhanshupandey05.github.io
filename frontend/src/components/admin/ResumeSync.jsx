import { useId, useState } from 'react';
import { FiAlertTriangle, FiFileText, FiRefreshCw, FiUploadCloud } from 'react-icons/fi';
import api from '../../utils/api';
import { Card, Spinner, errorText, useToast } from './ui';

const when = (date) =>
    date
        ? new Date(date).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
        : '';

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

// Upload a résumé and the site's summary, experience, projects and skills follow it.
// `about` is the profile from the server; `onSynced` receives the updated profile.
const ResumeSync = ({ about, onSynced }) => {
    const toast = useToast();
    const inputId = useId();
    const [busy, setBusy] = useState(null); // 'upload' | 'sync' | null
    const sync = about?.resumeSync || {};
    const resumeUrl = about?.resumeUrl || '';

    const finish = (data, verb) => {
        onSynced(data.about);
        if (data.synced) {
            const c = data.about?.resumeSync?.counts || {};
            toast(`${verb}: ${plural(c.experience || 0, 'role')}, ${plural(c.projects || 0, 'project')}, ${plural(c.skills || 0, 'skill')}`);
        } else {
            toast(data.error || 'The résumé could not be synced.', 'err');
        }
    };

    const upload = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setBusy('upload');
        try {
            const form = new FormData();
            form.append('file', file);
            const { data } = await api.post('/resume', form);
            finish(data, 'Résumé uploaded and synced');
        } catch (error) {
            toast(`Upload failed: ${errorText(error)}`, 'err');
        } finally {
            setBusy(null);
        }
    };

    const resync = async () => {
        setBusy('sync');
        try {
            const { data } = await api.post('/resume/sync');
            finish(data, 'Synced');
        } catch (error) {
            toast(`Sync failed: ${errorText(error)}`, 'err');
        } finally {
            setBusy(null);
        }
    };

    const counts = sync.counts || {};
    let status;
    if (busy) {
        status = (
            <span className="cms-badge">
                <Spinner /> Reading the résumé…
            </span>
        );
    } else if (sync.status === 'synced' && sync.resumeUrl === resumeUrl) {
        status = (
            <span className="cms-badge cms-badge--ok">
                <span className="cms-dot" /> Synced {when(sync.syncedAt)}
            </span>
        );
    } else if (sync.status === 'failed') {
        status = (
            <span className="cms-badge cms-badge--err">
                <span className="cms-dot" /> Last sync failed
            </span>
        );
    } else if (resumeUrl) {
        status = <span className="cms-badge cms-badge--warn">Not synced yet</span>;
    }

    return (
        <Card
            title="Résumé"
            description="Upload a new PDF and the site’s summary, experience, projects and skills update from it. Projects and skills you added by hand and the résumé doesn’t mention are left alone."
            actions={status}
        >
            {sync.status === 'failed' && sync.error && !busy && (
                <div className="cms-alert cms-alert--err" role="alert">
                    <FiAlertTriangle />
                    <div>
                        <strong>The last sync didn’t go through</strong>
                        {sync.error}
                    </div>
                </div>
            )}
            <div className="cms-file">
                <div className="cms-file__thumb">
                    <FiFileText />
                </div>
                <div className="cms-file__info">
                    <strong>{busy === 'upload' ? 'Uploading and reading…' : resumeUrl ? 'Current résumé' : 'No résumé yet'}</strong>
                    {resumeUrl ? (
                        <a href={resumeUrl} target="_blank" rel="noreferrer">
                            {resumeUrl.split('/').pop()}
                        </a>
                    ) : (
                        <span className="cms-muted">PDF, up to 25 MB</span>
                    )}
                    {sync.status === 'synced' && sync.resumeUrl === resumeUrl && (
                        <span className="cms-muted">
                            {plural(counts.experience || 0, 'role')} · {plural(counts.projects || 0, 'project')} · {plural(counts.skills || 0, 'skill')}
                        </span>
                    )}
                </div>
                <input id={inputId} type="file" accept="application/pdf" onChange={upload} disabled={!!busy} />
                <label htmlFor={inputId} className="cms-btn cms-btn--sm" aria-disabled={!!busy}>
                    {busy === 'upload' ? <Spinner /> : <FiUploadCloud />}
                    {resumeUrl ? 'Upload new' : 'Upload'}
                </label>
                {resumeUrl && (
                    <button type="button" className="cms-btn cms-btn--sm cms-btn--ghost" onClick={resync} disabled={!!busy}>
                        {busy === 'sync' ? <Spinner /> : <FiRefreshCw />}
                        Sync again
                    </button>
                )}
            </div>
        </Card>
    );
};

export default ResumeSync;
