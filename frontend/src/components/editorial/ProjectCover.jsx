import { useRef } from 'react';

// Hand-drawn SVG "cover art" for each project, so the grid reads like a
// magazine spread even without screenshots. Tilts toward the cursor.

const MapCover = () => (
    <svg viewBox="0 0 600 450" className="ed-cover__svg">
        <rect width="600" height="450" fill="#f7f3ee" />
        <path d="M-10 300 C120 260 200 330 320 280 S520 200 620 240" stroke="#f1c9cf" strokeWidth="36" fill="none" />
        {[60, 130, 210, 290, 370, 450, 530].map((x, i) => (
            <line key={`v${x}`} x1={x} y1="0" x2={x + (i % 2 ? 30 : -20)} y2="450" stroke="#0d0b0b" strokeWidth={i % 3 ? 1 : 3} opacity="0.55" />
        ))}
        {[50, 120, 190, 250, 340, 400].map((y, i) => (
            <line key={`h${y}`} x1="0" y1={y} x2="600" y2={y + (i % 2 ? 20 : -15)} stroke="#0d0b0b" strokeWidth={i % 2 ? 1 : 2.5} opacity="0.55" />
        ))}
        <rect x="380" y="60" width="90" height="70" fill="#0d0b0b" opacity="0.08" />
        <rect x="90" y="330" width="120" height="60" fill="#0d0b0b" opacity="0.08" />
        {[[150, 140], [300, 210], [430, 120], [490, 300], [230, 360], [360, 340], [100, 250]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
            <g className="ed-pin" style={{ '--d': `${i * 0.12}s` }}>
                <ellipse cx="0" cy="2" rx="9" ry="3" fill="#0d0b0b" opacity="0.25" />
                <path d="M0 0 C-14 -18 -16 -30 -10 -38 A14 14 0 1 1 10 -38 C16 -30 14 -18 0 0Z" fill={i === 1 ? '#0d0b0b' : '#9b0d23'} />
                <circle cy="-34" r="5" fill="#f7f3ee" />
            </g>
            </g>
        ))}
        <g transform="translate(24 24)">
            <rect width="214" height="42" fill="#0d0b0b" />
            <text x="14" y="28" fill="#f7f3ee" fontFamily="JetBrains Mono, monospace" fontSize="15" letterSpacing="2">
                2,481 JOBS NEARBY
            </text>
        </g>
    </svg>
);

const VoiceCover = () => (
    <svg viewBox="0 0 600 450" className="ed-cover__svg">
        <rect width="600" height="450" fill="#0d0b0b" />
        {['VOICE', 'SMS', 'WEB'].map((label, i) => {
            const y = 110 + i * 115;
            return (
                <g key={label}>
                    <path d={`M150 ${y} C260 ${y} 260 225 360 225`} stroke="#9b0d23" strokeWidth="2" fill="none" strokeDasharray="6 6" className="ed-flow" />
                    <rect x="40" y={y - 22} width="110" height="44" fill="none" stroke="#f7f3ee" strokeWidth="1.5" />
                    <text x="95" y={y + 6} textAnchor="middle" fill="#f7f3ee" fontFamily="JetBrains Mono, monospace" fontSize="15" letterSpacing="3">
                        {label}
                    </text>
                </g>
            );
        })}
        <circle cx="400" cy="225" r="54" fill="#9b0d23" />
        <circle cx="400" cy="225" r="70" fill="none" stroke="#9b0d23" strokeWidth="1" className="ed-ripple" />
        <circle cx="400" cy="225" r="70" fill="none" stroke="#9b0d23" strokeWidth="1" className="ed-ripple ed-ripple--late" />
        <g transform="translate(372 225)">
            {[10, 26, 40, 18, 32, 14].map((h, i) => (
                <rect key={i} x={i * 10} y={-h / 2} width="5" height={h} fill="#f7f3ee" className="ed-wave" style={{ '--d': `${i * 0.11}s` }} />
            ))}
        </g>
        <text x="400" y="330" textAnchor="middle" fill="#f7f3ee" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="22">
            one context
        </text>
    </svg>
);

const FormsCover = () => (
    <svg viewBox="0 0 600 450" className="ed-cover__svg">
        <rect width="600" height="450" fill="#9b0d23" />
        {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${150 + i * 40} ${60 + i * 34}) rotate(${-6 + i * 5})`}>
            <g className="ed-sheet" style={{ '--d': `${i * 0.15}s` }}>
                <rect width="250" height="300" fill="#f7f3ee" />
                <rect x="24" y="28" width="120" height="12" fill="#0d0b0b" />
                {[70, 120, 170].map((y) => (
                    <g key={y}>
                        <rect x="24" y={y} width="80" height="6" fill="#0d0b0b" opacity="0.4" />
                        <rect x="24" y={y + 14} width="200" height="22" fill="none" stroke="#0d0b0b" strokeWidth="1.5" />
                    </g>
                ))}
                <rect x="24" y="238" width="90" height="34" fill="#0d0b0b" />
                <text x="69" y="260" textAnchor="middle" fill="#f7f3ee" fontFamily="JetBrains Mono, monospace" fontSize="12" letterSpacing="2">
                    SEND
                </text>
            </g>
            </g>
        ))}
        <g transform="translate(470 330)">
            <circle r="44" fill="#0d0b0b" />
            <path d="M-18 0 L-5 13 L20 -14" stroke="#f7f3ee" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
    </svg>
);

const PeakCover = ({ index }) => (
    <svg viewBox="0 0 600 450" className="ed-cover__svg">
        <rect width="600" height="450" fill={index % 2 ? '#0d0b0b' : '#f7f3ee'} />
        <circle cx="390" cy="180" r="90" fill="#9b0d23" />
        <path d="M0 450 L210 200 L300 290 L380 230 L600 450Z" fill={index % 2 ? '#f7f3ee' : '#0d0b0b'} />
    </svg>
);

const covers = { geojobs: MapCover, voice: VoiceCover, forms: FormsCover };

const ProjectCover = ({ coverKey, index, title }) => {
    const ref = useRef(null);
    const Cover = covers[coverKey];

    const onMove = (e) => {
        const el = ref.current;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`;
    };
    const onLeave = () => {
        ref.current.style.transform = '';
    };

    return (
        <div className="ed-cover" ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} role="img" aria-label={`Illustration for ${title}`}>
            {Cover ? <Cover /> : <PeakCover index={index} />}
            <span className="ed-cover__no">No. {String(index + 1).padStart(2, '0')}</span>
        </div>
    );
};

export default ProjectCover;
