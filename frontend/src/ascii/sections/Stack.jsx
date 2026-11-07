import Label from './Label';

// Folder names for the `tree` view. Unknown CMS categories fall into misc/.
const FOLDERS = {
    Backend: 'backend',
    Database: 'data',
    DevOps: 'infra',
    Tools: 'workbench',
    Frontend: 'frontend',
    Other: 'misc',
};

const group = (skills, groups) => {
    const order = groups.map((g) => g.key);
    const byKey = new Map();
    skills.forEach((s) => {
        const key = order.includes(s.category) ? s.category : 'Other';
        if (!byKey.has(key)) byKey.set(key, []);
        byKey.get(key).push(s.name);
    });
    return order.filter((k) => byKey.has(k)).map((k) => ({ key: k, note: groups.find((g) => g.key === k)?.note, items: byKey.get(k) }));
};

const Stack = ({ skills, groups, n }) => {
    const rows = group(skills, groups);
    return (
        <section className="ax-sec" id="stack" data-scene="stack">
            <div className="ax-window" aria-hidden="true" />
            <div className="ax-sec__body">
                <Label n={n}>Stack</Label>
                <p className="ax-statement">
                    The toolbox. <em>Boring, proven tools,</em> used carefully.
                </p>
                <div className="ax-tree">
                    <p className="ax-tree__root" aria-hidden="true">
                        ~/stack $ tree
                    </p>
                    <ul>
                        {rows.map((r, i) => (
                            <li key={r.key}>
                                <span className="ax-tree__branch" aria-hidden="true">
                                    {i === rows.length - 1 ? '└──' : '├──'}
                                </span>
                                <span className="ax-tree__dir">
                                    {FOLDERS[r.key] || r.key.toLowerCase()}/
                                    {r.note && <small>{r.note}</small>}
                                </span>
                                <ul className="ax-tree__items">
                                    {r.items.map((name) => (
                                        <li key={name}>{name}</li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                    <p className="ax-tree__sum" aria-hidden="true">
                        {rows.length} directories, {skills.length} files
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Stack;
