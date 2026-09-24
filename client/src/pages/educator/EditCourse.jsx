import { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../../components/common/Loading'

const EditCourse = () => {
    const { courseId } = useParams()
    const navigate = useNavigate()
    const { backendUrl, getToken } = useContext(AppContext)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [courseData, setCourseData] = useState({
        courseTitle: '',
        courseDescription: '',
        coursePrice: '',
        discount: 0,
    })

    useEffect(() => {
        const fetchCourse = async () => {
            // Check local first
            if (courseId.startsWith('local_')) {
                const local = JSON.parse(localStorage.getItem('localCourses') || '[]')
                const found = local.find(c => c._id === courseId)
                if (found) {
                    setCourseData({
                        courseTitle: found.courseTitle,
                        courseDescription: found.courseDescription,
                        coursePrice: found.coursePrice,
                        discount: found.discount,
                    })
                }
                setLoading(false)
                return
            }
            try {
                const token = await getToken()
                const { data } = await axios.get(`${backendUrl}/api/course/${courseId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (data.success) {
                    setCourseData({
                        courseTitle: data.course.courseTitle,
                        courseDescription: data.course.courseDescription,
                        coursePrice: data.course.coursePrice,
                        discount: data.course.discount,
                    })
                }
            } catch {
                toast.error('Could not load course')
            } finally {
                setLoading(false)
            }
        }
        fetchCourse()
    }, [courseId])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        // Handle local course edit
        if (courseId.startsWith('local_')) {
            const local = JSON.parse(localStorage.getItem('localCourses') || '[]')
            const updated = local.map(c => c._id === courseId ? { ...c, ...courseData, coursePrice: Number(courseData.coursePrice), discount: Number(courseData.discount) } : c)
            localStorage.setItem('localCourses', JSON.stringify(updated))
            toast.success('Course updated')
            navigate('/educator/my-course')
            setSubmitting(false)
            return
        }

        try {
            const token = await getToken()
            const { data } = await axios.put(`${backendUrl}/api/course/educator/edit/${courseId}`,
                { ...courseData, coursePrice: Number(courseData.coursePrice), discount: Number(courseData.discount) },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (data.success) {
                toast.success('Course updated successfully')
                navigate('/educator/my-course')
            }
        } catch {
            toast.error('Could not update course')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <Loading />

    return (
        <div className='max-w-2xl'>
            <h1 className='text-xl font-bold text-gray-800 mb-6'>Edit Course</h1>
            <form onSubmit={handleSubmit} className='bg-white rounded-xl border border-gray-200 p-6 space-y-4'>
                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Course Title *</label>
                    <input type='text' required value={courseData.courseTitle}
                        onChange={e => setCourseData(p => ({ ...p, courseTitle: e.target.value }))}
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400' />
                </div>
                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Description *</label>
                    <textarea required rows={5} value={courseData.courseDescription}
                        onChange={e => setCourseData(p => ({ ...p, courseDescription: e.target.value }))}
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none' />
                </div>
                <div className='flex gap-4'>
                    <div className='flex-1'>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Price ($) *</label>
                        <input type='number' required min='0' step='0.01' value={courseData.coursePrice}
                            onChange={e => setCourseData(p => ({ ...p, coursePrice: e.target.value }))}
                            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400' />
                    </div>
                    <div className='flex-1'>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Discount (%)</label>
                        <input type='number' min='0' max='100' value={courseData.discount}
                            onChange={e => setCourseData(p => ({ ...p, discount: e.target.value }))}
                            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400' />
                    </div>
                </div>
                <div className='flex gap-3 pt-2'>
                    <button type='submit' disabled={submitting}
                        className='flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60 text-sm'>
                        {submitting ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type='button' onClick={() => navigate('/educator/my-course')}
                        className='flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition'>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}

export default EditCourse
