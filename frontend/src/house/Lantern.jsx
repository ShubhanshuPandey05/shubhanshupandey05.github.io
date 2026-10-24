import { useId } from 'react';
import { signs } from '../content/site';

const BODY = 'M34 22C8 35 8 107 34 120H66C92 107 92 35 66 22Z';

// A paper lantern. Lit means the thing it stands for is running, and a lit
// lantern throws its light on the dusk around it.
export const Lantern = ({ numeral, lit = false, className = '', style }) => {
    const id = useId().replace(/[^a-zA-Z0-9]/g, '');
    return (
        <span className={`relative inline-block ${className}`} style={style}>
            <span
                aria-hidden="true"
                className={`absolute left-1/2 top-[48%] h-[230%] w-[380%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(250_204_128/0.62),rgb(242_184_102/0.26)_38%,rgb(242_184_102/0.08)_66%,transparent)] transition-opacity duration-[900ms] ease-out ${lit ? 'flame opacity-100' : 'opacity-0'}`}
            />
            <svg viewBox="0 0 100 150" className="relative block h-full w-full" aria-hidden="true">
                <defs>
                    <radialGradient id={`${id}-lit`} cx="50%" cy="46%" r="62%">
                        <stop offset="0" stopColor="#fffbea" />
                        <stop offset="0.55" stopColor="#fbe3a4" />
                        <stop offset="1" stopColor="#e9ad55" />
                    </radialGradient>
                    <radialGradient id={`${id}-dark`} cx="50%" cy="40%" r="70%">
                        <stop offset="0" stopColor="#8f8676" />
                        <stop offset="1" stopColor="#575045" />
                    </radialGradient>
                    <clipPath id={`${id}-body`}>
                        <path d={BODY} />
                    </clipPath>
                </defs>
                <path d="M50 0V13" stroke="#0b0908" strokeWidth="2" />
                <path d={BODY} fill={`url(#${id}-dark)`} />
                <path d={BODY} fill={`url(#${id}-lit)`} className="transition-opacity duration-[900ms] ease-out" opacity={lit ? 1 : 0} />
                <g clipPath={`url(#${id}-body)`}>
                    <path d="M0 22H100V33H0ZM0 109H100V120H0Z" fill={lit ? '#c23d24' : '#6e2718'} />
                    <g fill="none" stroke="#3c2814" strokeOpacity="0.3" strokeWidth="1">
                        {[42, 51, 60, 69, 78, 87, 96].map((y) => (
                            <path key={y} d={`M4 ${y}Q50 ${y + 3.5} 96 ${y}`} />
                        ))}
                    </g>
                </g>
                <rect x="33" y="12" width="34" height="10" rx="2" fill="#0b0908" />
                <rect x="33" y="120" width="34" height="9" rx="2" fill="#0b0908" />
                <path d="M50 129V146" stroke="#b0341d" strokeWidth="2.5" strokeLinecap="round" />
                <text x="50" y="84" textAnchor="middle" className="font-brush" fontSize="36" fill="#24160d" translate="no">
                    {numeral}
                </text>
            </svg>
        </span>
    );
};

// The board a shop hangs by its door. It turns from "preparing" to "open" once
// the lamps have been checked. `upright` is the tall board, written downward,
// that hangs in a row with the lanterns; it takes its height from `className`.
export const OpenSign = ({ open, upright = false, className = '' }) => {
    const board = `sign-face absolute inset-0 flex items-center justify-center font-brush text-washi shadow-[0_2px_0_var(--color-cedar-950)] ${
        upright ? 'tategaki text-[1.12rem] leading-none' : 'text-[1.3rem] tracking-[0.12em]'
    }`;
    return (
        <span className={`inline-block [perspective:600px] ${className}`} aria-hidden="true" translate="no">
            <span className={`sign-flip relative block ${upright ? 'h-full w-[2rem]' : 'h-[2.6rem] w-[6.4rem]'}`} data-open={open}>
                <span className={`${board} timber`}>{signs.preparing.kanji}</span>
                <span className={`${board} sign-face-back bg-shu-deep`}>{signs.open.kanji}</span>
            </span>
        </span>
    );
};
