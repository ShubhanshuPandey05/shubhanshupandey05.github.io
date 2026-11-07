// Fonts must be ready before glyph shapes are measured; this is done once per page load.

import { MONO, POSTER, glyphShapes, makeMatcher } from './glyphs';

// Characters allowed on the outline of the big letters.
const CONTOUR = ".,:;'`\"_-~^/\\|()[]{}<>=+*!ilIjJLtrcvxyYTVAo";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

let ready = null;

export const prepareGlyphs = () => {
    if (!ready) {
        ready = (async () => {
            await Promise.race([
                Promise.all([document.fonts.load(`400 12px ${MONO}`), document.fonts.load(`400 40px ${POSTER}`)]),
                wait(2500),
            ]).catch(() => {});
            const shapes = glyphShapes();
            return {
                match: makeMatcher(shapes, { gamma: 1.8 }),
                edgeMatch: makeMatcher(shapes, { gamma: 1.5, only: CONTOUR }),
            };
        })();
    }
    return ready;
};

// Glyph colours on the page itself (outside the dark screen), per theme.
export const pagePalette = () =>
    document.documentElement.classList.contains('light')
        ? { ink: '#131313', heat: ['#3d55c2', '#4b52bd', '#5d4fb4', '#734aa8', '#88459a', '#9c418a', '#ad3d79', '#b8365f'] }
        : { ink: '#ecebe6', heat: ['#8ea2ff', '#9ba3f6', '#ada3ec', '#c1a2df', '#d39ecf', '#e29cbd', '#ec9cab', '#f2a29e'] };
