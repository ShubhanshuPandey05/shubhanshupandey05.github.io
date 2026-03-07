import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
    FaGithub,
    FaLinkedin,
    FaTwitter,
    FaDev,
    FaYoutube,
    FaDiscord,
    FaInstagram,
    FaGlobe,
} from 'react-icons/fa';
import { FiArrowUpRight } from 'react-icons/fi';

const iconMap = {
    FaGithub,
    FaLinkedin,
    FaTwitter,
    FaDev,
    FaYoutube,
    FaDiscord,
    FaInstagram,
    FaGlobe,
};

const Contact = ({ about, socialLinks }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section id="contact" className="py-24 md:py-40 px-6 md:px-12 relative overflow-hidden border-t border-border">
            {/* Section number watermark */}
            <div className="section-number left-0 md:left-12 top-12">05</div>

            <div className="max-w-7xl mx-auto relative" ref={ref}>
                {/* Section label */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="mb-16"
                >
                    <span className="text-caption text-accent">Contact</span>
                    <div className="editorial-divider-accent mt-4" />
                </motion.div>

                {/* Big headline */}
                <motion.h2
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
                    className="text-display mb-12"
                >
                    Let's<br />Talk<span className="text-accent">.</span>
                </motion.h2>

                <div className="grid md:grid-cols-12 gap-12">
                    {/* Left — Description & Email */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.3, duration: 0.7 }}
                        className="md:col-span-6"
                    >
                        <p className="text-body-lg text-text-muted mb-10 max-w-md">
                            Interested in working together or just want to say hello?
                            I'm always open to discussing new projects, creative ideas,
                            or opportunities to be part of something great.
                        </p>

                        {about?.email && (
                            <a
                                href={`mailto:${about.email}`}
                                className="inline-flex items-center gap-3 font-serif text-2xl md:text-3xl text-text-primary hover:text-accent transition-colors duration-300 group"
                            >
                                {about.email}
                                <FiArrowUpRight
                                    size={20}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                            </a>
                        )}

                        {about?.location && (
                            <p className="text-caption text-text-muted mt-6">
                                Based in — {about.location}
                            </p>
                        )}
                    </motion.div>

                    {/* Right — Social links */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.5, duration: 0.7 }}
                        className="md:col-span-6 md:pl-12"
                    >
                        <span className="text-caption text-text-muted block mb-8">Find Me On</span>

                        <div className="space-y-0">
                            {socialLinks.map((link, i) => {
                                const Icon = iconMap[link.icon] || FaGlobe;
                                return (
                                    <motion.a
                                        key={link._id || i}
                                        href={link.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                                        transition={{ delay: 0.6 + i * 0.08 }}
                                        className="flex items-center gap-4 py-4 border-b border-border text-text-secondary hover:text-text-primary hover:pl-2 transition-all duration-300 group"
                                    >
                                        <Icon size={18} className="text-text-muted group-hover:text-accent transition-colors" />
                                        <span className="font-mono text-sm">{link.platform}</span>
                                        <FiArrowUpRight
                                            size={14}
                                            className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-accent"
                                        />
                                    </motion.a>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
