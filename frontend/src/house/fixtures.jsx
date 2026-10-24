import { useId } from 'react';
import BrushKanji from '../brush/BrushKanji';
import { idiom, post } from '../content/site';
import { useOpened } from '../hooks/usePage';
import { Seal } from './marks';

// The round red postbox that still stands at the edge of most villages.
export const Postbox = ({ className = '' }) => {
    const id = useId().replace(/[^a-zA-Z0-9]/g, '');
    return (
        <svg viewBox="0 0 200 372" className={className} aria-hidden="true">
            <defs>
                <linearGradient id={`${id}-drum`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#8f2a17" />
                    <stop offset="0.2" stopColor="#e2573b" />
                    <stop offset="0.46" stopColor="#d5462b" />
                    <stop offset="1" stopColor="#8a2714" />
                </linearGradient>
                <linearGradient id={`${id}-cap`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#7d2412" />
                    <stop offset="0.24" stopColor="#d24a30" />
                    <stop offset="1" stopColor="#7a2211" />
                </linearGradient>
            </defs>
            <ellipse cx="100" cy="358" rx="88" ry="10" fill="#000" opacity="0.5" />
            <rect x="46" y="322" width="108" height="34" rx="3" fill="#5f1c0e" />
            <rect x="42" y="100" width="116" height="228" fill={`url(#${id}-drum)`} />
            <path d="M30 106Q30 46 100 40Q170 46 170 106Z" fill={`url(#${id}-cap)`} />
            <rect x="26" y="100" width="148" height="12" rx="6" fill="#9c2e1a" />
            <rect x="92" y="28" width="16" height="14" rx="3" fill="#7a2211" />
            <path d="M58 150h84l6 16H52Z" fill="#7a2211" />
            <rect x="64" y="166" width="72" height="11" rx="2" fill="#160b08" />
            <text x="100" y="140" textAnchor="middle" className="font-sans" fontWeight="700" fontSize="24" fill="#ede7d9">
                {post.mark}
            </text>
            <rect x="72" y="198" width="56" height="64" rx="2" fill="#ede7d9" opacity="0.92" />
            <text x="100" y="239" textAnchor="middle" className="font-brush" fontSize="22" fill="#1f1b18" lang="ja">
                {post.kanji}
            </text>
            <rect x="66" y="276" width="68" height="40" rx="2" fill="none" stroke="#7a2211" strokeWidth="2.5" />
            <circle cx="124" cy="296" r="3" fill="#160b08" />
        </svg>
    );
};

// A hanging scroll with the house's motto, let down from its roller.
export const Kakejiku = ({ className = '' }) => {
    const [ref, opened] = useOpened('-10% 0px');
    return (
        <figure ref={ref} className={`mx-auto w-[11.5rem] ${className}`}>
            <svg viewBox="0 0 184 44" className="block h-11 w-full text-ash-dim" aria-hidden="true">
                <path d="M92 3L14 44M92 3L170 44" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="92" cy="4" r="3.5" fill="currentColor" />
            </svg>
            <div className="unroll" data-open={opened}>
                <div className="timber mx-[-0.5rem] h-2" />
                <div className="cloth h-9" />
                <div className="relative flex min-h-[23rem] justify-center bg-washi bg-[image:var(--fibers),var(--tooth)] px-4 pb-16 pt-7 text-sumi shadow-[inset_0_0_50px_rgb(120_86_40/0.18)]" lang="ja" translate="no">
                    {/* Written after the scroll has come down, in true stroke order. */}
                    <BrushKanji text={idiom.kanji} writing={opened} delay={1} seconds={4.4} className="h-[18rem] w-auto" />
                    <Seal className="absolute bottom-5 left-5 text-[0.95rem]" />
                </div>
                <div className="cloth h-14" />
                <div className="timber relative mx-[-0.9rem] h-3.5 rounded-full shadow-[0_3px_0_var(--color-cedar-950),0_14px_18px_-8px_rgb(0_0_0/0.9)]" />
            </div>
            <figcaption className="timber mx-[-1.5rem] mt-7 px-4 py-3.5 text-[0.92rem] leading-relaxed text-ash shadow-[0_2px_0_var(--color-cedar-950)]">
                <span className="font-bold text-washi">{idiom.literal}.</span> {idiom.meaning}
            </figcaption>
        </figure>
    );
};

// The veranda floor, seen from the house: grained cedar boards running out
// toward the valley, ending at the sill of the room behind.
export const EngawaFloor = ({ className = '' }) => (
    <div aria-hidden="true">
        <div className={`engawa ${className}`}>
            <div className="engawa-boards" />
        </div>
        <div className="sill" />
    </div>
);
