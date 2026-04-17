interface IResumeListProps {
    items: readonly string[];
}

const ResumeList = ({ items }: IResumeListProps) => {
    return (
        <ul className='flex flex-col gap-1.5'>
            {items.map((item) => (
                <li key={item} className='relative pl-4 text-small leading-relaxed text-foreground'>
                    <span aria-hidden='true' className='absolute left-0 top-[0.6rem] block size-1 rounded-full bg-foreground/70' />
                    {item}
                </li>
            ))}
        </ul>
    );
};

export default ResumeList;
