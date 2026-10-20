import { Link } from 'react-router-dom';
import AsciiCanvas from '../AsciiCanvas';
import { heroBackground, heroForeground } from '../scenes';

const HERO_MIST = [
    { y: 0.5, h: 0.07, a: 0.75, speed: 0.6 },
    { y: 0.63, h: 0.06, a: 0.8, speed: -0.45 },
    { y: 0.85, h: 0.05, a: 0.7, speed: 0.35 },
];
const HERO_PETALS = { count: 26, x0: 0.45, x1: 1.05, y0: -0.05, y1: 0.4 };

// Layered like the reference posters: ASCII landscape, the name in plain type,
// then a hiker in ASCII standing in front of the letters.
const Hero = ({ profile }) => (
    <section className="ik-hero" id="top" aria-label="Introduction">
        <AsciiCanvas
            className="ik-hero__bg"
            scene={heroBackground}
            mist={HERO_MIST}
            petals={HERO_PETALS}
            label="Ink-wash mountains with a red sun, a pagoda and a pine, drawn in text characters"
        />
        <div className="ik-hero__top">
            <p className="ik-eyebrow">
                <span className="ik-dot" /> Available for backend work · {profile.location}
            </p>
            <p className="ik-hero__lede">
                I build the quiet parts of software: APIs, queues, real-time pipes and the servers they run on.
            </p>
        </div>
        <h1 className="ik-hero__name">
            <span className="ik-hero__first">{profile.firstName}</span>
            <span className="ik-hero__last">
                {profile.lastName} <em>/ {profile.title}</em>
            </span>
        </h1>
        <AsciiCanvas className="ik-hero__fg" scene={heroForeground} transparent />
        <div className="ik-hero__bottom">
            <div className="ik-hero__ctas">
                <a href="#work" className="ik-btn" data-cursor="look">
                    See the work
                </a>
                <a href="#contact" className="ik-btn ik-btn--ghost" data-cursor="say hi">
                    Say hello
                </a>
            </div>
            <ul className="ik-hero__facts">
                <li><strong>{profile.stats.yearsOfExperience}+</strong> years building backends</li>
                <li><strong>{profile.stats.projectsCompleted}</strong> projects shipped</li>
                <li><strong>{profile.stats.codeCommits}</strong> commits this year</li>
            </ul>
            <Link to="/resume" className="ik-hero__scroll" aria-label="Open résumé">
                Scroll, or open the résumé ↓
            </Link>
        </div>
    </section>
);

export default Hero;
