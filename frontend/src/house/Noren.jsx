import { motion, useReducedMotion, useTransform } from 'framer-motion';

// One strip of cloth. It shows its own slice of the full-width face, so the
// lettering splits along the slits exactly as dyed cloth does when it parts.
const Panel = ({ index, count, lift, face }) => {
    const reduce = useReducedMotion();
    // The middle parts first, the way cloth opens around someone walking through.
    const fromCentre = Math.abs(index - (count - 1) / 2) / ((count - 1) / 2);
    const start = fromCentre * 0.26;
    const end = start + 0.6;
    const rotateX = useTransform(lift, [start, end], [0, 86]);
    const fade = useTransform(lift, [end - 0.16, end], [1, 0]);
    const crossfade = useTransform(lift, [0, 0.6], [1, 0]);

    return (
        <motion.div
            className="noren-panel relative min-w-0 flex-1"
            style={reduce ? { opacity: crossfade } : { rotateX, opacity: fade, originY: 0 }}
        >
            <div className="noren-drape cloth relative h-full overflow-hidden">
                <div className="absolute inset-y-0" style={{ left: `${-index * 100}%`, width: `${count * 100}%` }}>
                    {face(index)}
                </div>
            </div>
        </motion.div>
    );
};

// The cloth over the entrance. `lift` (0 to 1) raises it out of the way.
// `face` renders the full-width lettering; it is called once per strip and is
// decorative, so the real heading is rendered separately for assistive tech.
const Noren = ({ lift, face, count = 5, className = '' }) => (
    <div className={`flex flex-col ${className}`} aria-hidden="true">
        <div className="noren-pole relative z-10 mx-[-0.5rem]" />
        <div className="noren-sway -mt-1 min-h-0 flex-1">
            {/* Perspective has to sit on the strips' direct parent to reach them. */}
            <div className="noren flex h-full">
                {Array.from({ length: count }, (_, index) => (
                    <Panel key={index} index={index} count={count} lift={lift} face={face} />
                ))}
            </div>
        </div>
    </div>
);

export default Noren;
