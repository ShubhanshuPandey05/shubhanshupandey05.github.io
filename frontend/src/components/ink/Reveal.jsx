import { useInView } from './useInView';

// Fades and lifts its children into place the first time they scroll into view.
const Reveal = ({ as: Tag = 'div', className = '', delay = 0, children, ...rest }) => {
    const [ref, seen] = useInView();
    return (
        <Tag ref={ref} className={`ik-reveal ${seen ? 'is-in' : ''} ${className}`} style={{ '--d': `${delay}ms` }} {...rest}>
            {children}
        </Tag>
    );
};

export default Reveal;
