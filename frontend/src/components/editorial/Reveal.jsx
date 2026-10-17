import { motion } from 'framer-motion';

const Reveal = ({ children, delay = 0, y = 40, className = '', as = 'div' }) => {
    const Tag = motion[as] || motion.div;
    return (
        <Tag
            className={className}
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </Tag>
    );
};

export default Reveal;
