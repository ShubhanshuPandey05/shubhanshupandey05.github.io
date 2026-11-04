import { useEffect, useRef, useState } from 'react';
import { confetti, unlock } from '../secrets';
import { useInView } from '../lib';

// Each letter leans away from the cursor a little.
const Magnetic = ({ text }) => {
    const ref = useRef(null);
    const onMove = (e) => {
        ref.current?.querySelectorAll('span').forEach((s) => {
            const r = s.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            const d = Math.hypot(dx, dy);
            const f = Math.max(0, 1 - d / 160);
            s.style.transform = `translate(${(-dx / (d || 1)) * f * 14}px, ${(-dy / (d || 1)) * f * 14}px)`;
            s.style.color = f > 0.35 ? 'var(--acc)' : '';
        });
    };
    const onLeave = () =>
        ref.current?.querySelectorAll('span').forEach((s) => {
            s.style.transform = '';
            s.style.color = '';
        });
    return (
        <h2 className="sp-contact__title" ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} aria-label={text}>
            {text.split(' ').map((w, wi) => (
                <span className="sp-contact__word" key={wi} aria-hidden="true">
                    {[...w].map((c, ci) => (
                        <span key={ci}>{c}</span>
                    ))}
                </span>
            ))}
        </h2>
    );
};

const Contact = ({ email, socials, index }) => {
    const [ref, seen] = useInView('0px 0px -30% 0px');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (seen) unlock('end');
    }, [seen]);

    const copy = async (e) => {
        const { clientX, clientY } = e;
        try {
            await navigator.clipboard.writeText(email);
        } catch {
            /* clipboard blocked: the mailto link still works */
        }
        setCopied(true);
        confetti(clientX, clientY, 90);
        setTimeout(() => setCopied(false), 1800);
    };

    return (
        <section className="sp-contact" id="contact" ref={ref}>
            <div className="sp-contact__glow" aria-hidden="true" />
            <p className="sp-label">
                <span>{index}</span> Contact
            </p>
            <Magnetic text="Let’s build something that lasts." />
            <div className="sp-contact__row">
                <a className="sp-contact__email" href={`mailto:${email}`} data-cursor="write">
                    {email}
                </a>
                <button type="button" className="sp-btn sp-btn--small" onClick={copy} data-cursor="copy">
                    {copied ? 'Copied ✓' : 'Copy email'}
                </button>
            </div>
            <ul className="sp-contact__socials">
                {socials.map((s) => (
                    <li key={s.platform}>
                        <a href={s.url} target="_blank" rel="noreferrer" data-cursor="visit">
                            <span>{s.platform}</span> <i aria-hidden="true">↗</i>
                        </a>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default Contact;
