import { useId } from 'react';
import { motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import * as art from './paths';
import Petals from './Petals';

const BOX = `0 0 ${art.W} ${art.H}`;
const across = (value) => `${(value / art.W) * 100}%`;
const down = (value) => `${(value / art.H) * 100}%`;

// Nearer layers grow faster as the visitor steps forward, which is all the
// depth a flat print needs.
const useDepth = (travel, amount) => useTransform(travel, [0, 1], [1, 1 + amount]);

// Mist and cloud bands. Each is its own small layer, so drifting one costs nothing.
const Bands = ({ bands, kind, pace }) =>
    bands.map(({ d, box }, index) => (
        <svg
            key={box[1]}
            viewBox={box.join(' ')}
            className={`valley-band valley-${kind} drift`}
            style={{
                left: across(box[0]),
                top: down(box[1]),
                width: across(box[2]),
                height: down(box[3]),
                animationDuration: `${pace + index * 19}s`,
                animationDirection: index % 2 ? 'alternate-reverse' : 'alternate',
            }}
        >
            <path d={d} />
        </svg>
    ));

// Where a piece of the low bough sits: measured in sheet units (`--u`) from the
// cloth's hem (`--hem`), and slid along the trunk's lean so it stays on the tree.
const hung = ([x, y, width, height], { hem, lean }) => ({
    left: `calc(var(--u) * ${x} + (var(--hem) - var(--u) * ${hem}) * ${lean})`,
    top: `calc(var(--hem) + var(--drop) + var(--u) * ${y})`,
    width: `calc(var(--u) * ${width})`,
    height: `calc(var(--u) * ${height})`,
});

// The valley outside the house, cut like a woodblock print: flat shapes, graded
// skies, banded mist. `light` picks the hour; `travel` (0 to 1) walks the viewer
// forward and `sink` (0 to 1) takes the sun down behind the ridge. `bough` adds
// a branch of the cherry below the entrance cloth, for layouts where the cloth
// covers the tree.
const Valley = ({ light = 'dusk', travel, sink, bough = false, className = '' }) => {
    const id = useId().replace(/[^a-zA-Z0-9]/g, '');
    const reduce = useReducedMotion();
    const still = useMotionValue(0);
    const walked = reduce || !travel ? still : travel;
    const sunk = sink ?? still;

    const farScale = useDepth(walked, 0.02);
    const midScale = useDepth(walked, 0.05);
    const nearScale = useDepth(walked, 0.09);
    const treeScale = useDepth(walked, 0.13);
    const sunY = useTransform(sunk, [0, 1], ['0%', '46%']);
    const dusk = useTransform(sunk, [0, 1], [0, 0.62]);

    return (
        <div className={`valley ${className}`} data-light={light} aria-hidden="true">
            <div className="valley-canvas">
                <svg viewBox={BOX} className="valley-stars absolute inset-0 h-full w-full">
                    {art.stars.map(([x, y, r]) => (
                        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#ece6d6" />
                    ))}
                </svg>

                <Bands bands={art.clouds} kind="cloud" pace={110} />

                <motion.div className="valley-sun" style={{ y: sunY }} />

                <motion.div className="valley-layer" style={{ scale: farScale }}>
                    <svg viewBox={BOX}>
                        <defs>
                            <linearGradient id={`${id}-far`} gradientUnits="userSpaceOnUse" x1="0" y1="594" x2="0" y2="760">
                                <stop offset="0" style={{ stopColor: 'var(--far)' }} />
                                <stop offset="1" style={{ stopColor: 'var(--far-foot)' }} />
                            </linearGradient>
                            <linearGradient id={`${id}-middle`} gradientUnits="userSpaceOnUse" x1="0" y1="664" x2="0" y2="830">
                                <stop offset="0" style={{ stopColor: 'var(--middle)' }} />
                                <stop offset="1" style={{ stopColor: 'var(--middle-foot)' }} />
                            </linearGradient>
                        </defs>
                        <path d={art.far} fill={`url(#${id}-far)`} />
                        <g fill="none" stroke="var(--crow)" strokeWidth="2.4" strokeLinecap="round">
                            {art.crows.map(([x, y, size]) => (
                                <path key={x} d={`M${x - 8 * size} ${y}q${4 * size} ${-6 * size} ${8 * size} 0q${4 * size} ${-6 * size} ${8 * size} 0`} />
                            ))}
                        </g>
                        <path d={art.middle} fill={`url(#${id}-middle)`} />
                    </svg>
                    <Bands bands={art.mist} kind="mist" pace={70} />
                </motion.div>

                <motion.div className="valley-layer" style={{ scale: midScale }}>
                    <svg viewBox={BOX}>
                        <defs>
                            <linearGradient id={`${id}-water`} gradientUnits="userSpaceOnUse" x1="150" y1="0" x2="1150" y2="0">
                                <stop offset="0" style={{ stopColor: 'var(--water-3)' }} />
                                <stop offset="0.55" style={{ stopColor: 'var(--water-2)' }} />
                                <stop offset="1" style={{ stopColor: 'var(--water-1)' }} />
                            </linearGradient>
                        </defs>
                        <path d={art.slopeRight} fill="var(--slope)" />
                        <path d={art.slopeLeft} fill="var(--slope)" />
                        <g stroke="var(--levee)" strokeWidth="1.5" strokeLinejoin="round">
                            {art.paddies.bands.map((band, index) => (
                                <path
                                    key={index}
                                    d={band.d}
                                    fill={band.tone === 'planted' ? 'var(--field)' : `url(#${id}-water)`}
                                    fillOpacity={band.tone === 'still' ? 0.7 : 1}
                                />
                            ))}
                            <path d={art.paddies.levees} fill="none" strokeWidth="1.3" />
                        </g>
                        <path d={art.river} fill={`url(#${id}-water)`} stroke="var(--levee)" strokeWidth="1.5" />
                        {art.village.map((house, index) => (
                            <g key={index}>
                                <path d={house.roof} fill="var(--roof)" />
                                <path d={house.wall} fill="var(--wall)" />
                                {house.windows.map(([x, y, width, height]) => (
                                    <rect key={y} x={x} y={y} width={width} height={height} fill="var(--window)" />
                                ))}
                            </g>
                        ))}
                    </svg>
                </motion.div>

                <motion.div className="valley-layer" style={{ scale: nearScale }}>
                    <svg viewBox={BOX}>
                        <path d={art.shrineGrove} fill="var(--cedar)" />
                        <path d={art.knoll} fill="var(--knoll)" />
                        <path d={art.gateSteps} fill="var(--stone)" />
                        <path d={art.gate.legs + art.gate.tie + art.gate.strut} fill="var(--gate)" />
                        <path d={art.gate.under} fill="var(--gate-shade)" />
                        <path d={art.gate.lintel} fill="var(--gate)" />
                        <path d={art.gate.cap} fill="none" stroke="var(--cedar)" strokeWidth="5" strokeLinecap="round" />
                        <path d={art.gate.feet} fill="var(--cedar)" />
                        <path d={art.bank} fill="var(--bank)" />
                    </svg>
                </motion.div>

                <motion.div className="valley-layer" style={{ scale: treeScale }}>
                    <svg viewBox={BOX}>
                        <path d={art.cherry.wood} fill="var(--wood)" />
                    </svg>
                    {art.cherry.curtains.map(({ strands, tones, box, swing, lag }, index) => (
                        <svg
                            key={index}
                            viewBox={box.join(' ')}
                            className="valley-curtain weep"
                            style={{
                                left: across(box[0]),
                                top: down(box[1]),
                                width: across(box[2]),
                                height: down(box[3]),
                                '--swing': `${swing}s`,
                                '--lag': `${lag}s`,
                            }}
                        >
                            <path d={strands} fill="none" stroke="var(--wood)" strokeWidth="1.4" />
                            <path d={tones[2]} fill="var(--bloom-3)" />
                            <path d={tones[1]} fill="var(--bloom-2)" />
                            <path d={tones[0]} fill="var(--bloom-1)" />
                        </svg>
                    ))}
                    {bough && (
                        <div className="valley-bough">
                            <svg viewBox={art.hemBough.box.join(' ')} className="valley-curtain" style={hung(art.hemBough.box, art.hemBough)}>
                                <path d={art.hemBough.wood} fill="var(--wood)" />
                            </svg>
                            <svg
                                viewBox={art.hemBough.box.join(' ')}
                                className="valley-curtain weep"
                                style={{ ...hung(art.hemBough.box, art.hemBough), '--swing': '7.8s', '--lag': '-2.6s' }}
                            >
                                <path d={art.hemBough.strands} fill="none" stroke="var(--wood)" strokeWidth="1.4" />
                                <path d={art.hemBough.tones[2]} fill="var(--bloom-3)" />
                                <path d={art.hemBough.tones[1]} fill="var(--bloom-2)" />
                                <path d={art.hemBough.tones[0]} fill="var(--bloom-1)" />
                            </svg>
                        </div>
                    )}
                </motion.div>
            </div>

            <Petals kind={light === 'night' ? 'fireflies' : 'petals'} />
            <motion.div className="valley-dusk" style={{ opacity: dusk }} />
            <div className="valley-tooth" />
        </div>
    );
};

export default Valley;
