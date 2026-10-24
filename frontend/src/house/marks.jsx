import { useId } from 'react';
import { house, owner } from '../content/site';
import { useOpened } from '../hooks/usePage';

// The house crest: initials in a ring, the way a family mark is drawn.
export const Crest = ({ className = '' }) => (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
        <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <text x="24" y="30.5" textAnchor="middle" className="font-display" fontWeight="800" fontSize="18.5" fill="currentColor">
            {owner.initials}
        </text>
    </svg>
);

// A vermilion seal, pressed slightly off square.
export const Seal = ({ text = house.kanji, className = '' }) => (
    <span
        aria-hidden="true"
        className={`tategaki inline-block -rotate-2 bg-shu-deep px-[0.3em] py-[0.35em] font-brush leading-none text-washi shadow-[inset_0_0_0_1.5px_var(--color-shu-deep),inset_0_0_0_2.5px_rgb(237_231_217/0.75)] ${className}`}
    >
        {text}
    </span>
);

// A screen sliding open on its track: the one reveal every room shares.
// The watched element is the unclipped wrapper. A closed screen is clipped to
// nothing, and a browser will not report a fully clipped element as in view.
export const Shoji = ({ from = 'left', className = '', children }) => {
    const [ref, opened] = useOpened();
    return (
        <div ref={ref} className={className}>
            <div className="shoji" data-from={from} data-open={opened}>
                {children}
            </div>
        </div>
    );
};

// A wooden board on two cords. The house uses it wherever a page has nothing
// to show yet: an empty journal, a missing room.
export const HangingSign = ({ kanji, children, className = '' }) => (
    <div className={`pendulum inline-flex flex-col items-center [--swing:7s] ${className}`}>
        <svg viewBox="0 0 120 44" className="h-11 w-[7.5rem] text-ash-dim" aria-hidden="true">
            <path d="M60 2L8 44M60 2L112 44" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="60" cy="3" r="3" fill="currentColor" />
        </svg>
        <div className="timber flex items-center gap-5 px-7 py-5 shadow-[0_3px_0_var(--color-cedar-950),0_24px_40px_-18px_rgb(0_0_0/0.9)]">
            <span lang="ja" className="font-brush text-[2.6rem] leading-none text-washi">
                {kanji}
            </span>
            <span className="max-w-[16rem] text-left text-[0.95rem] leading-snug text-ash">{children}</span>
        </div>
    </div>
);

// Asanoha, the hemp-leaf lattice of kumiko joinery, set as a transom along the
// top of a pane. Every triangle of the lattice is split from its centre.
export const Transom = ({ className = '' }) => {
    const id = useId().replace(/[^a-zA-Z0-9]/g, '');
    const s = 26;
    const h = s * Math.sqrt(3);
    const c = s / 2;
    const lattice = [
        `M0 0H${s}M0 ${h / 2}H${s}M0 ${h}H${s}`,
        `M0 0L${s} ${h}M${s} 0L0 ${h}`,
        `M0 0L${c} ${h / 6}L${s} 0M0 ${h}L${c} ${(5 * h) / 6}L${s} ${h}M${c} ${h / 6}V${(5 * h) / 6}`,
        `M0 0V${h / 3}L${c} ${h / 2}L0 ${(2 * h) / 3}V${h}`,
        `M${s} 0V${h / 3}L${c} ${h / 2}L${s} ${(2 * h) / 3}V${h}`,
    ].join('');
    return (
        <div className={`border-b-[3px] border-cedar-700 bg-washi-dim ${className}`} aria-hidden="true">
            <svg className="block w-full" height={h}>
                <defs>
                    <pattern id={id} width={s} height={h} patternUnits="userSpaceOnUse">
                        <path d={lattice} fill="none" stroke="var(--color-cedar-700)" strokeWidth="1.15" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#${id})`} />
            </svg>
        </div>
    );
};

// A doorway noren: a band of indigo cloth on a pole, with tails that move in
// the draught. Each room is entered under one, and it carries the room's name.
export const Doorway = ({ children, className = '' }) => (
    <div className={className}>
        <div className="noren-pole relative z-10 mx-[-0.5rem]" />
        <div className="cloth doorway-cloth -mt-1 px-6 pb-9 pt-10 sm:px-10 md:px-14 md:pb-11 md:pt-14">{children}</div>
        <div className="doorway-tails" aria-hidden="true">
            {Array.from({ length: 7 }, (_, index) => (
                <span key={index} className="cloth" />
            ))}
        </div>
    </div>
);
