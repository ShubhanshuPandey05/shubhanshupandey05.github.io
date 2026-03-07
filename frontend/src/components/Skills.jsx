import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';

const Skills = ({ skills }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = ['All', ...new Set(skills.map((s) => s.category))];
    const filtered =
        activeCategory === 'All'
            ? skills
            : skills.filter((s) => s.category === activeCategory);

    return (
        <section id="skills" className="py-24 md:py-40 px-6 md:px-12 relative overflow-hidden">
            {/* Section number watermark */}
            <div className="section-number right-0 md:right-12 top-12">02</div>

            <div className="max-w-7xl mx-auto relative" ref={ref}>
                {/* Section label */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="mb-16"
                >
                    <span className="text-caption text-accent">Expertise</span>
                    <div className="editorial-divider-accent mt-4" />
                </motion.div>

                {/* Headline */}
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="text-headline mb-16"
                >
                    Technologies <br className="hidden md:block" />
                    <span className="italic text-text-muted">& Tools</span>
                </motion.h2>

                {/* Category filters */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap gap-4 mb-16"
                >
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`text-caption pb-2 transition-all duration-300 ${activeCategory === cat
                                    ? 'text-text-primary border-b-2 border-accent'
                                    : 'text-text-muted hover:text-text-secondary border-b border-transparent'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </motion.div>

                {/* Skills list — typographic rows */}
                <div className="space-y-0">
                    {filtered.map((skill, i) => (
                        <motion.div
                            key={skill._id || skill.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }}
                            className="group border-b border-border py-5 flex items-center justify-between hover:pl-4 transition-all duration-500"
                        >
                            <div className="flex items-center gap-6">
                                <span className="text-caption text-text-muted w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <h3 className="font-serif text-xl md:text-2xl font-medium text-text-primary group-hover:text-accent transition-colors duration-300">
                                    {skill.name}
                                </h3>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="text-caption text-text-muted hidden sm:block">
                                    {skill.category}
                                </span>
                                <span className="font-mono text-sm text-text-muted">
                                    {skill.proficiency}%
                                </span>
                                {/* Minimal progress indicator */}
                                <div className="w-20 h-px bg-border relative hidden md:block">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={isInView ? { width: `${skill.proficiency}%` } : {}}
                                        transition={{ delay: 0.5 + i * 0.05, duration: 0.8 }}
                                        className="absolute top-0 left-0 h-full bg-accent"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Marquee ticker */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ delay: 0.8 }}
                    className="mt-20 overflow-hidden"
                >
                    <div className="flex animate-marquee whitespace-nowrap">
                        {[...skills, ...skills].map((skill, i) => (
                            <span
                                key={i}
                                className="font-serif text-6xl md:text-8xl font-bold text-text-primary opacity-[0.03] mx-8 select-none"
                            >
                                {skill.name}
                            </span>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Skills;
