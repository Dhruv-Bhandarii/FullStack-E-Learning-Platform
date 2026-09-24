import { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import { useUser } from '@clerk/clerk-react'
import axios from 'axios'
import { toast } from 'react-toastify'
import Rating from '../../components/student/Rating'
import { CourseDetailSkeleton } from '../../components/common/Skeleton'
import Footer from '../../components/student/Footer'
import { assets } from '../../assets/assets'
import {
    isEnrolledLocally, addLocalEnrollment, saveEnrollmentDetails,
    addCourseEnrollment, saveStudentInfo, getLocalRating, updateLocalCourse, getLocalCourses,
    getEnrollmentDetails
} from '../../utils/localStorage'

const CourseDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { backendUrl, getToken, calculateRating, calculateNoOfLectures, calculateCourseDuration, calculateChapterTime, enrolledCourses } = useContext(AppContext)
    const { isSignedIn, user } = useUser()

    const [course, setCourse] = useState(null)
    const [openChapter, setOpenChapter] = useState(0)
    const [isEnrolled, setIsEnrolled] = useState(false)
    const [userRating, setUserRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [ratingSubmitted, setRatingSubmitted] = useState(false)

    // Check if student already rated this course
    useEffect(() => {
        if (!course) return
        if (course._id.startsWith('local_')) {
            const localCourses = JSON.parse(localStorage.getItem('localCourses') || '[]')
            const found = localCourses.find(c => c._id === course._id)
            const existing = found?.courseRatings?.find(r => r.userId === 'local_user')
            if (existing) {
                setUserRating(existing.rating)
                setRatingSubmitted(true)
            }
        }
    }, [course])

    useEffect(() => {
        const fetchCourse = async () => {
            // Check local courses first for local_ IDs
            if (id.startsWith('local_')) {
                const localCourses = JSON.parse(localStorage.getItem('localCourses') || '[]')
                const found = localCourses.find(c => c._id === id)
                if (found) setCourse(found)
                return
            }
            try {
                const token = isSignedIn ? await getToken() : null
                const headers = token ? { Authorization: `Bearer ${token}` } : {}
                const { data } = await axios.get(`${backendUrl}/api/course/${id}`, { headers })
                if (data.success) setCourse(data.course)
            } catch {
                const localCourses = JSON.parse(localStorage.getItem('localCourses') || '[]')
                const found = localCourses.find(c => c._id === id)
                if (found) setCourse(found)
            }
        }
        fetchCourse()
    }, [id])

    useEffect(() => {
        if (course) {
            const backendEnrolled = enrolledCourses?.some(c => c._id === course._id)
            const localEnrolled = isEnrolledLocally(course._id)
            setIsEnrolled(backendEnrolled || localEnrolled)

            if ((backendEnrolled || localEnrolled) && user && course._id.startsWith('local_')) {
                const existing = getEnrollmentDetails(course._id)
                saveEnrollmentDetails(course._id, {
                    ...existing,
                    name: user?.fullName || user?.firstName || 'Student',
                    email: user?.emailAddresses?.[0]?.emailAddress || existing.email || '',
                    imageUrl: user?.imageUrl || existing.imageUrl || null,
                })
            }
        }
    }, [enrolledCourses, course, user])

    const handleEnroll = async () => {
        if (!isSignedIn) return toast.error('Please login to enroll')
        if (isEnrolled) return navigate(`/player/${course._id}`)

        // For local courses (backend offline), save enrollment locally
        if (course._id.startsWith('local_')) {
            addLocalEnrollment(course._id)
            const studentInfo = {
                name: user?.fullName || user?.firstName || 'Student',
                email: user?.emailAddresses?.[0]?.emailAddress || '',
                imageUrl: user?.imageUrl || null,
            }
            saveStudentInfo(user?.id, studentInfo)
            saveEnrollmentDetails(course._id, { ...studentInfo, date: new Date().toISOString() })
            addCourseEnrollment(course._id, user?.id)
            toast.success('Enrolled successfully!')
            setIsEnrolled(true)
            navigate(`/player/${course._id}`)
            return
        }

        try {
            const token = await getToken()
            const { data } = await axios.post(`${backendUrl}/api/course/enroll`,
                { courseId: course._id },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (data.success) {
                toast.success('Enrolled successfully!')
                setIsEnrolled(true)
                navigate(`/player/${course._id}`)
            } else {
                toast.error(data.message)
            }
        } catch {
            toast.error('Could not enroll. Please try again.')
        }
    }

    const submitRating = async () => {
        if (!userRating) return toast.error('Please select a rating')

        // Handle local course rating
        if (course._id.startsWith('local_')) {
            const localCourses = getLocalCourses()
            const updated = localCourses.map(c => {
                if (c._id !== course._id) return c
                const ratings = c.courseRatings || []
                const existing = ratings.findIndex(r => r.userId === 'local_user')
                if (existing >= 0) ratings[existing].rating = userRating
                else ratings.push({ userId: 'local_user', rating: userRating })
                return { ...c, courseRatings: ratings }
            })
            localStorage.setItem('localCourses', JSON.stringify(updated))
            setCourse(prev => ({ ...prev, courseRatings: updated.find(c => c._id === course._id)?.courseRatings || [] }))
            toast.success('Rating submitted!')
            setRatingSubmitted(true)
            return
        }

        try {
            const token = await getToken()
            const { data } = await axios.post(`${backendUrl}/api/course/rating`,
                { courseId: course._id, rating: userRating },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (data.success) {
                toast.success('Rating submitted!')
                setRatingSubmitted(true)
            } else {
                toast.error(data.message)
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not submit rating')
        }
    }

    if (!course) return <CourseDetailSkeleton />

    const discountedPrice = (course.coursePrice - (course.coursePrice * course.discount / 100)).toFixed(2)

    return (
        <div>
            <div className='px-4 sm:px-10 md:px-14 lg:px-36 py-10'>
                <div className='flex flex-col lg:flex-row gap-10'>
                    {/* Left */}
                    <div className='flex-1'>
                        <h1 className='text-2xl md:text-3xl font-bold text-gray-800 mb-3'>{course.courseTitle}</h1>
                        <div className='flex items-center gap-3 mb-4'>
                            <span className='text-sm font-medium text-gray-700'>{calculateRating(course)}</span>
                            <Rating rating={calculateRating(course)} />
                            <span className='text-sm text-gray-400'>({course.courseRatings?.length} ratings)</span>
                            <span className='text-sm text-gray-400'>{course.enrolledStudents?.length} students</span>
                        </div>
                        <p className='text-sm text-gray-500 mb-6'>
                            {calculateNoOfLectures(course)} lectures · {calculateCourseDuration(course)} total
                        </p>

                        {/* Course Content */}
                        <h2 className='text-lg font-semibold text-gray-800 mb-3'>Course Content</h2>
                        <div className='border border-gray-200 rounded-lg overflow-hidden mb-8'>
                            {course.courseContent?.map((chapter, i) => (
                                <div key={chapter.chapterId} className='border-b border-gray-200 last:border-0'>
                                    <button
                                        onClick={() => setOpenChapter(openChapter === i ? -1 : i)}
                                        className='w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-left'
                                    >
                                        <span className='font-medium text-gray-700 text-sm'>{chapter.chapterTitle}</span>
                                        <div className='flex items-center gap-3 text-xs text-gray-400'>
                                            <span>{chapter.chapterContent.length} lectures · {calculateChapterTime(chapter)}</span>
                                            <img src={assets.down_arrow_icon} alt='arrow' className={`w-3 transition-transform ${openChapter === i ? 'rotate-180' : ''}`} />
                                        </div>
                                    </button>
                                    {openChapter === i && (
                                        <div className='px-4 py-2'>
                                            {chapter.chapterContent.map(lecture => (
                                                <div key={lecture.lectureId} className='flex items-center justify-between py-2 text-sm text-gray-600 border-b border-gray-100 last:border-0'>
                                                    <div className='flex items-center gap-2'>
                                                        <img src={assets.play_icon} alt='play' className='w-4' />
                                                        <span>{lecture.lectureTitle}</span>
                                                        {lecture.isPreviewFree && <span className='text-xs text-blue-500 border border-blue-300 px-1.5 rounded'>Free</span>}
                                                    </div>
                                                    <span className='text-xs text-gray-400'>{lecture.lectureDuration} min</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Description */}
                        <h2 className='text-lg font-semibold text-gray-800 mb-3'>About This Course</h2>
                        <div className='text-sm text-gray-600 leading-relaxed prose max-w-none'
                            dangerouslySetInnerHTML={{ __html: course.courseDescription }} />

                        {/* Rating Section — only for enrolled students */}
                        {isEnrolled && (
                            <div className='mt-8 border border-gray-200 rounded-xl p-5'>
                                <h2 className='text-lg font-semibold text-gray-800 mb-3'>Rate This Course</h2>
                                {ratingSubmitted ? (
                                    <div className='flex items-center gap-2'>
                                        <div className='flex gap-1'>
                                            {[1,2,3,4,5].map(s => (
                                                <span key={s} className={`text-2xl ${userRating >= s ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                                            ))}
                                        </div>
                                        <span className='text-sm text-green-600 font-medium'>✓ You rated this {userRating}/5</span>
                                    </div>
                                ) : (
                                    <div className='flex items-center gap-3'>
                                        <div className='flex gap-1'>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    onClick={() => setUserRating(star)}
                                                    className='text-2xl transition'
                                                >
                                                    <span className={(hoverRating || userRating) >= star ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                                                </button>
                                            ))}
                                        </div>
                                        <span className='text-sm text-gray-500'>{userRating ? `${userRating}/5` : 'Select rating'}</span>
                                        <button
                                            onClick={submitRating}
                                            className='ml-2 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition'
                                        >
                                            Submit
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right — sticky card */}
                    <div className='lg:w-80'>
                        <div className='sticky top-6 border border-gray-200 rounded-xl overflow-hidden shadow-md'>
                            <img 
                                src={course.courseThumbnail} 
                                alt={course.courseTitle} 
                                className='w-full h-44 object-cover'
                                onError={e => { e.target.style.display = 'none' }}
                            />
                            <div className='p-5'>
                                <div className='flex items-center gap-3 mb-4'>
                                    <span className='text-2xl font-bold text-gray-900'>${discountedPrice}</span>
                                    {course.discount > 0 && <>
                                        <span className='text-gray-400 line-through text-sm'>${course.coursePrice}</span>
                                        <span className='text-green-600 text-sm font-medium'>{course.discount}% off</span>
                                    </>}
                                </div>
                                <button
                                    onClick={handleEnroll}
                                    className='w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition'
                                >
                                    {isEnrolled ? 'Go to Course' : 'Enroll Now'}
                                </button>
                                <ul className='mt-4 space-y-2 text-sm text-gray-600'>
                                    <li className='flex items-center gap-2'><img src={assets.lesson_icon} className='w-4' />{calculateNoOfLectures(course)} lectures</li>
                                    <li className='flex items-center gap-2'><img src={assets.time_clock_icon} className='w-4' />{calculateCourseDuration(course)} total</li>
                                    <li className='flex items-center gap-2'><img src={assets.blue_tick_icon} className='w-4' />Lifetime access</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default CourseDetails
