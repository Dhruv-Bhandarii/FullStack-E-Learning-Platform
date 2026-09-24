import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { UserButton, useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { assets } from '../../assets/assets'

const AdminDashboard = () => {
    const { backendUrl, getToken } = useContext(AppContext)
    const { user } = useUser()
    const [stats, setStats] = useState(null)
    const [instructors, setInstructors] = useState([])
    const [students, setStudents] = useState([])
    const [tab, setTab] = useState('overview')
    const [expandedInstructor, setExpandedInstructor] = useState(null)
    const [expandedStudent, setExpandedStudent] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchAll = async () => {
            const localCourses = JSON.parse(localStorage.getItem('localCourses') || '[]')
            const localEnrollments = JSON.parse(localStorage.getItem('localEnrollments') || '[]')
            const allStudentInfo = JSON.parse(localStorage.getItem('allStudentInfo') || '{}')

            try {
                const token = await getToken()
                const headers = { Authorization: `Bearer ${token}` }
                const [s, i, st] = await Promise.all([
                    axios.get(`${backendUrl}/api/admin/stats`, { headers }),
                    axios.get(`${backendUrl}/api/admin/instructors`, { headers }),
                    axios.get(`${backendUrl}/api/admin/students`, { headers }),
                ])

                if (s.data.success) {
                    setStats({ ...s.data, totalCourses: s.data.totalCourses + localCourses.length })
                }

                if (i.data.success) {
                    const enriched = i.data.instructors.map(item => ({
                        ...item,
                        totalCourses: item.totalCourses + localCourses.length,
                        totalStudents: item.totalStudents + localEnrollments.length,
                        localCourses: localCourses, // attach local courses to instructor
                    }))
                    setInstructors(enriched)
                }

                if (st.data.success) {
                    const enrichedStudents = st.data.students.map(item => {
                        const studentId = Object.keys(allStudentInfo).find(
                            id => allStudentInfo[id].email === item.student.email
                        )
                        const localCount = studentId ? localEnrollments.length : 0
                        return {
                            ...item,
                            enrolledCourses: item.enrolledCourses + localCount,
                            localEnrolledCourses: localCount > 0 ? localCourses.filter(c => localEnrollments.includes(c._id)) : [],
                        }
                    })
                    setStudents(enrichedStudents)
                }
            } catch (err) {
                setError(err.response?.data?.message || err.message)
                setStats({ totalStudents: Object.keys(allStudentInfo).length, totalInstructors: 0, totalCourses: localCourses.length, totalRevenue: 0 })
            }
        }
        fetchAll()
    }, [])

    if (!stats) return (
        <div className='flex items-center justify-center min-h-screen'>
            {error
                ? <div className='text-center'><p className='text-red-500'>{error}</p></div>
                : <div className='w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
            }
        </div>
    )

    const statCards = [
        { label: 'Total Students', value: stats.totalStudents, icon: '🎓', color: 'bg-blue-50' },
        { label: 'Total Instructors', value: stats.totalInstructors, icon: '📚', color: 'bg-green-50' },
        { label: 'Total Courses', value: stats.totalCourses, icon: '📖', color: 'bg-yellow-50' },
        { label: 'Total Revenue', value: `$${stats.totalRevenue?.toFixed(2) || '0.00'}`, icon: '💰', color: 'bg-purple-50' },
    ]

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between'>
                <Link to='/'><img src={assets.logo} alt='logo' className='w-24' /></Link>
                <div className='flex items-center gap-3'>
                    <span className='text-sm font-medium text-purple-700 bg-purple-100 px-3 py-1 rounded-full'>🛡️ Admin</span>
                    <span className='text-sm font-medium text-gray-700'>{user?.fullName || user?.firstName || ''}</span>
                    <UserButton afterSignOutUrl='/' />
                </div>
            </div>

            <div className='px-4 sm:px-10 md:px-14 lg:px-20 py-8'>
                <h1 className='text-2xl font-bold text-gray-800 mb-6'>Admin Dashboard</h1>

                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
                    {statCards.map((s, i) => (
                        <div key={i} className={`${s.color} rounded-xl p-5 border border-gray-100`}>
                            <div className='text-3xl mb-2'>{s.icon}</div>
                            <p className='text-2xl font-bold text-gray-800'>{s.value}</p>
                            <p className='text-sm text-gray-500'>{s.label}</p>
                        </div>
                    ))}
                </div>

                <div className='flex gap-2 mb-6'>
                    {['overview', 'instructors', 'students'].map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${tab === t ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                            {t}
                        </button>
                    ))}
                </div>

                {/* Instructors Tab — with expandable course list */}
                {tab === 'instructors' && (
                    <div className='space-y-3'>
                        {instructors.length === 0 && <p className='text-center text-gray-400 py-10'>No instructors yet</p>}
                        {instructors.map((item, i) => (
                            <div key={i} className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
                                <button
                                    onClick={() => setExpandedInstructor(expandedInstructor === i ? null : i)}
                                    className='w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition text-left'
                                >
                                    <div className='flex items-center gap-3'>
                                        {item.instructor.imageUrl && <img src={item.instructor.imageUrl} className='w-9 h-9 rounded-full object-cover' />}
                                        <div>
                                            <p className='font-semibold text-gray-800'>{item.instructor.name}</p>
                                            <p className='text-xs text-gray-400'>{item.instructor.email}</p>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-6 text-sm text-gray-500'>
                                        <span>{item.totalCourses} courses</span>
                                        <span>{item.totalStudents} students</span>
                                        <span className='text-gray-400'>{expandedInstructor === i ? '▲' : '▼'}</span>
                                    </div>
                                </button>

                                {expandedInstructor === i && (
                                    <div className='border-t border-gray-100 px-5 py-4'>
                                        <p className='text-xs font-semibold text-gray-500 uppercase mb-3'>Published Courses</p>
                                        {item.localCourses?.length === 0 && <p className='text-sm text-gray-400'>No courses published yet</p>}
                                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                            {item.localCourses?.map((course, ci) => (
                                                <div key={ci} className='flex items-center gap-3 border border-gray-100 rounded-lg p-3'>
                                                    <img src={course.courseThumbnail} alt={course.courseTitle}
                                                        className='w-14 h-10 object-cover rounded'
                                                        onError={e => e.target.style.display = 'none'} />
                                                    <div>
                                                        <p className='text-sm font-medium text-gray-800'>{course.courseTitle}</p>
                                                        <p className='text-xs text-gray-400'>${course.coursePrice} · {course.isPublished ? '✓ Published' : 'Draft'}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Students Tab — with expandable enrolled courses */}
                {tab === 'students' && (
                    <div className='space-y-3'>
                        {students.length === 0 && <p className='text-center text-gray-400 py-10'>No students yet</p>}
                        {students.map((item, i) => (
                            <div key={i} className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
                                <button
                                    onClick={() => setExpandedStudent(expandedStudent === i ? null : i)}
                                    className='w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition text-left'
                                >
                                    <div className='flex items-center gap-3'>
                                        {item.student.imageUrl && <img src={item.student.imageUrl} className='w-9 h-9 rounded-full object-cover' />}
                                        <div>
                                            <p className='font-semibold text-gray-800'>{item.student.name}</p>
                                            <p className='text-xs text-gray-400'>{item.student.email}</p>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-4 text-sm text-gray-500'>
                                        <span>{item.enrolledCourses} enrolled</span>
                                        <span className='text-gray-400'>{expandedStudent === i ? '▲' : '▼'}</span>
                                    </div>
                                </button>

                                {expandedStudent === i && (
                                    <div className='border-t border-gray-100 px-5 py-4'>
                                        <p className='text-xs font-semibold text-gray-500 uppercase mb-3'>Enrolled Courses</p>
                                        {item.localEnrolledCourses?.length === 0 && <p className='text-sm text-gray-400'>No local enrollments</p>}
                                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                            {item.localEnrolledCourses?.map((course, ci) => {
                                                const progress = JSON.parse(localStorage.getItem(`progress_${course._id}`) || '[]')
                                                const total = course.courseContent?.reduce((s, ch) => s + ch.chapterContent.length, 0) || 0
                                                const pct = total > 0 ? Math.round((progress.length / total) * 100) : 0
                                                return (
                                                    <div key={ci} className='flex items-center gap-3 border border-gray-100 rounded-lg p-3'>
                                                        <img src={course.courseThumbnail} alt={course.courseTitle}
                                                            className='w-14 h-10 object-cover rounded'
                                                            onError={e => e.target.style.display = 'none'} />
                                                        <div className='flex-1'>
                                                            <p className='text-sm font-medium text-gray-800'>{course.courseTitle}</p>
                                                            <div className='flex items-center gap-2 mt-1'>
                                                                <div className='flex-1 bg-gray-200 rounded-full h-1.5'>
                                                                    <div className='bg-blue-600 h-1.5 rounded-full' style={{ width: `${pct}%` }}></div>
                                                                </div>
                                                                <span className='text-xs text-gray-400'>{pct}%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Overview Tab */}
                {tab === 'overview' && (
                    <div className='grid md:grid-cols-2 gap-6'>
                        <div className='bg-white rounded-xl border border-gray-200 p-5'>
                            <h3 className='font-semibold text-gray-700 mb-4'>Instructors</h3>
                            {instructors.slice(0, 5).map((item, i) => (
                                <div key={i} className='flex items-center justify-between py-2 border-b border-gray-100 last:border-0'>
                                    <div className='flex items-center gap-2'>
                                        {item.instructor.imageUrl && <img src={item.instructor.imageUrl} className='w-7 h-7 rounded-full' />}
                                        <span className='text-sm text-gray-700'>{item.instructor.name}</span>
                                    </div>
                                    <span className='text-xs text-gray-500'>{item.totalCourses} courses · {item.totalStudents} students</span>
                                </div>
                            ))}
                            {instructors.length === 0 && <p className='text-sm text-gray-400 text-center py-4'>No instructors yet</p>}
                        </div>
                        <div className='bg-white rounded-xl border border-gray-200 p-5'>
                            <h3 className='font-semibold text-gray-700 mb-4'>Students</h3>
                            {students.slice(0, 5).map((item, i) => (
                                <div key={i} className='flex items-center justify-between py-2 border-b border-gray-100 last:border-0'>
                                    <div className='flex items-center gap-2'>
                                        {item.student.imageUrl && <img src={item.student.imageUrl} className='w-7 h-7 rounded-full' />}
                                        <span className='text-sm text-gray-700'>{item.student.name}</span>
                                    </div>
                                    <span className='text-xs text-gray-500'>{item.enrolledCourses} enrolled</span>
                                </div>
                            ))}
                            {students.length === 0 && <p className='text-sm text-gray-400 text-center py-4'>No students yet</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminDashboard
