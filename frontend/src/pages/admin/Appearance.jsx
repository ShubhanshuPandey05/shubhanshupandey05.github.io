import { useEffect, useState } from 'react';
import { FiAlertTriangle, FiCheck, FiExternalLink } from 'react-icons/fi';
import { useSettings } from '../../context/SettingsContext';
import { PORTRAITS } from '../../ascii/portraits';
import PortraitPreview from '../../components/admin/PortraitPreview';
import { Card, PageHeader, SaveBar, errorText, useToast } from '../../components/admin/ui';
import asciiThumb from './assets/design-ascii.webp';
import classicThumb from './assets/design-classic.webp';

const DESIGN_OPTIONS = [
    {
        id: 'ascii',
        name: 'ASCII',
        thumb: asciiThumb,
        about: 'Your portrait drawn in characters. As visitors scroll, the same characters scramble and write each section.',
    },
    {
        id: 'classic',
        name: 'Classic',
        thumb: classicThumb,
        about: 'The interactive design from the main branch: particle name, playable project demos, a terminal and ambient music.',
    },
];

const Choice = ({ name, value, selected, onSelect, live, title, children, art, previewHref }) => (
    <label className={`cms-choice ${selected ? 'is-selected' : ''}`}>
        <input type="radio" name={name} value={value} checked={selected} onChange={() => onSelect(value)} />
        <div className={`cms-choice__art ${art.portrait ? 'cms-choice__art--portrait' : ''}`}>
            {art.node}
            <span className="cms-choice__check" aria-hidden="true">
                <FiCheck />
            </span>
        </div>
        <div className="cms-choice__body">
            <span className="cms-choice__title">
                {title}
                {live && <span className="cms-badge cms-badge--live">Live</span>}
            </span>
            <p>{children}</p>
            <span className="cms-choice__links">
                <a href={previewHref} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                    Preview <FiExternalLink />
                </a>
            </span>
        </div>
    </label>
);

const Appearance = () => {
    const settings = useSettings();
    const toast = useToast();
    const { saved, available, ready } = settings;
    const [draft, setDraft] = useState(saved);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        document.title = 'Appearance · Studio';
    }, []);

    // Follow the server value until the owner starts changing things.
    const [lastSaved, setLastSaved] = useState(saved);
    if (saved !== lastSaved) {
        setLastSaved(saved);
        setDraft(saved);
    }

    const dirty = draft.design !== saved.design || draft.portrait !== saved.portrait;

    const publish = async () => {
        setSaving(true);
        try {
            const next = await settings.update(draft);
            setDraft(next);
            const design = DESIGN_OPTIONS.find((d) => d.id === next.design)?.name;
            toast(`Published. The site now uses the ${design} design with the ${PORTRAITS[next.portrait].label} portrait.`);
        } catch (error) {
            toast(
                error?.response?.status === 404
                    ? 'The server has no settings endpoint yet. Deploy the backend from this branch first.'
                    : `Couldn’t publish: ${errorText(error)}`,
                'err'
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <PageHeader
                eyebrow="Site"
                title="Appearance"
                description="Choose how the public site looks. Changes go live for every visitor when you publish them; use Preview to try one first."
            />

            {ready && !available && (
                <div className="cms-alert" role="alert">
                    <FiAlertTriangle />
                    <div>
                        <strong>The server doesn’t support these settings yet.</strong>
                        Deploy the backend from this branch (it adds <code>/api/settings</code>), then reload this page. Until
                        then the site uses the ASCII design with the Sunset portrait.
                    </div>
                </div>
            )}

            <Card title="Site design" description="The whole public site switches: home, notes, résumé and the 404 page.">
                <div className="cms-choices" role="radiogroup" aria-label="Site design">
                    {DESIGN_OPTIONS.map((d) => (
                        <Choice
                            key={d.id}
                            name="design"
                            value={d.id}
                            selected={draft.design === d.id}
                            onSelect={(design) => setDraft((v) => ({ ...v, design }))}
                            live={saved.design === d.id && available}
                            title={d.name}
                            previewHref={`/?design=${d.id}&portrait=${draft.portrait}`}
                            art={{ node: <img src={d.thumb} alt="" loading="lazy" /> }}
                        >
                            {d.about}
                        </Choice>
                    ))}
                </div>
            </Card>

            <Card
                title="ASCII portrait"
                description={
                    draft.design === 'ascii'
                        ? 'The photo the ASCII design draws in the hero. Hover a preview to scramble it.'
                        : 'Only the ASCII design shows the portrait; it is kept for when you switch back.'
                }
            >
                <div className="cms-choices" role="radiogroup" aria-label="ASCII portrait">
                    {Object.entries(PORTRAITS).map(([id, p]) => (
                        <Choice
                            key={id}
                            name="portrait"
                            value={id}
                            selected={draft.portrait === id}
                            onSelect={(portrait) => setDraft((v) => ({ ...v, portrait }))}
                            live={saved.portrait === id && available}
                            title={p.label}
                            previewHref={`/?design=ascii&portrait=${id}`}
                            art={{ portrait: true, node: <PortraitPreview url={p.url} rows={84} /> }}
                        >
                            {p.note}
                        </Choice>
                    ))}
                </div>
            </Card>

            <SaveBar
                dirty={dirty}
                saving={saving}
                label="Not published yet"
                action="Publish changes"
                onDiscard={() => setDraft(saved)}
                onSave={publish}
            />
        </div>
    );
};

export default Appearance;
