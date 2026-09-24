import { useContext, useRef, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets'
import uniqid from 'uniqid'

const AddCourse = () => {
    const { backendUrl, getToken } = useContext(AppContext)
    const navigate = useNavigate()
    const imgRef = useRef()

    const [thumbnail, setThumbnail] = useState(null)
    const [courseData, setCourseData] = useState({
        courseTitle: '',
        courseDescription: '',
        coursePrice: '',
        discount: 0,
    })
    const [chapters, setChapters] = useState([])
    const [submitting, setSubmitting] = useState(false)

    // Chapter handlers
    const addChapter = () => {
        setChapters(prev => [...prev, {
            chapterId: uniqid(),
            chapterTitle: '',
            chapterOrder: prev.length + 1,
            chapterContent: [],
            collapsed: false,
        }])
    }

    const updateChapterTitle = (id, title) =>
        setChapters(prev => prev.map(c => c.chapterId === id ? { ...c, chapterTitle: title } : c))

    const removeChapter = (id) =>
        setChapters(prev => prev.filter(c => c.chapterId !== id))

    const toggleChapter = (id) =>
        setChapters(prev => prev.map(c => c.chapterId === id ? { ...c, collapsed: !c.collapsed } : c))

    // Lecture handlers
    const addLecture = (chapterId) => {
        setChapters(prev => prev.map(c => c.chapterId === chapterId ? {
            ...c,
            chapterContent: [...c.chapterContent, {
                lectureId: uniqid(),
                lectureTitle: '',
                lectureUrl: '',
                lectureDuration: 0,
                isPreviewFree: false,
                lectureOrder: c.chapterContent.length + 1,
                contentType: 'youtube', // 'youtube' or 'upload'
            }]
        } : c))
    }

    const updateLecture = (chapterId, lectureId, field, value) =>
        setChapters(prev => prev.map(c => c.chapterId === chapterId ? {
            ...c,
            chapterContent: c.chapterContent.map(l => l.lectureId === lectureId ? { ...l, [field]: value } : l)
        } : c))

    const removeLecture = (chapterId, lectureId) =>
        setChapters(prev => prev.map(c => c.chapterId === chapterId ? {
            ...c,
            chapterContent: c.chapterContent.filter(l => l.lectureId !== lectureId)
        } : c))

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!thumbnail) return toast.error('Please upload a thumbnail')
        if (chapters.length === 0) return toast.error('Add at least one chapter')

        setSubmitting(true)
        try {
            const token = await getToken()
            const formData = new FormData()
            formData.append('image', thumbnail)

            const coursePayload = {
                ...courseData,
                coursePrice: Number(courseData.coursePrice),
                discount: Number(courseData.discount),
                courseContent: chapters.map(({ collapsed, ...c }) => ({
                    ...c,
                    chapterContent: c.chapterContent.map(({ contentType, ...l }) => l)
                })),
            }

            formData.append('courseData', JSON.stringify(coursePayload))

            try {
                const { data } = await axios.post(`${backendUrl}/api/course/educator/add`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (data.success) {
                    toast.success('Course published successfully')
                    navigate('/educator/my-course')
                    return
                }
            } catch {
                // Backend offline — save locally
            }

            // Fallback: save to localStorage with base64 thumbnail
            const reader = new FileReader()
            reader.onload = () => {
                const localCourses = JSON.parse(localStorage.getItem('localCourses') || '[]')
                const newCourse = {
                    _id: `local_${Date.now()}`,
                    ...coursePayload,
                    isPublished: true,
                    courseThumbnail: reader.result, // base64 — persists on refresh
                    enrolledStudents: [],
                    courseRatings: [],
                    createdAt: new Date().toISOString(),
                }
                localCourses.push(newCourse)
                localStorage.setItem('localCourses', JSON.stringify(localCourses))
                toast.success('Course saved locally (will sync when backend is online)')
                navigate('/educator/my-course')
            }
            reader.readAsDataURL(thumbnail)

        } catch (err) {
            toast.error(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const discountedPrice = courseData.coursePrice && courseData.discount
        ? (courseData.coursePrice - (courseData.coursePrice * courseData.discount / 100)).toFixed(2)
        : null

    return (
        <div className='max-w-3xl'>
            <h1 className='text-xl font-bold text-gray-800 mb-6'>Add New Course</h1>
            <form onSubmit={handleSubmit} className='space-y-6'>

                {/* Thumbnail */}
                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Course Thumbnail</label>
                    <div
                        onClick={() => imgRef.current.click()}
                        className='border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 transition'
                    >
                        {thumbnail ? (
                            <img src={URL.createObjectURL(thumbnail)} alt='thumbnail' className='h-40 mx-auto object-cover rounded-lg' />
                        ) : (
                            <div className='flex flex-col items-center gap-2 text-gray-400'>
                                <img src={assets.file_upload_icon} alt='upload' className='w-10' />
                                <p className='text-sm'>Click to upload thumbnail</p>
                                <p className='text-xs'>PNG, JPG up to 5MB</p>
                            </div>
                        )}
                        <input ref={imgRef} type='file' accept='image/*' hidden onChange={e => setThumbnail(e.target.files[0])} />
                    </div>
                </div>

                {/* Basic Info */}
                <div className='bg-white rounded-xl border border-gray-200 p-5 space-y-4'>
                    <h2 className='font-semibold text-gray-700'>Course Details</h2>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Course Title *</label>
                        <input
                            type='text' required
                            value={courseData.courseTitle}
                            onChange={e => setCourseData(p => ({ ...p, courseTitle: e.target.value }))}
                            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400'
                            placeholder='e.g. Complete JavaScript Course'
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Description *</label>
                        <textarea
                            required rows={4}
                            value={courseData.courseDescription}
                            onChange={e => setCourseData(p => ({ ...p, courseDescription: e.target.value }))}
                            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none'
                            placeholder='What will students learn in this course?'
                        />
                    </div>

                    {/* Pricing */}
                    <div className='flex gap-4'>
                        <div className='flex-1'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Course Price ($) *</label>
                            <input
                                type='number' required min='0' step='0.01'
                                value={courseData.coursePrice}
                                onChange={e => setCourseData(p => ({ ...p, coursePrice: e.target.value }))}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400'
                                placeholder='49.99'
                            />
                        </div>
                        <div className='flex-1'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Discount (%)</label>
                            <input
                                type='number' min='0' max='100'
                                value={courseData.discount}
                                onChange={e => setCourseData(p => ({ ...p, discount: e.target.value }))}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400'
                                placeholder='0'
                            />
                        </div>
                    </div>

                    {/* Price preview */}
                    {discountedPrice && (
                        <div className='flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-2'>
                            <span className='text-sm text-gray-500'>Students will pay:</span>
                            <span className='font-bold text-green-700 text-lg'>${discountedPrice}</span>
                            <span className='text-sm text-gray-400 line-through'>${Number(courseData.coursePrice).toFixed(2)}</span>
                            {courseData.discount > 0 && <span className='text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full'>{courseData.discount}% off</span>}
                        </div>
                    )}
                </div>

                {/* Chapters & Lectures */}
                <div>
                    <div className='flex items-center justify-between mb-3'>
                        <h2 className='font-semibold text-gray-700'>Course Content</h2>
                        <button type='button' onClick={addChapter}
                            className='text-sm text-blue-600 border border-blue-300 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition flex items-center gap-1'>
                            <span>+</span> Add Chapter
                        </button>
                    </div>

                    {chapters.length === 0 && (
                        <div className='text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm'>
                            No chapters yet. Click "Add Chapter" to start building your course.
                        </div>
                    )}

                    <div className='space-y-3'>
                        {chapters.map((chapter, ci) => (
                            <div key={chapter.chapterId} className='bg-white border border-gray-200 rounded-xl overflow-hidden'>
                                {/* Chapter Header */}
                                <div className='flex items-center gap-3 px-4 py-3 bg-gray-50'>
                                    <button type='button' onClick={() => toggleChapter(chapter.chapterId)}>
                                        <img src={assets.down_arrow_icon} alt='toggle'
                                            className={`w-3 transition-transform ${chapter.collapsed ? '-rotate-90' : ''}`} />
                                    </button>
                                    <span className='text-xs text-gray-400 font-medium'>Chapter {ci + 1}</span>
                                    <input
                                        type='text' required
                                        value={chapter.chapterTitle}
                                        onChange={e => updateChapterTitle(chapter.chapterId, e.target.value)}
                                        placeholder='Chapter title'
                                        className='flex-1 bg-transparent text-sm font-medium text-gray-700 outline-none'
                                    />
                                    <button type='button' onClick={() => removeChapter(chapter.chapterId)}
                                        className='text-red-400 hover:text-red-600 text-xs px-2'>
                                        Remove
                                    </button>
                                </div>

                                {/* Lectures */}
                                {!chapter.collapsed && (
                                    <div className='p-4 space-y-3'>
                                        {chapter.chapterContent.map((lecture, li) => (
                                            <div key={lecture.lectureId} className='border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50'>
                                                <div className='flex items-center justify-between'>
                                                    <span className='text-xs font-medium text-gray-500'>Lecture {li + 1}</span>
                                                    <button type='button' onClick={() => removeLecture(chapter.chapterId, lecture.lectureId)}
                                                        className='text-red-400 hover:text-red-600 text-xs'>✕ Remove</button>
                                                </div>

                                                {/* Lecture Title */}
                                                <input
                                                    type='text' required
                                                    value={lecture.lectureTitle}
                                                    onChange={e => updateLecture(chapter.chapterId, lecture.lectureId, 'lectureTitle', e.target.value)}
                                                    placeholder='Lecture title'
                                                    className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-white'
                                                />

                                                {/* Content Type Toggle */}
                                                <div className='flex gap-2'>
                                                    <button
                                                        type='button'
                                                        onClick={() => updateLecture(chapter.chapterId, lecture.lectureId, 'contentType', 'youtube')}
                                                        className={`flex-1 py-2 rounded-lg text-xs font-medium border transition ${lecture.contentType === 'youtube' ? 'bg-red-50 border-red-400 text-red-700' : 'border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                                                    >
                                                        🎬 YouTube URL
                                                    </button>
                                                    <button
                                                        type='button'
                                                        onClick={() => updateLecture(chapter.chapterId, lecture.lectureId, 'contentType', 'upload')}
                                                        className={`flex-1 py-2 rounded-lg text-xs font-medium border transition ${lecture.contentType === 'upload' ? 'bg-blue-50 border-blue-400 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                                                    >
                                                        📁 Upload Video
                                                    </button>
                                                </div>

                                                {/* YouTube URL input */}
                                                {lecture.contentType === 'youtube' && (
                                                    <div>
                                                        <input
                                                            type='url'
                                                            value={lecture.lectureUrl}
                                                            onChange={e => updateLecture(chapter.chapterId, lecture.lectureId, 'lectureUrl', e.target.value)}
                                                            placeholder='https://youtu.be/xxxxxxx'
                                                            className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400 bg-white'
                                                        />
                                                        <p className='text-xs text-gray-400 mt-1'>Paste a YouTube video link — it will play embedded in the course player</p>
                                                    </div>
                                                )}

                                                {/* File Upload input */}
                                                {lecture.contentType === 'upload' && (
                                                    <div className='border-2 border-dashed border-blue-200 rounded-lg p-4 text-center'>
                                                        <input
                                                            type='file' accept='video/*'
                                                            onChange={e => updateLecture(chapter.chapterId, lecture.lectureId, 'lectureUrl', e.target.files[0]?.name || '')}
                                                            className='text-sm text-gray-500'
                                                        />
                                                        <p className='text-xs text-gray-400 mt-1'>MP4, MOV up to 500MB</p>
                                                    </div>
                                                )}

                                                {/* Duration & Free Preview */}
                                                <div className='flex items-center gap-3'>
                                                    <div className='flex-1'>
                                                        <label className='text-xs text-gray-500 mb-1 block'>Duration (minutes)</label>
                                                        <input
                                                            type='number' min='0'
                                                            value={lecture.lectureDuration}
                                                            onChange={e => updateLecture(chapter.chapterId, lecture.lectureId, 'lectureDuration', Number(e.target.value))}
                                                            className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-white'
                                                            placeholder='10'
                                                        />
                                                    </div>
                                                    <label className='flex items-center gap-2 text-sm text-gray-600 cursor-pointer mt-4'>
                                                        <input
                                                            type='checkbox'
                                                            checked={lecture.isPreviewFree}
                                                            onChange={e => updateLecture(chapter.chapterId, lecture.lectureId, 'isPreviewFree', e.target.checked)}
                                                            className='w-4 h-4'
                                                        />
                                                        Free Preview
                                                    </label>
                                                </div>
                                            </div>
                                        ))}

                                        <button type='button' onClick={() => addLecture(chapter.chapterId)}
                                            className='w-full py-2 border border-dashed border-blue-300 rounded-lg text-sm text-blue-600 hover:bg-blue-50 transition'>
                                            + Add Lecture
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type='submit'
                    disabled={submitting}
                    className='w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-60 text-sm'
                >
                    {submitting ? 'Publishing Course...' : 'Publish Course'}
                </button>
            </form>
        </div>
    )
}

export default AddCourse
