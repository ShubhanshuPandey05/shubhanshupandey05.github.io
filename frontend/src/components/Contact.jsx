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
import { FiMail, FiMapPin } from 'react-icons/fi';

const iconMap = {
    FaGithub: FaGithub,
    FaLinkedin: FaLinkedin,
    FaTwitter: FaTwitter,
    FaDev: FaDev,
    FaYoutube: FaYoutube,
    FaDiscord: FaDiscord,
    FaInstagram: FaInstagram,
    FaGlobe: FaGlobe,
};

const Contact = ({ about, socialLinks }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section id="contact" className="py-24 px-6 relative bg-dark-800/50">
            <div className="max-w-4xl mx-auto">
                {/* Section Header */}
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-primary font-mono text-sm">// contact</span>
                    <h2 className="text-4xl font-bold mt-2 text-text-primary">
                        Get In <span className="gradient-text">Touch</span>
                    </h2>
                    <p className="text-text-muted mt-4 max-w-lg mx-auto">
                        Interested in working together? Feel free to reach out through any of the
                        channels below.
                    </p>
                </motion.div>

                {/* Contact Info */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.3 }}
                    className="glass rounded-2xl p-8 mb-10"
                >
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        {about?.email && (
                            <a
                                href={`mailto:${about.email}`}
                                className="flex items-center gap-3 text-text-secondary hover:text-primary transition-colors group"
                            >
                                <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                    <FiMail className="text-primary text-xl" />
                                </div>
                                <span className="font-mono text-sm">{about.email}</span>
                            </a>
                        )}
                        {about?.location && (
                            <div className="flex items-center gap-3 text-text-secondary">
                                <div className="p-3 rounded-lg bg-accent/10">
                                    <FiMapPin className="text-accent text-xl" />
                                </div>
                                <span className="font-mono text-sm">{about.location}</span>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Social Links */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap gap-4 justify-center"
                >
                    {socialLinks.map((link, i) => {
                        const Icon = iconMap[link.icon] || FaGlobe;
                        return (
                            <motion.a
                                key={link._id || i}
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                whileHover={{ scale: 1.1, y: -3 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-3 px-5 py-3 glass rounded-xl text-text-secondary hover:text-primary hover:border-primary/30 transition-all duration-300 glow-hover"
                            >
                                <Icon className="text-xl" />
                                <span className="text-sm font-medium">{link.platform}</span>
                            </motion.a>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
};

export default Contact;
