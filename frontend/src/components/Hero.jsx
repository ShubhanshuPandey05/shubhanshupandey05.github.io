import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FiArrowDown, FiDownload } from 'react-icons/fi';

const Hero = ({ about }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    const name = about?.name || 'Developer';
    const title = about?.title || 'Backend Developer';
    const subtitle = about?.subtitle || 'Building scalable & robust server-side architectures';

    // Split name for staggered animation
    const nameWords = name.split(' ');

    return (
        <section
            ref={ref}
            id="home"
            className="relative min-h-screen flex items-center overflow-hidden"
        >
            {/* Subtle grain texture overlay */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
            />

            {/* Decorative accent line */}
            <motion.div
                initial={{ height: 0 }}
                animate={isInView ? { height: '30vh' } : {}}
                transition={{ duration: 1.2, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="absolute right-12 md:right-24 top-0 w-px bg-accent hidden md:block"
            />

            <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-32 md:py-0">
                <div className="grid md:grid-cols-12 gap-8 md:gap-4 items-end">
                    {/* Left — Large name */}
                    <div className="md:col-span-8">
                        {/* Eyebrow */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-caption text-text-muted mb-6"
                        >
                            Portfolio — {new Date().getFullYear()}
                        </motion.p>

                        {/* Name — Display size */}
                        <div className="text-display">
                            {nameWords.map((word, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ opacity: 0, y: 80 }}
                                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{
                                        duration: 0.8,
                                        delay: 0.3 + i * 0.15,
                                        ease: [0.23, 1, 0.32, 1],
                                    }}
                                    className="inline-block mr-[0.3em]"
                                >
                                    {word}
                                </motion.span>
                            ))}
                        </div>

                        {/* Divider */}
                        <motion.div
                            initial={{ width: 0 }}
                            animate={isInView ? { width: 60 } : {}}
                            transition={{ duration: 0.8, delay: 0.8 }}
                            className="h-[2px] bg-accent mt-8 mb-6"
                        />

                        {/* Title */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.9 }}
                            className="text-subheadline text-text-secondary font-serif italic"
                        >
                            {title}
                        </motion.p>
                    </div>

                    {/* Right — Subtitle & CTA */}
                    <div className="md:col-span-4 md:pb-4">
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 1.1 }}
                            className="text-body-lg text-text-muted mb-8"
                        >
                            {subtitle}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 1.3 }}
                            className="flex flex-col gap-4"
                        >
                            {about?.resumeUrl ? (
                                <a
                                    href={about.resumeUrl}
                                    download
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-3 text-caption text-text-primary hover:text-accent transition-colors group"
                                >
                                    <span className="w-10 h-px bg-text-primary group-hover:bg-accent group-hover:w-16 transition-all duration-300" />
                                    <FiDownload size={14} />
                                    Download Resume
                                </a>
                            ) : null}
                            <button
                                onClick={() => {
                                    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="inline-flex items-center gap-3 text-caption text-text-muted hover:text-text-primary transition-colors group"
                            >
                                <span className="w-10 h-px bg-text-muted group-hover:bg-text-primary group-hover:w-16 transition-all duration-300" />
                                View My Work
                            </button>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <motion.button
                onClick={() => {
                    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-text-muted hover:text-accent transition-colors"
            >
                <span className="text-caption text-[0.6rem]">Scroll</span>
                <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                >
                    <FiArrowDown size={16} />
                </motion.div>
            </motion.button>
        </section>
    );
};

export default Hero;
