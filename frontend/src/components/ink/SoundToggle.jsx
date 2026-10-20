import { useEffect, useState } from 'react';
import { subscribeSound, toggleSound } from './sound';

// Five little bars that dance while the garden is playing.
const SoundToggle = ({ className = '', label = true }) => {
    const [on, setOn] = useState(false);
    useEffect(() => subscribeSound(setOn), []);
    return (
        <button
            type="button"
            className={`ik-sound ${on ? 'is-on' : ''} ${className}`}
            onClick={toggleSound}
            aria-pressed={on}
            aria-label={on ? 'Turn ambient sound off' : 'Turn ambient sound on'}
            data-cursor={on ? 'hush' : 'listen'}
        >
            <span className="ik-sound__bars" aria-hidden="true">
                <i /><i /><i /><i /><i />
            </span>
            {label && <span className="ik-sound__label">{on ? 'sound on' : 'sound off'}</span>}
        </button>
    );
};

export default SoundToggle;
