import { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const CursorGlow = () => {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);
    const springX = useSpring(cursorX, { stiffness: 150, damping: 25 });
    const springY = useSpring(cursorY, { stiffness: 150, damping: 25 });
    const { theme } = useTheme();

    useEffect(() => {
        const handleMove = (e) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        };
        window.addEventListener('mousemove', handleMove);
        return () => window.removeEventListener('mousemove', handleMove);
    }, [cursorX, cursorY]);

    // Only show on desktop (hide on touch devices via CSS)
    return (
        <motion.div
            className="fixed top-0 left-0 w-6 h-6 rounded-full pointer-events-none z-[9999] mix-blend-screen hidden md:block"
            style={{
                x: springX,
                y: springY,
                translateX: '-50%',
                translateY: '-50%',
                background: theme === 'dark'
                    ? 'radial-gradient(circle, rgba(6,182,212,0.4) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(6,182,212,0.25) 0%, transparent 70%)',
                width: 40,
                height: 40,
            }}
        />
    );
};

export default CursorGlow;
