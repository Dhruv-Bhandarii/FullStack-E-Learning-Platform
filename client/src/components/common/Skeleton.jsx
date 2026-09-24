// Reusable skeleton components for loading states

export const CourseCardSkeleton = () => (
    <div className='border border-gray-200 rounded-lg overflow-hidden animate-pulse'>
        <div className='w-full h-40 bg-gray-200' />
        <div className='p-3 space-y-2'>
            <div className='h-4 bg-gray-200 rounded w-3/4' />
            <div className='h-3 bg-gray-200 rounded w-1/2' />
            <div className='h-3 bg-gray-200 rounded w-1/3' />
            <div className='h-4 bg-gray-200 rounded w-1/4 mt-2' />
        </div>
    </div>
)

export const CourseListSkeleton = ({ count = 8 }) => (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
        {Array(count).fill(0).map((_, i) => <CourseCardSkeleton key={i} />)}
    </div>
)

export const TableRowSkeleton = ({ cols = 4 }) => (
    <tr className='border-t border-gray-100'>
        {Array(cols).fill(0).map((_, i) => (
            <td key={i} className='px-5 py-4'>
                <div className='h-4 bg-gray-200 rounded animate-pulse' />
            </td>
        ))}
    </tr>
)

export const DashboardStatsSkeleton = () => (
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8'>
        {Array(3).fill(0).map((_, i) => (
            <div key={i} className='bg-white rounded-xl p-5 border border-gray-200 flex items-center gap-4 animate-pulse'>
                <div className='w-12 h-12 bg-gray-200 rounded-lg' />
                <div className='space-y-2'>
                    <div className='h-6 w-16 bg-gray-200 rounded' />
                    <div className='h-3 w-24 bg-gray-200 rounded' />
                </div>
            </div>
        ))}
    </div>
)

export const CourseDetailSkeleton = () => (
    <div className='px-4 sm:px-10 md:px-14 lg:px-36 py-10 animate-pulse'>
        <div className='flex flex-col lg:flex-row gap-10'>
            <div className='flex-1 space-y-4'>
                <div className='h-8 bg-gray-200 rounded w-2/3' />
                <div className='h-4 bg-gray-200 rounded w-1/3' />
                <div className='h-4 bg-gray-200 rounded w-1/4' />
                <div className='h-48 bg-gray-200 rounded' />
                <div className='space-y-2'>
                    {Array(4).fill(0).map((_, i) => <div key={i} className='h-4 bg-gray-200 rounded' />)}
                </div>
            </div>
            <div className='lg:w-80'>
                <div className='border border-gray-200 rounded-xl overflow-hidden'>
                    <div className='h-44 bg-gray-200' />
                    <div className='p-5 space-y-3'>
                        <div className='h-8 bg-gray-200 rounded w-1/3' />
                        <div className='h-10 bg-gray-200 rounded' />
                    </div>
                </div>
            </div>
        </div>
    </div>
)
