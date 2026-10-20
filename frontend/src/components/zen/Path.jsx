import { useEffect, useRef } from 'react';
import { useInView } from './useInView';

const SUMMIT = String.raw`
            .
           /=\
          /===\        ▲ next summit:
         /=====\         a backend team
    /\  /=======\        that cares about
   /  \/=========\       uptime
  /    \==========\
`;

// The trail is drawn in characters on a canvas, revealed as you scroll,
// with a tiny hiker walking down it.
const Trail = () => {
    const ref = useRef(null);
    useEffect(() => {
        const canvas = ref.current;
        const ctx = canvas.getContext('2d');
        let raf = 0;
        let h = 0;
        let w = 0;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const resize = () => {
            const r = canvas.getBoundingClientRect();
            w = r.width;
            h = r.height;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        const draw = () => {
            raf = 0;
            const rect = canvas.getBoundingClientRect();
            const progress = Math.max(0, Math.min(1, (window.innerHeight * 0.6 - rect.top) / rect.height));
            ctx.clearRect(0, 0, w, h);
            ctx.font = '13px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            const step = 15;
            const end = progress * h;
            let hikerX = w / 2;
            for (let y = 0; y < h; y += step) {
                const x = w / 2 + Math.sin(y * 0.012) * (w * 0.28) + Math.sin(y * 0.041) * 4;
                const reached = y < end;
                ctx.fillStyle = reached ? '#9b0d23' : 'rgba(13,11,11,0.18)';
                const k = Math.floor(y / step) % 4;
                ctx.fillText(reached ? [':', '.', "'", '.'][k] : '.', x, y);
                if (reached) hikerX = x;
                if (reached && Math.floor(y / step) % 9 === 4) {
                    ctx.fillStyle = '#e46a8c';
                    ctx.fillText('✿', x + 16 * Math.sign(Math.cos(y * 0.012)), y);
                }
            }
            if (progress > 0 && progress < 1) {
                ctx.fillStyle = '#0d0b0b';
                ctx.font = '15px "JetBrains Mono", monospace';
                ctx.fillText('\\(^o^)/', hikerX, end + 6);
            }
        };
        const queue = () => {
            if (!raf) raf = requestAnimationFrame(draw);
        };
        resize();
        draw();
        const ro = new ResizeObserver(() => {
            resize();
            queue();
        });
        ro.observe(canvas);
        window.addEventListener('scroll', queue, { passive: true });
        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            window.removeEventListener('scroll', queue);
        };
    }, []);
    return <canvas ref={ref} className="zn-path__trail" aria-hidden="true" />;
};

const Station = ({ item, side, index }) => {
    const [ref, seen] = useInView();
    return (
        <li ref={ref} className={`zn-station zn-station--${side} ${seen ? 'is-in' : ''}`}>
            <div className="zn-station__flag" aria-hidden="true">
                {item.now ? '⚑' : '◆'}
            </div>
            <article className="zn-station__card">
                <p className="zn-station__alt">
                    <span>{item.alt}</span>
                    {item.when}
                </p>
                <h3>{item.title}</h3>
                <p className="zn-station__role">{item.role}</p>
                {item.summary && <p className="zn-station__summary">{item.summary}</p>}
                {item.points && (
                    <ul>
                        {item.points.map((p) => (
                            <li key={p}>{p}</li>
                        ))}
                    </ul>
                )}
                {item.tags && (
                    <p className="zn-station__tags">
                        {item.tags.map((t) => (
                            <span key={t}>{t}</span>
                        ))}
                    </p>
                )}
                {item.now && <span className="zn-station__here">you are here</span>}
                <span className="zn-station__no" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                </span>
            </article>
        </li>
    );
};

const Path = ({ experience, education }) => {
    const alts = ['2,400 m', '1,600 m', '900 m', '300 m', '0 m'];
    const stops = [
        ...experience.map((job) => ({
            alt: '',
            when: `${job.start} → ${job.end}`,
            title: job.company,
            role: job.role,
            summary: job.summary,
            points: job.points,
            tags: job.tags,
            now: job.end === 'Present',
        })),
        ...education.map((e) => ({
            alt: '',
            when: e.years.replace(' to ', ' → '),
            title: e.school,
            role: e.degree,
            summary: e.note,
        })),
    ].map((s, i) => ({ ...s, alt: `alt. ${alts[i] || '0 m'}` }));

    return (
        <section className="zn-section zn-path" id="path">
            <div className="zn-chapter" aria-hidden="true">
                <span>二</span> the path down the mountain
            </div>
            <div className="zn-path__head">
                <h2 className="zn-h2">
                    Where I&apos;ve been, <em>read from the top.</em>
                </h2>
                <p>
                    Three jobs and two schools, laid out as a trail. Scroll down and the hiker walks you back to where
                    it started.
                </p>
            </div>
            <pre className="zn-path__summit" aria-hidden="true">{SUMMIT}</pre>
            <div className="zn-path__body">
                <Trail />
                <ol className="zn-path__list">
                    {stops.map((s, i) => (
                        <Station key={s.title} item={s} side={i % 2 ? 'right' : 'left'} index={i} />
                    ))}
                </ol>
            </div>
            <p className="zn-path__trailhead" aria-hidden="true">
                ── trailhead · Surat · where the curiosity started ──
            </p>
        </section>
    );
};

export default Path;
