import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, useState, useCallback } from 'react';
import { FiGithub, FiExternalLink, FiX } from 'react-icons/fi';

/* ---- 3D Tilt Card Wrapper ---- */
const TiltCard = ({ children, className, onClick }) => {
    const ref = useRef(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
        stiffness: 200,
        damping: 30,
    });
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
        stiffness: 200,
        damping: 30,
    });
    const glareX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
    const glareY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);

    const handleMouse = useCallback(
        (e) => {
            const rect = ref.current?.getBoundingClientRect();
            if (!rect) return;
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            mouseX.set(x);
            mouseY.set(y);
        },
        [mouseX, mouseY]
    );

    const handleLeave = useCallback(() => {
        mouseX.set(0);
        mouseY.set(0);
    }, [mouseX, mouseY]);

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={handleLeave}
            onClick={onClick}
            style={{
                rotateX,
                rotateY,
                transformPerspective: 800,
                transformStyle: 'preserve-3d',
            }}
            className={className}
        >
            {/* Glare overlay */}
            <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    background: useTransform(
                        [glareX, glareY],
                        ([gx, gy]) =>
                            `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.08), transparent 60%)`
                    ),
                }}
            />
            {children}
        </motion.div>
    );
};

const ProjectCard = ({ project, index, onSelect }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.15, duration: 0.5 }}
        >
            <TiltCard
                onClick={() => onSelect(project)}
                className="glass rounded-2xl overflow-hidden group cursor-pointer hover:border-primary/30 transition-all duration-500 glow-hover relative"
            >
                {/* Project Image or Gradient Placeholder */}
                <div className="h-44 bg-gradient-to-br from-dark-700 to-dark-600 relative overflow-hidden">
                    {project.imageUrl ? (
                        <img
                            src={project.imageUrl}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <motion.span
                                className="font-mono text-4xl text-text-muted/20 group-hover:text-primary/30 transition-colors"
                                whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                                transition={{ duration: 0.6 }}
                            >
                                {'{ }'}
                            </motion.span>
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

                    {/* Tech Stack with stagger */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {project.techStack?.slice(0, 4).map((tech, i) => (
                            <motion.span
                                key={tech}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                                transition={{ delay: index * 0.15 + 0.3 + i * 0.05 }}
                                whileHover={{ scale: 1.1, y: -2 }}
                                className="px-2 py-1 bg-dark-600/80 text-[11px] text-text-secondary rounded-md font-mono cursor-default"
                            >
                                {tech}
                            </motion.span>
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
                            <motion.a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                whileHover={{ scale: 1.2, rotate: 5 }}
                                whileTap={{ scale: 0.9 }}
                                className="text-text-muted hover:text-primary transition-colors"
                            >
                                <FiGithub className="text-lg" />
                            </motion.a>
                        )}
                        {project.liveUrl && (
                            <motion.a
                                href={project.liveUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                whileHover={{ scale: 1.2, rotate: -5 }}
                                whileTap={{ scale: 0.9 }}
                                className="text-text-muted hover:text-accent transition-colors"
                            >
                                <FiExternalLink className="text-lg" />
                            </motion.a>
                        )}
                    </div>
                </div>
            </TiltCard>
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
                initial={{ scale: 0.85, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0, y: 40 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="glass rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8 relative"
            >
                <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.2, rotate: 90 }}
                    whileTap={{ scale: 0.8 }}
                    className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
                >
                    <FiX className="text-xl" />
                </motion.button>

                <span className="text-primary font-mono text-xs">{project.category}</span>
                <h3 className="text-2xl font-bold text-text-primary mt-1 mb-4">{project.title}</h3>
                <p className="text-text-secondary leading-relaxed mb-6">
                    {project.longDescription || project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                    {project.techStack?.map((tech, i) => (
                        <motion.span
                            key={tech}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ scale: 1.1 }}
                            className="px-3 py-1 bg-dark-600/80 text-xs text-text-secondary rounded-lg font-mono"
                        >
                            {tech}
                        </motion.span>
                    ))}
                </div>

                <div className="flex gap-4">
                    {project.githubUrl && (
                        <motion.a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-4 py-2 glass rounded-lg text-sm text-text-primary hover:text-primary transition-colors"
                        >
                            <FiGithub /> GitHub
                        </motion.a>
                    )}
                    {project.liveUrl && (
                        <motion.a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-dark-900 rounded-lg text-sm font-medium"
                        >
                            <FiExternalLink /> Live Demo
                        </motion.a>
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
