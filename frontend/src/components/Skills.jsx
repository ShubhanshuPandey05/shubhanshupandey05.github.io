import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';

const categoryColors = {
    Backend: 'from-cyan-400 to-blue-500',
    Database: 'from-emerald-400 to-teal-500',
    DevOps: 'from-orange-400 to-red-500',
    Tools: 'from-violet-400 to-purple-500',
    Frontend: 'from-pink-400 to-rose-500',
    Other: 'from-gray-400 to-gray-500',
};

const SkillBar = ({ skill, delay, isInView }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay, duration: 0.4 }}
        className="group"
    >
        <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
                {skill.name}
            </span>
            <span className="text-xs font-mono text-text-muted">{skill.proficiency}%</span>
        </div>
        <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={isInView ? { width: `${skill.proficiency}%` } : { width: 0 }}
                transition={{ delay: delay + 0.2, duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full bg-gradient-to-r ${categoryColors[skill.category] || categoryColors.Other
                    }`}
            />
        </div>
    </motion.div>
);

const Skills = ({ skills }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });
    const [activeCategory, setActiveCategory] = useState('All');

    // Group skills by category
    const categories = ['All', ...new Set(skills.map((s) => s.category))];
    const filtered =
        activeCategory === 'All'
            ? skills
            : skills.filter((s) => s.category === activeCategory);

    return (
        <section id="skills" className="py-24 px-6 relative bg-dark-800/50">
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <span className="text-primary font-mono text-sm">// skills</span>
                    <h2 className="text-4xl font-bold mt-2 text-text-primary">
                        Tech <span className="gradient-text">Stack</span>
                    </h2>
                </motion.div>

                {/* Category Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap gap-3 justify-center mb-12"
                >
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeCategory === cat
                                    ? 'bg-gradient-to-r from-primary to-accent text-dark-900'
                                    : 'glass text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </motion.div>

                {/* Skills Grid */}
                <div className="grid md:grid-cols-2 gap-x-12 gap-y-5 max-w-4xl mx-auto">
                    {filtered.map((skill, i) => (
                        <SkillBar
                            key={skill._id || skill.name}
                            skill={skill}
                            delay={0.3 + i * 0.08}
                            isInView={isInView}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Skills;
