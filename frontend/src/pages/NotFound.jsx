import { Link } from 'react-router-dom';
import { useTitle } from '../hooks/usePage';
import { pages } from '../content/site';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BrushKanji from '../brush/BrushKanji';

// Rusu: the word left on a door when nobody is in.
const NotFound = () => {
    useTitle(pages.notFound.label);

    return (
        <>
            <Navbar />
            <main id="main" className="flex min-h-svh items-center pb-24 pt-[calc(var(--beam)+4rem)]">
                <div className="shell flex flex-col items-start gap-10 md:flex-row md:items-center md:gap-16">
                    <div className="flex items-start gap-2" lang="ja">
                        <BrushKanji text={pages.notFound.kanji} className="h-[13rem] w-auto md:h-[19rem]" />
                        <span aria-hidden="true" className="tategaki pt-1 text-[0.75rem] font-medium text-ash-dim">
                            {pages.notFound.kana}
                        </span>
                    </div>
                    <div>
                        <h1 className="display text-[clamp(2.5rem,6vw,4.5rem)]">Nobody home.</h1>
                        <p className="measure mt-5 text-ash">This room is not part of the house. The address may be mistyped, or the page may have been taken down.</p>
                        <Link to="/" className="tag tag-shu mt-9">
                            Back to the entrance
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default NotFound;
