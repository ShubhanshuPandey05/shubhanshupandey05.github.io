import Scramble from '../Scramble';

// "02 / Selected work" with a short rule. The section's heading for screen readers.
const Label = ({ n, children, as = 'h2' }) => (
    <Scramble as={as} className="ax-label" text={`${n} / ${children}`} />
);

export default Label;
