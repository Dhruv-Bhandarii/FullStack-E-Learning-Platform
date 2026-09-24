import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import CourseCard from '../../components/student/CourseCard'
import SearchBar from '../../components/student/SearchBar'
import Footer from '../../components/student/Footer'
import { CourseListSkeleton } from '../../components/common/Skeleton'

const CourseList = () => {
    const { input } = useParams()
    const { allCourses } = useContext(AppContext)
    const [filtered, setFiltered] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (allCourses.length) {
            setLoading(false)
            if (input) {
                setFiltered(allCourses.filter(c =>
                    c.courseTitle.toLowerCase().includes(input.toLowerCase())
                ))
            } else {
                setFiltered(allCourses)
            }
        }
    }, [allCourses, input])

    return (
        <div>
            <div className='bg-gradient-to-b from-cyan-100/70 to-white px-4 sm:px-10 md:px-14 lg:px-36 py-12 text-center'>
                <h1 className='text-2xl md:text-3xl font-bold text-gray-800 mb-4'>Course Catalogue</h1>
                <SearchBar defaultValue={input || ''} />
            </div>
            <div className='px-4 sm:px-10 md:px-14 lg:px-36 py-10'>
                <p className='text-gray-500 text-sm mb-6'>
                    {input ? `Results for "${input}" — ` : ''}{filtered.length} course{filtered.length !== 1 ? 's' : ''} found
                </p>
                {loading ? (
                    <CourseListSkeleton />
                ) : filtered.length > 0 ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
                        {filtered.map(course => <CourseCard key={course._id} course={course} />)}
                    </div>
                ) : (
                    <div className='text-center py-20 text-gray-400'>No courses found.</div>
                )}
            </div>
            <Footer />
        </div>
    )
}

export default CourseList
