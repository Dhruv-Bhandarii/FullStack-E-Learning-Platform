import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import CourseCard from './CourseCard'

const CourseSection = () => {
    const { allCourses } = useContext(AppContext)

    return (
        <div className='px-4 sm:px-10 md:px-14 lg:px-36 py-16'>
            <div className='flex items-center justify-between mb-8'>
                <div>
                    <h2 className='text-2xl md:text-3xl font-bold text-gray-800'>Learn from the Best</h2>
                    <p className='text-gray-500 text-sm mt-1'>Discover our top-rated courses</p>
                </div>
                <Link to='/course-list' className='text-blue-600 text-sm font-medium hover:underline'>
                    View All →
                </Link>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
                {allCourses.slice(0, 8).map(course => (
                    <CourseCard key={course._id} course={course} />
                ))}
            </div>
        </div>
    )
}

export default CourseSection
