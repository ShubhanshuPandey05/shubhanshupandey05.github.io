const Band = ({ items, reverse, variant }) => {
    const row = items.map((item, i) => (
        <span key={`${item}-${i}`} className="ed-band__item">
            {item}
            <span className="ed-band__sep" aria-hidden="true">✿</span>
        </span>
    ));
    return (
        <div className={`ed-band ed-band--${variant}`}>
            <div className={`ed-band__track ${reverse ? 'is-reverse' : ''}`}>
                {row}
                {row}
            </div>
        </div>
    );
};

const Marquee = ({ skills }) => {
    const names = skills.map((s) => s.name);
    const words = ['Available for backend roles', 'Based in Surat', 'APIs that stay up', 'Queues that drain', 'Systems that bloom'];
    return (
        <div className="ed-tape" aria-hidden="true">
            <Band items={names} variant="crimson" />
            <Band items={words} variant="ink" reverse />
        </div>
    );
};

export default Marquee;
