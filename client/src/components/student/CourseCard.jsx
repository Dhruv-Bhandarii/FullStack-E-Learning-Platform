import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import Rating from './Rating'

const CourseCard = ({ course }) => {
    const { calculateRating, calculateNoOfLectures, calculateCourseDuration } = useContext(AppContext)
    const discountedPrice = (course.coursePrice - (course.coursePrice * course.discount / 100)).toFixed(2)

    return (
        <Link to={`/course/${course._id}`} className='border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow'>
            <img src={course.courseThumbnail} alt={course.courseTitle} className='w-full h-40 object-cover' />
            <div className='p-3'>
                <h3 className='font-semibold text-gray-800 text-sm line-clamp-2'>{course.courseTitle}</h3>
                <p className='text-xs text-gray-500 mt-1'>By Educator</p>
                <div className='flex items-center gap-2 mt-1'>
                    <span className='text-xs font-medium text-gray-700'>{calculateRating(course)}</span>
                    <Rating rating={calculateRating(course)} />
                    <span className='text-xs text-gray-400'>({course.courseRatings?.length || 0})</span>
                </div>
                <p className='text-xs text-gray-500 mt-1'>
                    {calculateNoOfLectures(course)} lectures · {calculateCourseDuration(course)}
                </p>
                <div className='flex items-center gap-2 mt-2'>
                    <span className='font-bold text-gray-900'>${discountedPrice}</span>
                    {course.discount > 0 && (
                        <span className='text-xs text-gray-400 line-through'>${course.coursePrice}</span>
                    )}
                </div>
            </div>
        </Link>
    )
}

export default CourseCard
