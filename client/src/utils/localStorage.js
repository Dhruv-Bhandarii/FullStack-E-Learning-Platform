// Centralized localStorage utility
// All localStorage reads/writes go through here

// ── Courses ──────────────────────────────────────────
export const getLocalCourses = () =>
    JSON.parse(localStorage.getItem('localCourses') || '[]')

export const saveLocalCourse = (course) => {
    const courses = getLocalCourses()
    const existing = courses.findIndex(c => c._id === course._id)
    if (existing >= 0) courses[existing] = course
    else courses.push(course)
    localStorage.setItem('localCourses', JSON.stringify(courses))
}

export const updateLocalCourse = (courseId, updates) => {
    const courses = getLocalCourses().map(c =>
        c._id === courseId ? { ...c, ...updates } : c
    )
    localStorage.setItem('localCourses', JSON.stringify(courses))
}

// ── Enrollments ──────────────────────────────────────
export const getLocalEnrollments = () =>
    JSON.parse(localStorage.getItem('localEnrollments') || '[]')

export const addLocalEnrollment = (courseId) => {
    const enrollments = getLocalEnrollments()
    if (!enrollments.includes(courseId)) {
        enrollments.push(courseId)
        localStorage.setItem('localEnrollments', JSON.stringify(enrollments))
    }
}

export const isEnrolledLocally = (courseId) =>
    getLocalEnrollments().includes(courseId)

// ── Progress ─────────────────────────────────────────
export const getLocalProgress = (courseId) =>
    JSON.parse(localStorage.getItem(`progress_${courseId}`) || '[]')

export const addLocalProgress = (courseId, lectureId) => {
    const progress = getLocalProgress(courseId)
    if (!progress.includes(lectureId)) {
        progress.push(lectureId)
        localStorage.setItem(`progress_${courseId}`, JSON.stringify(progress))
    }
    return progress
}

// ── Student Info ─────────────────────────────────────
export const getAllStudentInfo = () =>
    JSON.parse(localStorage.getItem('allStudentInfo') || '{}')

export const saveStudentInfo = (userId, info) => {
    const all = getAllStudentInfo()
    all[userId] = info
    localStorage.setItem('allStudentInfo', JSON.stringify(all))
}

export const getStudentInfoByEmail = (email) => {
    const all = getAllStudentInfo()
    return Object.values(all).find(s => s.email === email) || null
}

// ── Enrollment Details (per course) ──────────────────
export const getEnrollmentDetails = (courseId) =>
    JSON.parse(localStorage.getItem(`enrollment_${courseId}`) || '{}')

export const saveEnrollmentDetails = (courseId, details) =>
    localStorage.setItem(`enrollment_${courseId}`, JSON.stringify(details))

// ── Course Enrollments (per course student list) ──────
export const getCourseEnrollments = (courseId) =>
    JSON.parse(localStorage.getItem(`courseEnrollments_${courseId}`) || '[]')

export const addCourseEnrollment = (courseId, userId) => {
    const list = getCourseEnrollments(courseId)
    if (!list.includes(userId)) {
        list.push(userId)
        localStorage.setItem(`courseEnrollments_${courseId}`, JSON.stringify(list))
    }
}

// ── User Role ─────────────────────────────────────────
export const getUserRole = () => localStorage.getItem('userRole') || 'student'
export const setUserRole = (role) => localStorage.setItem('userRole', role)
export const clearUserRole = () => localStorage.removeItem('userRole')

// ── Ratings ───────────────────────────────────────────
export const getLocalRating = (courseId) => {
    const courses = getLocalCourses()
    const course = courses.find(c => c._id === courseId)
    return course?.courseRatings?.find(r => r.userId === 'local_user')?.rating || 0
}
