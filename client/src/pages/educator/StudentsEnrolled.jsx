import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { Line } from 'rc-progress'

const StudentsEnrolled = () => {
    const { backendUrl, getToken } = useContext(AppContext)
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchStudents = async () => {
            let combined = []

            // 1. Try backend
            try {
                const token = await getToken()
                const { data } = await axios.get(`${backendUrl}/api/course/educator/students`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (data.success) combined = [...data.enrolledStudents]
            } catch (err) {
                setError(err.response?.data?.message || err.message)
            }

            // 2. Merge local course enrollments
            const localCourses = JSON.parse(localStorage.getItem('localCourses') || '[]')
            const localEnrollments = JSON.parse(localStorage.getItem('localEnrollments') || '[]')
            const allStudentInfo = JSON.parse(localStorage.getItem('allStudentInfo') || '{}')

            for (const course of localCourses) {
                if (!localEnrollments.includes(course._id)) continue

                const localProgress = JSON.parse(localStorage.getItem(`progress_${course._id}`) || '[]')
                const total = course.courseContent?.reduce((s, ch) => s + ch.chapterContent.length, 0) || 0
                const progress = total > 0 ? Math.round((localProgress.length / total) * 100) : 0

                // Find the student who enrolled — match by email from localEnrollmentDetails
                const enrollmentDetails = JSON.parse(localStorage.getItem(`enrollment_${course._id}`) || '{}')
                const allStudentInfo = JSON.parse(localStorage.getItem('allStudentInfo') || '{}')
                const allStudentValues = Object.values(allStudentInfo)

                // Find student whose email matches enrollment, or use first non-instructor student
                let matchedStudent = null
                if (enrollmentDetails.email) {
                    matchedStudent = allStudentValues.find(s => s.email === enrollmentDetails.email)
                }
                if (!matchedStudent && allStudentValues.length > 0) {
                    matchedStudent = allStudentValues[allStudentValues.length - 1]
                }

                const studentEmail = matchedStudent?.email || enrollmentDetails.email || ''
                const studentName = matchedStudent?.name || studentEmail.split('@')[0] || 'Student'
                const studentImage = matchedStudent?.imageUrl || null

                combined.push({
                    student: { name: studentName, email: studentEmail, imageUrl: studentImage },
                    courseTitle: course.courseTitle,
                    purchaseDate: enrollmentDetails.date || new Date().toISOString(),
                    progress,
                })
            }

            setStudents(combined)
            setLoading(false)
        }

        fetchStudents()
    }, [])

    if (loading) return (
        <div className='flex items-center justify-center py-20'>
            <div className='w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
        </div>
    )

    // Group by course
    const byCourse = students.reduce((acc, item) => {
        const key = item.courseTitle || 'Unknown Course'
        if (!acc[key]) acc[key] = []
        acc[key].push(item)
        return acc
    }, {})

    return (
        <div>
            <h1 className='text-xl font-bold text-gray-800 mb-2'>Student Progress</h1>
            <p className='text-sm text-gray-500 mb-6'>Progress of students enrolled in your courses</p>

            {Object.keys(byCourse).length === 0 ? (
                <div className='text-center py-20 text-gray-400'>No students enrolled in your courses yet.</div>
            ) : (
                <div className='space-y-8'>
                    {Object.entries(byCourse).map(([courseTitle, enrollments]) => {
                        const avgProgress = Math.round(
                            enrollments.reduce((s, e) => s + (e.progress || 0), 0) / enrollments.length
                        )
                        return (
                            <div key={courseTitle} className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
                                <div className='px-5 py-4 bg-blue-50 border-b border-blue-100 flex items-center justify-between'>
                                    <div>
                                        <h2 className='font-semibold text-gray-800'>{courseTitle}</h2>
                                        <p className='text-xs text-gray-500 mt-0.5'>{enrollments.length} student{enrollments.length !== 1 ? 's' : ''} enrolled</p>
                                    </div>
                                    <span className='text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium'>
                                        Avg: {avgProgress}% complete
                                    </span>
                                </div>
                                <table className='w-full text-sm'>
                                    <thead className='bg-gray-50 text-gray-500 text-xs uppercase'>
                                        <tr>
                                            <th className='px-5 py-3 text-left'>Student</th>
                                            <th className='px-5 py-3 text-left'>Progress</th>
                                            <th className='px-5 py-3 text-left'>Status</th>
                                            <th className='px-5 py-3 text-left'>Enrolled</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {enrollments.map((item, i) => {
                                            const progress = item.progress ?? 0
                                            return (
                                                <tr key={i} className='border-t border-gray-100 hover:bg-gray-50'>
                                                    <td className='px-5 py-3'>
                                                        <div className='flex items-center gap-3'>
                                                            {item.student?.imageUrl
                                                                ? <img src={item.student.imageUrl} className='w-8 h-8 rounded-full object-cover' />
                                                                : <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs'>
                                                                    {item.student?.name?.[0] || 'S'}
                                                                </div>
                                                            }
                                                            <div>
                                                                <p className='font-medium text-gray-800'>{item.student?.name || 'Student'}</p>
                                                                <p className='text-xs text-gray-400'>{item.student?.email || ''}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className='px-5 py-3 min-w-[180px]'>
                                                        <Line percent={progress} strokeWidth={3} strokeColor={progress === 100 ? '#16a34a' : '#2563eb'} trailColor='#e5e7eb' />
                                                        <span className='text-xs text-gray-500 mt-1 block'>{progress}%</span>
                                                    </td>
                                                    <td className='px-5 py-3'>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            progress === 100 ? 'bg-green-100 text-green-700' :
                                                            progress > 0 ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-500'
                                                        }`}>
                                                            {progress === 100 ? '✓ Completed' : progress > 0 ? 'In Progress' : 'Not Started'}
                                                        </span>
                                                    </td>
                                                    <td className='px-5 py-3 text-gray-400 text-xs'>
                                                        {item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : '—'}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default StudentsEnrolled
