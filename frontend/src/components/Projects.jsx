import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { FiGithub, FiExternalLink, FiX } from 'react-icons/fi';

const ProjectCard = ({ project, index, onSelect }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.15, duration: 0.5 }}
            onClick={() => onSelect(project)}
            className="glass rounded-2xl overflow-hidden group cursor-pointer hover:border-primary/30 transition-all duration-500 glow-hover"
        >
            {/* Project Image or Gradient Placeholder */}
            <div className="h-44 bg-gradient-to-br from-dark-700 to-dark-600 relative overflow-hidden">
                {project.imageUrl ? (
                    <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="font-mono text-4xl text-text-muted/20 group-hover:text-primary/30 transition-colors">
                            {'{ }'}
                        </span>
                    </div>
                )}
                {project.featured && (
                    <span className="absolute top-3 right-3 px-2 py-1 bg-primary/90 text-dark-900 text-[10px] font-bold rounded-md uppercase tracking-wider">
                        Featured
                    </span>
                )}
                <span className="absolute bottom-3 left-3 px-2 py-1 glass text-[10px] text-text-secondary font-mono rounded-md">
                    {project.category || 'Backend'}
                </span>
            </div>

            {/* Content */}
            <div className="p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">
                    {project.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed mb-4 line-clamp-2">
                    {project.description}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {project.techStack?.slice(0, 4).map((tech) => (
                        <span
                            key={tech}
                            className="px-2 py-1 bg-dark-600/80 text-[11px] text-text-secondary rounded-md font-mono"
                        >
                            {tech}
                        </span>
                    ))}
                    {project.techStack?.length > 4 && (
                        <span className="px-2 py-1 text-[11px] text-text-muted">
                            +{project.techStack.length - 4}
                        </span>
                    )}
                </div>

                {/* Links */}
                <div className="flex gap-4">
                    {project.githubUrl && (
                        <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-text-muted hover:text-primary transition-colors"
                        >
                            <FiGithub className="text-lg" />
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
                            <FiExternalLink className="text-lg" />
                        </a>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const ProjectModal = ({ project, onClose }) => {
    if (!project) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-dark-900/80 backdrop-blur-sm flex items-center justify-center p-6"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="glass rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8 relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
                >
                    <FiX className="text-xl" />
                </button>

                <span className="text-primary font-mono text-xs">{project.category}</span>
                <h3 className="text-2xl font-bold text-text-primary mt-1 mb-4">{project.title}</h3>
                <p className="text-text-secondary leading-relaxed mb-6">
                    {project.longDescription || project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                    {project.techStack?.map((tech) => (
                        <span
                            key={tech}
                            className="px-3 py-1 bg-dark-600/80 text-xs text-text-secondary rounded-lg font-mono"
                        >
                            {tech}
                        </span>
                    ))}
                </div>

                <div className="flex gap-4">
                    {project.githubUrl && (
                        <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 px-4 py-2 glass rounded-lg text-sm text-text-primary hover:text-primary transition-colors"
                        >
                            <FiGithub /> GitHub
                        </a>
                    )}
                    {project.liveUrl && (
                        <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-dark-900 rounded-lg text-sm font-medium"
                        >
                            <FiExternalLink /> Live Demo
                        </a>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

const Projects = ({ projects }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });
    const [selectedProject, setSelectedProject] = useState(null);

    return (
        <section id="projects" className="py-24 px-6 relative">
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-primary font-mono text-sm">// projects</span>
                    <h2 className="text-4xl font-bold mt-2 text-text-primary">
                        Recent <span className="gradient-text">Work</span>
                    </h2>
                </motion.div>

                {/* Projects Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project, i) => (
                        <ProjectCard
                            key={project._id || i}
                            project={project}
                            index={i}
                            onSelect={setSelectedProject}
                        />
                    ))}
                </div>
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
