const InfiniteTableCardLoading = ({ isCompacted }: { isCompacted?: boolean }) => (
    <div className="flex flex-col bg-white p-5 border gap-5 w-full rounded-md">
        <div className='flex justify-between gap-3'>
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 p-1.5 border animate-pulse" />
                <div className="flex flex-col gap-3">
                    <div className="w-40 h-4 animate-pulse" />
                    <div className="w-24 h-3 animate-pulse" />
                </div>
            </div>
            <div className="w-16 h-3 animate-pulse" />
        </div>

        <div className={`grid ${isCompacted ? 'grid-cols-1' : 'grid-cols-4'} gap-3 m-1`}>
            {Array.from({ length: isCompacted ? 3 : 4 }).map((_, index) => <div key={index} className={`h-5 animate-pulse rounded ${isCompacted ? 'w-full' : 'w-48'}`} />)}
        </div>
        {isCompacted === false ? <div className="w-1/2 h-5 animate-pulse" /> : null}

        <hr />

        <div className='flex justify-between'>
            <div className="w-2/12 h-5 animate-pulse" />
            <div className="w-16 h-5 animate-pulse" />
        </div>
    </div>
);

export default InfiniteTableCardLoading;
