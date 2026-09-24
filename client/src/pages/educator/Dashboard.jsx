import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { assets } from '../../assets/assets'
import { DashboardStatsSkeleton } from '../../components/common/Skeleton'

const Dashboard = () => {
    const { backendUrl, getToken } = useContext(AppContext)
    const [data, setData] = useState(null)

    useEffect(() => {
        const fetchDashboard = async () => {
            // Start with local data
            const localCourses = JSON.parse(localStorage.getItem('localCourses') || '[]')
            const localEnrollments = JSON.parse(localStorage.getItem('localEnrollments') || '[]')

            const localEnrolledCourses = localCourses.filter(c => localEnrollments.includes(c._id))
            const allStudentInfo = JSON.parse(localStorage.getItem('allStudentInfo') || '{}')
            const allStudentValues = Object.values(allStudentInfo)

            const localStudentData = localEnrolledCourses.map(c => {
                const enrollmentDetails = JSON.parse(localStorage.getItem(`enrollment_${c._id}`) || '{}')
                // Find matching student by email
                let student = null
                if (enrollmentDetails.email) {
                    student = allStudentValues.find(s => s.email === enrollmentDetails.email)
                }
                if (!student && allStudentValues.length > 0) {
                    student = allStudentValues[allStudentValues.length - 1]
                }
                return {
                    courseTitle: c.courseTitle,
                    student: student?.name || enrollmentDetails.name || student?.email?.split('@')[0] || 'Student',
                }
            })

            let dashData = {
                totalEarnings: 0,
                totalCourses: localCourses.length,
                enrolledStudentsData: localStudentData,
            }

            // Try to merge with backend data
            try {
                const token = await getToken()
                const res = await axios.get(`${backendUrl}/api/course/educator/dashboard`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (res.data.success) {
                    dashData = {
                        totalEarnings: res.data.totalEarnings,
                        totalCourses: res.data.totalCourses + localCourses.length,
                        enrolledStudentsData: [...res.data.enrolledStudentsData, ...localStudentData],
                    }
                }
            } catch {
                // Backend offline or no backend courses — use local only
            }

            setData(dashData)
        }

        fetchDashboard()
    }, [])

    if (!data) return <DashboardStatsSkeleton />

    const stats = [
        { label: 'Total Earnings', value: `$${data.totalEarnings.toFixed(2)}`, icon: assets.earning_icon },
        { label: 'Total Courses', value: data.totalCourses, icon: assets.my_course_icon },
        { label: 'Total Students', value: data.enrolledStudentsData.length, icon: assets.patients_icon },
    ]

    return (
        <div>
            <h1 className='text-xl font-bold text-gray-800 mb-6'>Dashboard</h1>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8'>
                {stats.map((s, i) => (
                    <div key={i} className='bg-white rounded-xl p-5 border border-gray-200 flex items-center gap-4'>
                        <div className='bg-blue-50 p-3 rounded-lg'>
                            <img src={s.icon} alt={s.label} className='w-6' />
                        </div>
                        <div>
                            <p className='text-2xl font-bold text-gray-800'>{s.value}</p>
                            <p className='text-sm text-gray-500'>{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
                <div className='px-5 py-4 border-b border-gray-100'>
                    <h2 className='font-semibold text-gray-700'>Recent Enrollments</h2>
                </div>
                {data.enrolledStudentsData.length === 0 ? (
                    <p className='text-center text-gray-400 py-10 text-sm'>No enrollments yet</p>
                ) : (
                    <table className='w-full text-sm'>
                        <thead className='bg-gray-50 text-gray-500 text-xs uppercase'>
                            <tr>
                                <th className='px-5 py-3 text-left'>#</th>
                                <th className='px-5 py-3 text-left'>Student</th>
                                <th className='px-5 py-3 text-left'>Course</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.enrolledStudentsData.slice(0, 8).map((item, i) => (
                                <tr key={i} className='border-t border-gray-100 hover:bg-gray-50'>
                                    <td className='px-5 py-3 text-gray-400'>{i + 1}</td>
                                    <td className='px-5 py-3 text-gray-700'>{item.student?.name || item.student}</td>
                                    <td className='px-5 py-3 text-gray-700'>{item.courseTitle}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

export default Dashboard
