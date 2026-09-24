import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

export const AppContext = createContext()

export const AppContextProvider = ({ children }) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const { getToken } = useAuth()
    const { user, isSignedIn } = useUser()
    const navigate = useNavigate()

    const [allCourses, setAllCourses] = useState([])
    const [userData, setUserData] = useState(null)
    const [enrolledCourses, setEnrolledCourses] = useState([])
    const [isEducator, setIsEducator] = useState(() => localStorage.getItem('userRole') === 'educator')
    const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('userRole') === 'admin')

    // Fetch all courses
    const fetchAllCourses = async () => {
        const localCourses = JSON.parse(localStorage.getItem('localCourses') || '[]')
        try {
            const { data } = await axios.get(`${backendUrl}/api/course/all`)
            if (data.success) {
                const backendIds = new Set(data.courses.map(c => c._id))
                const uniqueLocal = localCourses.filter(c => !backendIds.has(c._id))
                setAllCourses([...data.courses, ...uniqueLocal])
            } else {
                setAllCourses(localCourses)
            }
        } catch {
            setAllCourses(localCourses)
        }
    }

    // Fetch logged-in user data — auto-creates user in DB if not exists
    const fetchUserData = async () => {
        const userEmail = user?.emailAddresses?.[0]?.emailAddress
        const ADMIN_EMAIL = '23shantanukumar@gmail.com'

        if (userEmail === ADMIN_EMAIL) {
            localStorage.setItem('userRole', 'admin')
            setIsAdmin(true)
            setIsEducator(false)
        }

        try {
            const token = await getToken()
            // Sync user to DB on every login (upsert)
            const { data } = await axios.post(`${backendUrl}/api/user/sync`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                setUserData(data.user)
                if (userEmail !== ADMIN_EMAIL) {
                    const role = data.user.role
                    localStorage.setItem('userRole', role)
                    setIsEducator(role === 'educator')
                    setIsAdmin(false)
                }
                // Save to allStudentInfo for local course tracking
                const allStudentInfo = JSON.parse(localStorage.getItem('allStudentInfo') || '{}')
                allStudentInfo[user.id] = {
                    name: data.user.name,
                    email: data.user.email,
                    imageUrl: data.user.imageUrl,
                }
                localStorage.setItem('allStudentInfo', JSON.stringify(allStudentInfo))
            }
        } catch {
            // Backend offline — use locally stored role
        }
    }

    // Fetch enrolled courses
    const fetchEnrolledCourses = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get(`${backendUrl}/api/user/enrolled-courses`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) setEnrolledCourses(data.enrolledCourses)
        } catch {
            // Backend offline — skip silently
        }
    }

    // After login — check selected role and redirect
    const handlePostLogin = async () => {
        const selectedRole = sessionStorage.getItem('selectedRole')

        // Check if this user is the hardcoded admin
        const userEmail = user?.emailAddresses?.[0]?.emailAddress
        const ADMIN_EMAIL = '23shantanukumar@gmail.com'

        if (userEmail === ADMIN_EMAIL) {
            sessionStorage.removeItem('selectedRole')
            localStorage.setItem('userRole', 'admin')
            setIsAdmin(true)
            setIsEducator(false)
            try {
                const token = await getToken()
                await axios.post(`${backendUrl}/api/user/set-role`,
                    { role: 'admin' },
                    { headers: { Authorization: `Bearer ${token}` } }
                )
            } catch { }
            navigate('/admin')
            return
        }

        if (!selectedRole) return
        sessionStorage.removeItem('selectedRole')

        // Block non-admin users from getting admin role
        if (selectedRole === 'admin') {
            toast.error('You are not authorized as admin')
            localStorage.setItem('userRole', 'student')
            setIsAdmin(false)
            setIsEducator(false)
            navigate('/course-list')
            return
        }

        localStorage.setItem('userRole', selectedRole === 'instructor' ? 'educator' : selectedRole)

        try {
            const token = await getToken()
            await axios.post(`${backendUrl}/api/user/set-role`,
                { role: selectedRole },
                { headers: { Authorization: `Bearer ${token}` } }
            )
        } catch { }

        if (selectedRole === 'instructor') {
            setIsEducator(true)
            setIsAdmin(false)
            navigate('/educator')
        } else {
            setIsEducator(false)
            setIsAdmin(false)
            navigate('/course-list')
        }
    }

    // Calculate course rating
    const calculateRating = (course) => {
        if (!course.courseRatings?.length) return 0
        const total = course.courseRatings.reduce((sum, r) => sum + r.rating, 0)
        return (total / course.courseRatings.length).toFixed(1)
    }

    const calculateChapterTime = (chapter) => {
        const total = chapter.chapterContent.reduce((sum, l) => sum + l.lectureDuration, 0)
        return `${Math.floor(total / 60)}h ${total % 60}m`
    }

    const calculateCourseDuration = (course) => {
        const total = course.courseContent?.reduce((sum, ch) =>
            sum + ch.chapterContent.reduce((s, l) => s + l.lectureDuration, 0), 0) || 0
        return `${Math.floor(total / 60)}h ${total % 60}m`
    }

    const calculateNoOfLectures = (course) => {
        return course.courseContent?.reduce((sum, ch) => sum + ch.chapterContent.length, 0) || 0
    }

    useEffect(() => {
        fetchAllCourses()
    }, [])

    useEffect(() => {
        if (isSignedIn && user) {
            fetchUserData()
            fetchEnrolledCourses()
            handlePostLogin()

            // Always save current user info to allStudentInfo keyed by ID
            const allStudentInfo = JSON.parse(localStorage.getItem('allStudentInfo') || '{}')
            allStudentInfo[user.id] = {
                name: user.fullName || user.firstName || '',
                email: user.emailAddresses?.[0]?.emailAddress || '',
                imageUrl: user.imageUrl || null,
            }
            localStorage.setItem('allStudentInfo', JSON.stringify(allStudentInfo))
        }
    }, [isSignedIn, user])

    const value = {
        backendUrl, getToken,
        allCourses, fetchAllCourses,
        userData, setUserData, fetchUserData,
        enrolledCourses, fetchEnrolledCourses,
        isEducator, setIsEducator,
        isAdmin, setIsAdmin,
        calculateRating, calculateChapterTime,
        calculateCourseDuration, calculateNoOfLectures,
    }

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppContext = () => useContext(AppContext)
