import { categoryMarks, grades } from '../content/site';

// The order tiers stack in, top to bottom.
const TIERS = ['Backend', 'Frontend', 'Database', 'DevOps', 'Tools', 'Other'];

const gradeOf = (proficiency) => grades.find((grade) => proficiency >= grade.min) ?? grades[grades.length - 1];

const Drawer = ({ skill }) => {
    const grade = gradeOf(skill.proficiency ?? 0);
    return (
        <li className="drawer">
            <span aria-hidden="true" className="absolute right-2.5 top-1.5 text-[0.95rem] leading-none text-lamp">
                {grade.mark}
            </span>
            <span className="drawer-label">
                {skill.name}
                <span className="visually-hidden">, {grade.label}</span>
            </span>
            <span aria-hidden="true" className="drawer-pull" />
        </li>
    );
};

// The tool chest. One tier per CMS category, one drawer per skill; tiers with
// few tools get wide drawers, as a real chest does.
const Tansu = ({ skills }) => {
    const tiers = TIERS.map((category) => ({
        category,
        mark: categoryMarks[category],
        tools: skills.filter((skill) => (TIERS.includes(skill.category) ? skill.category : 'Other') === category),
    })).filter((tier) => tier.tools.length > 0);

    return (
        <div>
            <div className="andon-roof !mx-[-0.6rem] !h-5" />
            <div className="border-x-[0.6rem] border-b-[0.6rem] border-cedar-950 bg-cedar-950">
                {tiers.map((tier, index) => (
                    <section
                        key={tier.category}
                        aria-label={`${tier.category} tools`}
                        className={`grid gap-[3px] md:grid-cols-[10rem_minmax(0,1fr)] ${index > 0 ? 'mt-[0.6rem]' : ''}`}
                    >
                        <div className="timber flex items-center gap-4 px-5 py-4 md:flex-col md:items-start md:justify-center md:gap-2 md:py-5">
                            <span lang="ja" aria-hidden="true" className="font-brush text-[2.6rem] leading-none text-washi">
                                {tier.mark.kanji}
                            </span>
                            <h3 className="text-[1.05rem] font-bold leading-tight">{tier.category}</h3>
                        </div>
                        {/* Drawers stretch to fill each row, so a short last row never leaves a hole. */}
                        <ul className="flex flex-wrap gap-[3px]">
                            {tier.tools.map((skill) => (
                                <Drawer key={skill._id ?? skill.name} skill={skill} />
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
            <div className="flex justify-between px-6">
                <span className="h-4 w-10 bg-cedar-950" />
                <span className="h-4 w-10 bg-cedar-950" />
            </div>

            <p className="mt-8 flex flex-wrap gap-x-7 gap-y-2 text-[0.95rem] text-ash">
                {grades.map((grade) => (
                    <span key={grade.label} className="inline-flex items-baseline gap-2">
                        <span aria-hidden="true" className="text-lamp">
                            {grade.mark}
                        </span>
                        {grade.label}
                    </span>
                ))}
            </p>
        </div>
    );
};

export default Tansu;
