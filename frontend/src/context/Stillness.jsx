import { createContext, useContext, useEffect, useState } from 'react';

const StillnessContext = createContext([false, () => {}]);

// [still, toggle]
export const useStillness = () => useContext(StillnessContext);

// Lets a visitor stop everything that moves on its own: the cloth, the lamps,
// the mist, the petals. Motion they drive by scrolling is already theirs.
// The choice is remembered, and the stylesheet does the stopping.
export const StillnessProvider = ({ children }) => {
    const [still, setStill] = useState(() => localStorage.getItem('portfolio_still') === '1');

    useEffect(() => {
        document.documentElement.toggleAttribute('data-still', still);
        localStorage.setItem('portfolio_still', still ? '1' : '0');
    }, [still]);

    return (
        <StillnessContext.Provider value={[still, () => setStill((value) => !value)]}>
            {children}
        </StillnessContext.Provider>
    );
};
