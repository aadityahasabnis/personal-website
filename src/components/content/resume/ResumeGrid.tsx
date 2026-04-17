interface IResumeSkillGroup {
    label: string;
    items: readonly string[];
}

interface IResumeGridProps {
    groups: readonly IResumeSkillGroup[];
}

const ResumeGrid = ({ groups }: IResumeGridProps) => {
    return (
        <ul className='flex flex-col gap-1.5'>
            {groups.map((group) => (
                <li key={group.label} className='relative pl-4 text-small leading-relaxed text-foreground'>
                    <span aria-hidden='true' className='absolute left-0 top-[0.6rem] block size-1 rounded-full bg-foreground/70' />
                    <span className='font-semibold'>{group.label}:</span> {group.items.join(', ')}
                </li>
            ))}
        </ul>
    );
};

export default ResumeGrid;

export type { IResumeSkillGroup };
