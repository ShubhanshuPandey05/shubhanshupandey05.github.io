import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const About = ({ about }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    const stats = about?.stats || {};
    const statData = [
        { value: stats.yearsOfExperience || 0, label: 'Years Experience' },
        { value: stats.projectsCompleted || 0, label: 'Projects Built' },
        { value: stats.technologiesUsed || 0, label: 'Technologies' },
        { value: stats.codeCommits || 0, label: 'Code Commits' },
    ];

    return (
        <section id="about" className="py-24 md:py-40 px-6 md:px-12 relative overflow-hidden">
            {/* Section number watermark */}
            <div className="section-number -left-8 md:left-12 top-12">01</div>

            <div className="max-w-7xl mx-auto relative" ref={ref}>
                {/* Section label */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="mb-16"
                >
                    <span className="text-caption text-accent">About</span>
                    <div className="editorial-divider-accent mt-4" />
                </motion.div>

                <div className="grid md:grid-cols-12 gap-12 md:gap-16">
                    {/* Left — Bio as pull-quote */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.2, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                        className="md:col-span-7"
                    >
                        <p className="pull-quote mb-8">
                            {about?.bio || 'Loading...'}
                        </p>

                        {/* Location & Email */}
                        <div className="flex flex-col gap-2 mt-10">
                            {about?.location && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={isInView ? { opacity: 1 } : {}}
                                    transition={{ delay: 0.6 }}
                                    className="text-caption text-text-muted"
                                >
                                    Based in — {about.location}
                                </motion.p>
                            )}
                            {about?.email && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={isInView ? { opacity: 1 } : {}}
                                    transition={{ delay: 0.7 }}
                                    className="text-caption text-text-muted"
                                >
                                    Contact — {about.email}
                                </motion.p>
                            )}
                        </div>
                    </motion.div>

                    {/* Right — Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.4, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                        className="md:col-span-5"
                    >
                        <div className="grid grid-cols-2 gap-8">
                            {statData.map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ delay: 0.5 + i * 0.1 }}
                                    className="text-left"
                                >
                                    <div className="font-serif text-4xl md:text-5xl font-bold text-text-primary mb-2">
                                        {isInView ? stat.value : 0}
                                        <span className="text-accent">+</span>
                                    </div>
                                    <div className="text-caption text-text-muted">{stat.label}</div>
                                    <div className="editorial-divider mt-4" />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default About;
