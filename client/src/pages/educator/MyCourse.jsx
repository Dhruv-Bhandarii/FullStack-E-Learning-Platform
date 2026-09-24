import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../../components/common/Loading'

const MyCourse = () => {
    const { backendUrl, getToken } = useContext(AppContext)
    const navigate = useNavigate()
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchCourses = async () => {
        const localCourses = JSON.parse(localStorage.getItem('localCourses') || '[]')
        const localEnrollments = JSON.parse(localStorage.getItem('localEnrollments') || '[]')

        // Enrich local courses with enrollment count
        const enrichedLocal = localCourses.map(c => {
            // Count how many students enrolled in this course
            const courseEnrollments = JSON.parse(localStorage.getItem(`courseEnrollments_${c._id}`) || '[]')
            const count = localEnrollments.includes(c._id) ? Math.max(1, courseEnrollments.length) : 0
            return {
                ...c,
                enrolledStudents: Array(count).fill(c._id)
            }
        })

        try {
            const token = await getToken()
            const { data } = await axios.get(`${backendUrl}/api/course/educator/list`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                setCourses([...data.courses, ...enrichedLocal])
            } else {
                setCourses(enrichedLocal)
            }
        } catch {
            setCourses(enrichedLocal)
        } finally {
            setLoading(false)
        }
    }

    const loadLocal = () => {
        const localCourses = JSON.parse(localStorage.getItem('localCourses') || '[]')
        const localEnrollments = JSON.parse(localStorage.getItem('localEnrollments') || '[]')
        setCourses(localCourses.map(c => ({
            ...c,
            enrolledStudents: localEnrollments.includes(c._id) ? [c._id] : (c.enrolledStudents || [])
        })))
    }

    const togglePublish = async (id) => {
        try {
            const token = await getToken()
            const { data } = await axios.patch(`${backendUrl}/api/course/educator/toggle/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                toast.success(data.message)
                fetchCourses()
            }
        } catch (err) {
            toast.error(err.message)
        }
    }

    useEffect(() => { fetchCourses() }, [])

    if (loading) return <Loading />

    return (
        <div>
            <h1 className='text-xl font-bold text-gray-800 mb-6'>My Courses</h1>
            {courses.length === 0 ? (
                <div className='text-center py-20 text-gray-400'>No courses yet. Add your first course.</div>
            ) : (
                <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
                    <table className='w-full text-sm'>
                        <thead className='bg-gray-50 text-gray-500 text-xs uppercase'>
                            <tr>
                                <th className='px-5 py-3 text-left'>Course</th>
                                <th className='px-5 py-3 text-left'>Students</th>
                                <th className='px-5 py-3 text-left'>Price</th>
                                <th className='px-5 py-3 text-left'>Status</th>
                                <th className='px-5 py-3 text-left'>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map(course => (
                                <tr key={course._id} className='border-t border-gray-100 hover:bg-gray-50'>
                                    <td className='px-5 py-3'>
                                        <div className='flex items-center gap-3'>
                                            <img src={course.courseThumbnail} alt={course.courseTitle} className='w-14 h-10 object-cover rounded' />
                                            <span className='font-medium text-gray-800 line-clamp-1 max-w-xs'>{course.courseTitle}</span>
                                        </div>
                                    </td>
                                    <td className='px-5 py-3 text-gray-600'>{course.enrolledStudents?.length || 0}</td>
                                    <td className='px-5 py-3 text-gray-600'>${course.coursePrice}</td>
                                    <td className='px-5 py-3'>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${course.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {course.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className='px-5 py-3'>
                                        <div className='flex items-center gap-2'>
                                            <button
                                                onClick={() => togglePublish(course._id)}
                                                className='text-xs border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition'
                                            >
                                                {course.isPublished ? 'Unpublish' : 'Publish'}
                                            </button>
                                            <button
                                                onClick={() => navigate(`/educator/edit-course/${course._id}`)}
                                                className='text-xs border border-blue-300 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition'
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default MyCourse
