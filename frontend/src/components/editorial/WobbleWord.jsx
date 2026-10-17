// Each letter hops and blushes crimson when the cursor passes over it.
const WobbleWord = ({ text, className = '' }) => {
    const pop = (e) => {
        const el = e.currentTarget;
        el.classList.remove('is-pop');
        // Force a reflow so the animation can restart.
        void el.offsetWidth;
        el.classList.add('is-pop');
    };
    return (
        <span className={`ed-wobble ${className}`} aria-label={text}>
            {text.split('').map((ch, i) => (
                <span
                    key={`${ch}-${i}`}
                    aria-hidden="true"
                    className="ed-wobble__ch"
                    style={{ '--i': i }}
                    onMouseEnter={pop}
                    onAnimationEnd={(e) => e.currentTarget.classList.remove('is-pop')}
                >
                    {ch}
                </span>
            ))}
        </span>
    );
};

export default WobbleWord;
