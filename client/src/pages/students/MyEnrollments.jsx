import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Line } from 'rc-progress'
import Footer from '../../components/student/Footer'
import Loading from '../../components/common/Loading'

const MyEnrollments = () => {
    const { enrolledCourses, fetchEnrolledCourses, backendUrl, getToken, calculateNoOfLectures } = useContext(AppContext)
    const [progressData, setProgressData] = useState({})
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const load = async () => {
            await fetchEnrolledCourses()
            setLoading(false)
        }
        load()
    }, [])

    // Merge backend enrolled courses with locally enrolled ones
    const localEnrolledIds = JSON.parse(localStorage.getItem('localEnrollments') || '[]')
    const localCourses = JSON.parse(localStorage.getItem('localCourses') || '[]')
    const localEnrolled = localCourses.filter(c => localEnrolledIds.includes(c._id))
    const allEnrolled = [...enrolledCourses, ...localEnrolled.filter(lc => !enrolledCourses.find(ec => ec._id === lc._id))]

    useEffect(() => {
        const fetchProgress = async () => {
            if (!allEnrolled.length) return
            const map = {}
            for (const course of allEnrolled) {
                if (course._id.startsWith('local_')) {
                    const local = JSON.parse(localStorage.getItem(`progress_${course._id}`) || '[]')
                    const total = calculateNoOfLectures(course)
                    map[course._id] = total > 0 ? Math.round((local.length / total) * 100) : 0
                } else {
                    try {
                        const token = await getToken()
                        const res = await axios.get(`${backendUrl}/api/course/progress/${course._id}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        })
                        if (res.data.success) {
                            const total = calculateNoOfLectures(course)
                            const completed = res.data.completedLectures.length
                            map[course._id] = total > 0 ? Math.round((completed / total) * 100) : 0
                        }
                    } catch { }
                }
            }
            setProgressData(map)
        }
        fetchProgress()
    }, [enrolledCourses])

    if (loading) return <Loading />

    return (
        <div>
            <div className='px-4 sm:px-10 md:px-14 lg:px-36 py-10 min-h-[60vh]'>
                <h1 className='text-2xl font-bold text-gray-800 mb-8'>My Enrollments</h1>
                {allEnrolled.length === 0 ? (
                    <div className='text-center py-20 text-gray-400'>
                        <p>You haven't enrolled in any courses yet.</p>
                    </div>
                ) : (
                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm text-left'>
                            <thead className='bg-gray-50 text-gray-600 uppercase text-xs'>
                                <tr>
                                    <th className='px-4 py-3'>Course</th>
                                    <th className='px-4 py-3'>Progress</th>
                                    <th className='px-4 py-3'>Status</th>
                                    <th className='px-4 py-3'></th>
                                </tr>
                            </thead>
                            <tbody>
                                {allEnrolled.map(course => {
                                    const progress = progressData[course._id] || 0
                                    return (
                                        <tr key={course._id} className='border-b border-gray-100 hover:bg-gray-50'>
                                            <td className='px-4 py-4'>
                                                <div className='flex items-center gap-3'>
                                                    <img src={course.courseThumbnail} alt={course.courseTitle} className='w-16 h-12 object-cover rounded' />
                                                    <span className='font-medium text-gray-800 line-clamp-2 max-w-xs'>{course.courseTitle}</span>
                                                </div>
                                            </td>
                                            <td className='px-4 py-4 min-w-[160px]'>
                                                <Line percent={progress} strokeWidth={3} strokeColor='#2563eb' trailColor='#e5e7eb' />
                                                <span className='text-xs text-gray-500 mt-1 block'>{progress}% complete</span>
                                            </td>
                                            <td className='px-4 py-4'>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${progress === 100 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {progress === 100 ? 'Completed' : 'In Progress'}
                                                </span>
                                            </td>
                                            <td className='px-4 py-4'>
                                                <button
                                                    onClick={() => navigate(`/player/${course._id}`)}
                                                    className='bg-blue-600 text-white px-4 py-2 rounded-lg text-xs hover:bg-blue-700 transition'
                                                >
                                                    {progress === 0 ? 'Start' : 'Continue'}
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    )
}

export default MyEnrollments
