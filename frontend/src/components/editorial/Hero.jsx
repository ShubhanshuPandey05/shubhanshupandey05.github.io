import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HeroScene from './HeroScene';
import PetalField from './PetalField';
import WobbleWord from './WobbleWord';

const Hero = ({ profile }) => {
    const ref = useRef(null);

    const onMove = (e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
        el.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    };

    return (
        <section className="ed-hero" ref={ref} onMouseMove={onMove} id="top">
            <div className="ed-hero__art">
                <HeroScene />
            </div>
            <PetalField count={34} />

            <div className="ed-hero__copy">
                <motion.p
                    className="ed-kicker"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    <span className="ed-kicker__rule" /> The Backend Issue &middot; {profile.title} &middot; {profile.location}
                </motion.p>

                <motion.h1
                    className="ed-hero__name"
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                >
                    <WobbleWord text={profile.firstName} />
                    <WobbleWord text={profile.lastName} className="ed-hero__last" />
                </motion.h1>

                <motion.p
                    className="ed-hero__deck"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.9 }}
                >
                    I build the quiet machinery behind loud products: APIs, queues and real-time
                    systems that keep <em>blooming</em> under load.
                </motion.p>

                <motion.div
                    className="ed-hero__ctas"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.9 }}
                >
                    <Link to={{ pathname: '/', hash: '#works' }} className="ed-btn ed-btn--solid" data-cursor="dig in">
                        See the work <span aria-hidden="true">↓</span>
                    </Link>
                    <Link to="/resume" className="ed-btn" data-cursor="read">
                        Read the résumé <span aria-hidden="true">↗</span>
                    </Link>
                </motion.div>
            </div>

            <div className="ed-hero__vertical" aria-hidden="true">
                桜と山 &middot; sakura to yama &middot; blossoms &amp; mountains
            </div>

            <div className="ed-hero__stamp" data-cursor="hello!" aria-hidden="true">
                <span>SP</span>
                <small>2026</small>
            </div>

            <div className="ed-hero__scroll" aria-hidden="true">
                <span>Scroll</span>
                <i />
            </div>
        </section>
    );
};

export default Hero;
