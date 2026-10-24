import { PiArrowUpRight, PiGithubLogo } from 'react-icons/pi';
import { useLive } from '../hooks/useLive';
import { useOpened } from '../hooks/usePage';

// What the check actually proves: a server answered at that address.
const STATUS = {
    live: 'Answering now',
    checking: 'Checking the live site…',
    silent: 'Not answering right now',
    none: 'Source only',
};

export const projectAnchor = (project) => `project-${project._id}`;

// A project as a standing paper lamp. The paper is the reading surface, and it
// lights only when the project's live URL has answered the visitor's browser.
// An unlit lamp is plainly dark, and its link to the live site steps back.
const Andon = ({ project, numeral, expanded = false, as: Heading = 'h3', className = '' }) => {
    const status = useLive(project.liveUrl);
    const [ref, opened] = useOpened('-16% 0px');
    const lit = status === 'live' && opened;

    return (
        <article id={projectAnchor(project)} ref={ref} className={`relative isolate scroll-mt-28 ${className}`} data-lit={lit}>
            <div className="andon-glow" />

            {/* The roof overhangs the frame, as a lamp's does. */}
            <div className="andon-roof" />

            <div className="andon-posts">
                <div className="andon-paper px-6 pb-8 pt-7 sm:px-9 sm:pb-10 sm:pt-8" data-lit={lit}>
                    <span className="andon-light" aria-hidden="true" />
                    <div className="flex items-start justify-between gap-4">
                        <span lang="ja" translate="no" aria-hidden="true" className="font-brush text-[2.75rem] leading-none text-(color:--numeral)">
                            {numeral}
                        </span>
                        <p className="pt-1 text-right text-sm font-bold text-(color:--ink-2)">{STATUS[status]}</p>
                    </div>

                    {project.imageUrl && (
                        <img
                            src={project.imageUrl}
                            alt={`${project.title}, as it looks when running`}
                            loading="lazy"
                            className="mt-6 aspect-[16/10] w-full object-cover shadow-[0_0_0_3px_var(--color-cedar-700)]"
                        />
                    )}

                    <Heading className="display mt-6 text-[clamp(1.6rem,2.6vw,2.15rem)] [overflow-wrap:anywhere]">{project.title}</Heading>
                    <p className="mt-1.5 text-sm font-medium text-(color:--ink-3)">{project.category}</p>
                    <p className="measure mt-5 text-(color:--ink-2) [overflow-wrap:anywhere]">{project.description}</p>

                    {project.longDescription && (
                        <details className="group mt-4" open={expanded}>
                            <summary className="link inline-block list-none text-[0.95rem] font-bold text-sumi [&::-webkit-details-marker]:hidden">
                                <span className="group-open:hidden">Read the longer story</span>
                                <span className="hidden group-open:inline">Close the longer story</span>
                            </summary>
                            <p className="measure mt-4 whitespace-pre-line text-(color:--ink-2) [overflow-wrap:anywhere]">{project.longDescription}</p>
                        </details>
                    )}

                    {project.techStack?.length > 0 && (
                        <p className="mt-6 text-[0.95rem] leading-relaxed text-(color:--ink-2)">
                            <span className="font-bold text-sumi">Made with </span>
                            {project.techStack.join(', ')}
                        </p>
                    )}

                    {(project.liveUrl || project.githubUrl) && (
                        <>
                            <hr className="bar mt-7" />
                            <div className="mt-6 flex flex-wrap gap-3">
                                {project.liveUrl && (
                                    <a href={project.liveUrl} target="_blank" rel="noreferrer" className={`tag ${status === 'live' ? 'tag-shu' : 'tag-wood'}`}>
                                        {status === 'silent' ? 'Try the live site' : 'Open it live'}
                                        <PiArrowUpRight aria-hidden="true" />
                                    </a>
                                )}
                                {project.githubUrl && (
                                    <a href={project.githubUrl} target="_blank" rel="noreferrer" className="tag">
                                        <PiGithubLogo aria-hidden="true" />
                                        Read the source
                                    </a>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="andon-rail" />
            <div className="andon-legs">
                <span />
                <span />
            </div>
        </article>
    );
};

// The same frame with nothing on the paper, shown while the list is loading.
export const AndonBlank = ({ className = '' }) => (
    <div className={`relative ${className}`} aria-hidden="true">
        <div className="andon-roof" />
        <div className="andon-posts">
            <div className="andon-paper h-[22rem] opacity-60" />
        </div>
        <div className="andon-rail" />
        <div className="andon-legs">
            <span />
            <span />
        </div>
    </div>
);

export default Andon;
