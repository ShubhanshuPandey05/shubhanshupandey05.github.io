import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { FiTerminal, FiArrowDown } from 'react-icons/fi';

const useTypingEffect = (text, speed = 50) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (!text) return;
        setDisplayedText('');
        setIsComplete(false);
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                setDisplayedText(text.slice(0, i + 1));
                i++;
            } else {
                setIsComplete(true);
                clearInterval(interval);
            }
        }, speed);
        return () => clearInterval(interval);
    }, [text, speed]);

    return { displayedText, isComplete };
};

/* ---- Magnetic Button ---- */
const MagneticButton = ({ children, href, className }) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 200, damping: 20 });
    const springY = useSpring(y, { stiffness: 200, damping: 20 });

    const handleMouse = useCallback((e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set((e.clientX - centerX) * 0.3);
        y.set((e.clientY - centerY) * 0.3);
    }, [x, y]);

    const handleLeave = useCallback(() => {
        x.set(0);
        y.set(0);
    }, [x, y]);

    return (
        <motion.a
            ref={ref}
            href={href}
            onMouseMove={handleMouse}
            onMouseLeave={handleLeave}
            style={{ x: springX, y: springY }}
            className={className}
        >
            {children}
        </motion.a>
    );
};

const Hero = ({ about }) => {
    const sectionRef = useRef(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const spotlightX = useSpring(mouseX, { stiffness: 50, damping: 30 });
    const spotlightY = useSpring(mouseY, { stiffness: 50, damping: 30 });

    // Parallax orb values — these move opposite to the mouse for a depth effect
    const orbX = useSpring(mouseX, { stiffness: 30, damping: 40 });
    const orbY = useSpring(mouseY, { stiffness: 30, damping: 40 });

    const { displayedText: typedName, isComplete: nameComplete } = useTypingEffect(
        about?.name || 'Developer',
        80
    );
    const { displayedText: typedTitle } = useTypingEffect(
        nameComplete ? (about?.title || 'Backend Developer') : '',
        40
    );

    const handleMouseMove = useCallback(
        (e) => {
            const rect = sectionRef.current?.getBoundingClientRect();
            if (!rect) return;
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            mouseX.set(x);
            mouseY.set(y);
        },
        [mouseX, mouseY]
    );

    const codeSnippets = [
        'const server = express();',
        'app.listen(3000);',
        'db.connect(URI);',
        'jwt.sign(payload);',
        'res.status(200).json();',
        'router.get("/api");',
        'mongoose.model("User");',
    ];

    // Floating particles
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 3,
        duration: 15 + Math.random() * 20,
        delay: Math.random() * 10,
    }));

    return (
        <section
            ref={sectionRef}
            id="home"
            onMouseMove={handleMouseMove}
            className="relative min-h-screen flex items-center justify-center overflow-hidden bg-grid"
        >
            {/* Mouse-tracking spotlight glow */}
            <motion.div
                className="absolute pointer-events-none w-[500px] h-[500px] rounded-full opacity-20"
                style={{
                    x: spotlightX,
                    y: spotlightY,
                    translateX: '-50%',
                    translateY: '-50%',
                    background:
                        'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)',
                }}
            />

            {/* Floating particles */}
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full bg-primary/20 pointer-events-none"
                    style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
                    animate={{
                        y: [0, -40, 0],
                        x: [0, 15, -15, 0],
                        opacity: [0, 0.6, 0.6, 0],
                    }}
                    transition={{
                        duration: p.duration,
                        delay: p.delay,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
            ))}

            {/* Floating code snippets */}
            {codeSnippets.map((snippet, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: [0, 0.2, 0.2, 0],
                        y: [0, -40, -80, -120],
                        x: [0, (i % 2 === 0 ? 10 : -10), 0],
                    }}
                    transition={{
                        duration: 10,
                        delay: i * 1.8,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                    className="absolute font-mono text-xs text-primary/30 pointer-events-none select-none"
                    style={{
                        left: `${10 + i * 12}%`,
                        top: `${35 + (i % 3) * 18}%`,
                    }}
                >
                    {snippet}
                </motion.div>
            ))}

            {/* Parallax gradient orbs that follow mouse lazily */}
            <motion.div
                className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"
                style={{ x: orbX, y: orbY, scale: 1 }}
            />
            <motion.div
                className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-[120px]"
                style={{
                    x: useSpring(mouseX, { stiffness: 20, damping: 50 }),
                    y: useSpring(mouseY, { stiffness: 20, damping: 50 }),
                }}
            />

            <div className="relative z-10 text-center px-6 max-w-4xl">
                {/* Terminal badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
                >
                    <FiTerminal className="text-primary" />
                    <span className="text-xs font-mono text-text-secondary">
                        ~/portfolio $ whoami
                    </span>
                </motion.div>

                {/* Name */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-5xl md:text-7xl font-bold mb-4 tracking-tight"
                >
                    <span className="text-text-primary">Hi, I'm </span>
                    <span className="gradient-text">{typedName}</span>
                    <span className="animate-pulse text-primary">|</span>
                </motion.h1>

                {/* Title */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-xl md:text-2xl text-text-secondary font-light mb-4 font-mono"
                >
                    {typedTitle || '\u00A0'}
                </motion.p>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="text-base text-text-muted max-w-xl mx-auto mb-10"
                >
                    {about?.subtitle || 'Building scalable & robust server-side architectures'}
                </motion.p>

                {/* CTA Buttons — Magnetic */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="flex flex-wrap gap-4 justify-center"
                >
                    <MagneticButton
                        href="#projects"
                        className="px-8 py-3 bg-gradient-to-r from-primary to-accent text-dark-900 font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 inline-block"
                    >
                        View My Work
                    </MagneticButton>
                    <MagneticButton
                        href="#contact"
                        className="px-8 py-3 glass rounded-lg text-text-primary font-medium hover:bg-white/10 transition-all duration-300 inline-block"
                    >
                        Get In Touch
                    </MagneticButton>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.a
                href="#about"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 8, 0] }}
                transition={{ delay: 1.5, y: { repeat: Infinity, duration: 2 } }}
                className="absolute bottom-10 text-text-muted hover:text-primary transition-colors"
            >
                <FiArrowDown className="text-2xl" />
            </motion.a>
        </section>
    );
};

export default Hero;
