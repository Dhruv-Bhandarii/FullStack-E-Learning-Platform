import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import YouTube from 'react-youtube'
import { Line } from 'rc-progress'
import Loading from '../../components/common/Loading'
import { assets } from '../../assets/assets'

const Player = () => {
    const { courseId } = useParams()
    const { backendUrl, getToken, calculateNoOfLectures } = useContext(AppContext)

    const [course, setCourse] = useState(null)
    const [currentLecture, setCurrentLecture] = useState(null)
    const [completedLectures, setCompletedLectures] = useState([])
    const [openChapter, setOpenChapter] = useState(0)

    useEffect(() => {
        const loadCourse = async () => {
            // Local course — load from localStorage
            if (courseId.startsWith('local_')) {
                const local = JSON.parse(localStorage.getItem('localCourses') || '[]')
                const found = local.find(c => c._id === courseId)
                if (found) {
                    setCourse(found)
                    setCurrentLecture(found.courseContent?.[0]?.chapterContent?.[0])
                }
                // Load local progress
                const localProgress = JSON.parse(localStorage.getItem(`progress_${courseId}`) || '[]')
                setCompletedLectures(localProgress)
                return
            }

            // Backend course
            try {
                const token = await getToken()
                const { data } = await axios.get(`${backendUrl}/api/course/${courseId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (data.success) {
                    setCourse(data.course)
                    setCurrentLecture(data.course.courseContent?.[0]?.chapterContent?.[0])
                }
            } catch (err) {
                toast.error('Could not load course')
            }

            // Load progress from backend
            try {
                const token = await getToken()
                const { data } = await axios.get(`${backendUrl}/api/course/progress/${courseId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (data.success) setCompletedLectures(data.completedLectures)
            } catch { }
        }

        loadCourse()
    }, [courseId])

    const markComplete = async (lectureId) => {
        if (completedLectures.includes(lectureId)) return

        const updated = [...completedLectures, lectureId]
        setCompletedLectures(updated)

        if (courseId.startsWith('local_')) {
            localStorage.setItem(`progress_${courseId}`, JSON.stringify(updated))
            return
        }

        try {
            const token = await getToken()
            await axios.post(`${backendUrl}/api/course/progress`,
                { courseId, lectureId },
                { headers: { Authorization: `Bearer ${token}` } }
            )
        } catch { }
    }

    const getYouTubeId = (url) => {
        if (!url) return ''
        const match = url.match(/(?:youtu\.be\/|v=|embed\/)([^&\n?#]+)/)
        return match ? match[1] : ''
    }

    if (!course) return <Loading />

    const totalLectures = calculateNoOfLectures(course)
    const progress = totalLectures > 0 ? Math.round((completedLectures.length / totalLectures) * 100) : 0
    const youtubeId = getYouTubeId(currentLecture?.lectureUrl)

    return (
        <div className='flex flex-col lg:flex-row min-h-screen'>
            {/* Video Area */}
            <div className='flex-1 p-4 md:p-8'>
                <h1 className='text-xl font-bold text-gray-800 mb-4'>{course.courseTitle}</h1>

                {currentLecture && (
                    <div className='rounded-xl overflow-hidden bg-black mb-4 aspect-video'>
                        {youtubeId ? (
                            <YouTube
                                videoId={youtubeId}
                                opts={{ width: '100%', height: '100%', playerVars: { autoplay: 1 } }}
                                onEnd={() => markComplete(currentLecture.lectureId)}
                                className='w-full h-full'
                            />
                        ) : (
                            <div className='flex items-center justify-center h-full text-white text-sm'>
                                No video available for this lecture
                            </div>
                        )}
                    </div>
                )}

                <div className='flex items-center justify-between mb-4'>
                    <h2 className='font-semibold text-gray-700'>{currentLecture?.lectureTitle}</h2>
                    <button
                        onClick={() => currentLecture && markComplete(currentLecture.lectureId)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition ${completedLectures.includes(currentLecture?.lectureId) ? 'bg-green-100 text-green-700 border-green-300' : 'border-gray-300 text-gray-500 hover:bg-gray-100'}`}
                    >
                        {completedLectures.includes(currentLecture?.lectureId) ? '✓ Completed' : 'Mark Complete'}
                    </button>
                </div>

                <div className='mt-2'>
                    <div className='flex items-center justify-between text-sm text-gray-500 mb-1'>
                        <span>Course Progress</span>
                        <span>{progress}% ({completedLectures.length}/{totalLectures} lectures)</span>
                    </div>
                    <Line percent={progress} strokeWidth={3} strokeColor='#2563eb' trailColor='#e5e7eb' />
                </div>
            </div>

            {/* Sidebar */}
            <div className='lg:w-80 border-l border-gray-200 overflow-y-auto bg-white'>
                <div className='p-4 border-b border-gray-200'>
                    <h3 className='font-semibold text-gray-800'>Course Content</h3>
                    <p className='text-xs text-gray-400 mt-1'>{completedLectures.length}/{totalLectures} completed</p>
                </div>
                {course.courseContent?.map((chapter, i) => (
                    <div key={chapter.chapterId} className='border-b border-gray-100'>
                        <button
                            onClick={() => setOpenChapter(openChapter === i ? -1 : i)}
                            className='w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left'
                        >
                            <span className='text-sm font-medium text-gray-700'>{chapter.chapterTitle}</span>
                            <img src={assets.down_arrow_icon} alt='arrow' className={`w-3 transition-transform ${openChapter === i ? 'rotate-180' : ''}`} />
                        </button>
                        {openChapter === i && chapter.chapterContent.map(lecture => (
                            <button
                                key={lecture.lectureId}
                                onClick={() => setCurrentLecture(lecture)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-blue-50 transition ${currentLecture?.lectureId === lecture.lectureId ? 'bg-blue-50 text-blue-700' : 'text-gray-600'}`}
                            >
                                <span className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center text-xs ${completedLectures.includes(lecture.lectureId) ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                                    {completedLectures.includes(lecture.lectureId) ? '✓' : ''}
                                </span>
                                <span className='line-clamp-2 flex-1 text-left'>{lecture.lectureTitle}</span>
                                <span className='text-xs text-gray-400 flex-shrink-0'>{lecture.lectureDuration}m</span>
                            </button>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Player
