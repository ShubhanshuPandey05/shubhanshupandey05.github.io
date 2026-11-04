import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Scramble from '../Scramble';

const useClock = () => {
    const fmt = () =>
        new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const [time, setTime] = useState(fmt);
    useEffect(() => {
        const id = setInterval(() => setTime(fmt()), 1000);
        return () => clearInterval(id);
    }, []);
    return time;
};

const Hero = ({ profile, count }) => {
    const time = useClock();
    return (
        <section className="ax-sec ax-hero" id="top" data-scene="hero" aria-label="Introduction">
            <div className="ax-window" aria-hidden="true" />
            <div className="ax-sec__body ax-hero__body">
                <Scramble as="p" className="ax-kicker" text={`${profile.title} · ${profile.location}`} />
                <h1 className="ax-hero__name">
                    <span>{profile.firstName}</span>
                    <span>{profile.lastName}</span>
                </h1>
                <p className="ax-hero__lede">
                    I build the quiet parts of software: <strong>APIs, queues, scrapers and real-time pipes</strong>, and the
                    servers they run on.
                </p>
                <p className="ax-sr">Next to this introduction, a portrait of Shubhanshu drawn entirely in ASCII characters.</p>
                <div className="ax-ctas">
                    <a href="#work" className="ax-btn ax-btn--solid">
                        See the work <span aria-hidden="true">↓</span>
                    </a>
                    <Link to="/resume" className="ax-btn">
                        Résumé <span aria-hidden="true">↗</span>
                    </Link>
                    <a href={`mailto:${profile.email}`} className="ax-btn ax-btn--ghost">
                        Email
                    </a>
                </div>
                <dl className="ax-meta">
                    <div>
                        <dt>Local time</dt>
                        <dd>{time} IST</dd>
                    </div>
                    <div>
                        <dt>Based in</dt>
                        <dd>21.17°N 72.83°E</dd>
                    </div>
                    <div>
                        <dt>Portrait</dt>
                        <dd>{count ? `${count.toLocaleString('en-US')} characters` : 'drawing…'}</dd>
                    </div>
                </dl>
                <p className="ax-hint">
                    <span className="ax-hint__arrow" aria-hidden="true">
                        ↓
                    </span>
                    Scroll. Every character in that portrait is about to become something else.
                </p>
            </div>
        </section>
    );
};

export default Hero;
