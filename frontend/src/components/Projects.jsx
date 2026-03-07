import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { FiGithub, FiExternalLink, FiX, FiArrowUpRight } from 'react-icons/fi';

/* ---- Project Modal — Editorial style ---- */
const ProjectModal = ({ project, onClose }) => {
    if (!project) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-bg-primary/95 backdrop-blur-sm flex items-center justify-center p-6"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 40 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-3xl w-full max-h-[85vh] overflow-y-auto relative border border-border p-10 md:p-14 bg-bg-primary"
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-text-muted hover:text-text-primary transition-colors"
                >
                    <FiX size={20} />
                </button>

                {/* Category & number */}
                <span className="text-caption text-accent">{project.category}</span>

                <h3 className="font-serif text-3xl md:text-4xl font-bold text-text-primary mt-3 mb-6 leading-tight">
                    {project.title}
                </h3>

                <div className="editorial-divider-accent mb-8" />

                <p className="text-body-lg text-text-secondary mb-8">
                    {project.longDescription || project.description}
                </p>

                {/* Tech stack */}
                <div className="mb-8">
                    <span className="text-caption text-text-muted block mb-4">Stack</span>
                    <div className="flex flex-wrap gap-3">
                        {project.techStack?.map((tech) => (
                            <span
                                key={tech}
                                className="font-mono text-xs px-3 py-1.5 border border-border text-text-secondary"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Links */}
                <div className="flex gap-6 border-t border-border pt-8">
                    {project.githubUrl && (
                        <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-caption text-text-muted hover:text-text-primary transition-colors"
                        >
                            <FiGithub size={14} />
                            Source Code
                        </a>
                    )}
                    {project.liveUrl && (
                        <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-caption text-accent hover:text-accent-light transition-colors"
                        >
                            <FiExternalLink size={14} />
                            Live Demo
                        </a>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

/* ---- Featured Project — Full-width hero-style ---- */
const FeaturedProject = ({ project, isInView, onSelect }) => (
    <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        onClick={() => onSelect(project)}
        className="grid md:grid-cols-12 gap-8 mb-20 cursor-pointer group"
    >
        {/* Image */}
        <div className="md:col-span-7 overflow-hidden bg-bg-tertiary aspect-[16/10]">
            {project.imageUrl ? (
                <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <span className="font-serif text-6xl text-text-muted opacity-10">
                        {project.title.charAt(0)}
                    </span>
                </div>
            )}
        </div>

        {/* Content */}
        <div className="md:col-span-5 flex flex-col justify-center">
            <span className="text-caption text-accent mb-4">Featured Project</span>
            <h3 className="font-serif text-3xl md:text-4xl font-bold text-text-primary mb-4 group-hover:text-accent transition-colors duration-300 leading-tight">
                {project.title}
            </h3>
            <p className="text-body-lg text-text-muted mb-6 line-clamp-3">
                {project.description}
            </p>

            {/* Tech */}
            <div className="flex flex-wrap gap-2 mb-6">
                {project.techStack?.slice(0, 4).map((tech) => (
                    <span key={tech} className="font-mono text-[11px] text-text-muted">
                        {tech}{' '}
                    </span>
                ))}
            </div>

            <div className="inline-flex items-center gap-2 text-caption text-text-muted group-hover:text-accent transition-colors">
                Read More <FiArrowUpRight size={12} />
            </div>
        </div>
    </motion.div>
);

/* ---- Regular Project Card — Alternating layout ---- */
const ProjectCard = ({ project, index, isInView, onSelect }) => {
    const isEven = index % 2 === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.1, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
            onClick={() => onSelect(project)}
            className={`grid md:grid-cols-12 gap-6 md:gap-10 py-12 border-b border-border cursor-pointer group ${isEven ? '' : 'md:direction-rtl'
                }`}
        >
            {/* Image — alternates side */}
            <div className={`${isEven ? 'md:col-span-5' : 'md:col-span-5 md:col-start-8'} overflow-hidden bg-bg-tertiary aspect-[16/11]`}>
                {project.imageUrl ? (
                    <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="font-serif text-5xl text-text-muted opacity-10">
                            {project.title.charAt(0)}
                        </span>
                    </div>
                )}
            </div>

            {/* Content — alternates side */}
            <div
                className={`${isEven ? 'md:col-span-7' : 'md:col-span-7 md:col-start-1 md:row-start-1'} flex flex-col justify-center`}
                style={{ direction: 'ltr' }}
            >
                <div className="flex items-center gap-4 mb-3">
                    <span className="font-mono text-xs text-text-muted">
                        {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-caption text-text-muted">{project.category}</span>
                </div>

                <h3 className="font-serif text-2xl md:text-3xl font-bold text-text-primary mb-3 group-hover:text-accent transition-colors duration-300 leading-tight">
                    {project.title}
                </h3>

                <p className="text-text-muted text-sm md:text-base leading-relaxed mb-5 line-clamp-2 max-w-lg">
                    {project.description}
                </p>

                {/* Tech badges */}
                <div className="flex flex-wrap gap-3 mb-4">
                    {project.techStack?.slice(0, 4).map((tech) => (
                        <span
                            key={tech}
                            className="font-mono text-[11px] px-2 py-1 border border-border text-text-muted"
                        >
                            {tech}
                        </span>
                    ))}
                    {project.techStack?.length > 4 && (
                        <span className="font-mono text-[11px] text-text-muted">
                            +{project.techStack.length - 4}
                        </span>
                    )}
                </div>

                {/* Links */}
                <div className="flex gap-6">
                    {project.githubUrl && (
                        <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-text-muted hover:text-text-primary transition-colors"
                        >
                            <FiGithub size={16} />
                        </a>
                    )}
                    {project.liveUrl && (
                        <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-text-muted hover:text-accent transition-colors"
                        >
                            <FiExternalLink size={16} />
                        </a>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const Projects = ({ projects }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });
    const [selectedProject, setSelectedProject] = useState(null);

    // Separate featured from regular
    const featured = projects.find((p) => p.featured);
    const regular = projects.filter((p) => !p.featured);

    return (
        <section id="projects" className="py-24 md:py-40 px-6 md:px-12 relative overflow-hidden border-t border-border">
            {/* Section number watermark */}
            <div className="section-number -right-8 md:right-12 top-12">03</div>

            <div className="max-w-7xl mx-auto relative" ref={ref}>
                {/* Section label */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="mb-16"
                >
                    <span className="text-caption text-accent">Selected Work</span>
                    <div className="editorial-divider-accent mt-4" />
                </motion.div>

                {/* Headline */}
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="text-headline mb-20"
                >
                    Recent <br className="hidden md:block" />
                    <span className="italic text-text-muted">Projects</span>
                </motion.h2>

                {/* Featured project */}
                {featured && (
                    <FeaturedProject
                        project={featured}
                        isInView={isInView}
                        onSelect={setSelectedProject}
                    />
                )}

                {/* Regular projects — alternating layout */}
                {regular.map((project, i) => (
                    <ProjectCard
                        key={project._id || i}
                        project={project}
                        index={i}
                        isInView={isInView}
                        onSelect={setSelectedProject}
                    />
                ))}
            </div>

            {/* Modal */}
            {selectedProject && (
                <ProjectModal
                    project={selectedProject}
                    onClose={() => setSelectedProject(null)}
                />
            )}
        </section>
    );
};

export default Projects;
