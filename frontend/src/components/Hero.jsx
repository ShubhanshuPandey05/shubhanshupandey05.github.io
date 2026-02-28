import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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

const Hero = ({ about }) => {
    const { displayedText: typedName, isComplete: nameComplete } = useTypingEffect(
        about?.name || 'Developer',
        80
    );
    const { displayedText: typedTitle } = useTypingEffect(
        nameComplete ? (about?.title || 'Backend Developer') : '',
        40
    );

    const codeSnippets = [
        'const server = express();',
        'app.listen(3000);',
        'db.connect(URI);',
        'jwt.sign(payload);',
        'res.status(200).json();',
    ];

    return (
        <section
            id="home"
            className="relative min-h-screen flex items-center justify-center overflow-hidden bg-grid"
        >
            {/* Floating code snippets */}
            {codeSnippets.map((snippet, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: [0, 0.15, 0.15, 0],
                        y: [0, -30, -60, -90],
                    }}
                    transition={{
                        duration: 8,
                        delay: i * 2,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                    className="absolute font-mono text-xs text-primary/30 pointer-events-none select-none"
                    style={{
                        left: `${15 + i * 16}%`,
                        top: `${30 + (i % 3) * 20}%`,
                    }}
                >
                    {snippet}
                </motion.div>
            ))}

            {/* Gradient orbs */}
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />

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

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="flex flex-wrap gap-4 justify-center"
                >
                    <a
                        href="#projects"
                        className="px-8 py-3 bg-gradient-to-r from-primary to-accent text-dark-900 font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
                    >
                        View My Work
                    </a>
                    <a
                        href="#contact"
                        className="px-8 py-3 glass rounded-lg text-text-primary font-medium hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5"
                    >
                        Get In Touch
                    </a>
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
