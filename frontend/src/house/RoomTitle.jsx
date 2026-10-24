import BrushKanji from '../brush/BrushKanji';
import { useOpened } from '../hooks/usePage';

// Ink for each surface a title can sit on: the cedar wall, a lit paper pane,
// or the indigo cloth of a doorway.
const INK = {
    cedar: { reading: 'text-ash-dim', heading: '', body: 'text-ash' },
    paper: { reading: 'text-sumi-3', heading: '', body: 'text-sumi-2' },
    cloth: { reading: 'text-ai-200', heading: 'dyed', body: 'text-ai-200' },
};

// A room's name: the kanji brush-written in a column with its reading set
// beside it, the way furigana is, and the English heading alongside.
const RoomTitle = ({ room, heading, as: Heading = 'h2', surface = 'cedar', children }) => {
    const [ref, opened] = useOpened('-10% 0px');
    const ink = INK[surface];
    const kanjiHeight = [...room.kanji].length > 2 ? 'h-[8.5rem] md:h-[12.5rem]' : 'h-[6.5rem] md:h-[10rem]';

    return (
        <header ref={ref} className="flex items-start gap-5 md:gap-9">
            <div className="flex shrink-0 items-start gap-1 md:gap-2" lang="ja" translate="no">
                <BrushKanji text={room.kanji} writing={opened} className={`w-auto ${kanjiHeight}`} />
                <span aria-hidden="true" className={`tategaki pt-1 text-[0.7rem] font-medium ${ink.reading}`}>
                    {room.kana}
                </span>
            </div>
            <div className="min-w-0 pt-1 md:pt-3">
                <Heading className={`display text-[clamp(2.25rem,4.6vw,3.6rem)] ${ink.heading}`}>{heading ?? room.label}</Heading>
                {children && <div className={`measure mt-4 text-[1.0625rem] md:mt-5 ${ink.body}`}>{children}</div>}
            </div>
        </header>
    );
};

export default RoomTitle;
