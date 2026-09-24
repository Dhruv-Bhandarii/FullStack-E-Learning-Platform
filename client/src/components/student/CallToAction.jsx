import { Link } from 'react-router-dom'

const CallToAction = () => {
    return (
        <div className='px-4 sm:px-10 md:px-14 lg:px-36 py-16 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-center'>
            <h2 className='text-2xl md:text-3xl font-bold mb-3'>Start Learning Today</h2>
            <p className='text-blue-100 text-sm mb-6 max-w-xl mx-auto'>
                Join thousands of students already learning on our platform. Get unlimited access to all courses.
            </p>
            <div className='flex items-center justify-center gap-4 flex-wrap'>
                <Link to='/course-list' className='bg-white text-blue-600 font-semibold px-6 py-3 rounded-full hover:bg-blue-50 transition'>
                    Explore Courses
                </Link>
            </div>
        </div>
    )
}

export default CallToAction
