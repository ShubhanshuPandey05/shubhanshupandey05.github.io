import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { FiCode, FiDatabase, FiServer, FiGitBranch } from 'react-icons/fi';

const statIcons = [FiCode, FiServer, FiDatabase, FiGitBranch];

const AnimatedCounter = ({ target, label, icon: Icon, delay }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay, duration: 0.5 }}
            className="text-center"
        >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-3">
                <Icon className="text-xl" />
            </div>
            <div className="text-3xl font-bold gradient-text mb-1">
                {isInView ? target : 0}+
            </div>
            <div className="text-sm text-text-muted">{label}</div>
        </motion.div>
    );
};

const About = ({ about }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    const stats = about?.stats || {};
    const statData = [
        { target: stats.yearsOfExperience || 0, label: 'Years Experience' },
        { target: stats.projectsCompleted || 0, label: 'Projects Built' },
        { target: stats.technologiesUsed || 0, label: 'Technologies' },
        { target: stats.codeCommits || 0, label: 'Code Commits' },
    ];

    return (
        <section id="about" className="py-24 px-6 relative">
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-primary font-mono text-sm">// about me</span>
                    <h2 className="text-4xl font-bold mt-2 text-text-primary">
                        Who I <span className="gradient-text">Am</span>
                    </h2>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Bio */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        <div className="glass rounded-2xl p-8">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span className="text-text-muted text-xs font-mono ml-2">about.md</span>
                            </div>
                            <p className="text-text-secondary leading-relaxed text-[15px]">
                                {about?.bio || 'Loading...'}
                            </p>
                            {about?.location && (
                                <p className="mt-4 text-text-muted text-sm font-mono">
                                    📍 {about.location}
                                </p>
                            )}
                            {about?.email && (
                                <p className="text-text-muted text-sm font-mono">
                                    ✉️ {about.email}
                                </p>
                            )}
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        <div className="grid grid-cols-2 gap-6">
                            {statData.map((stat, i) => (
                                <AnimatedCounter
                                    key={stat.label}
                                    target={stat.target}
                                    label={stat.label}
                                    icon={statIcons[i]}
                                    delay={0.5 + i * 0.15}
                                />
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default About;
