import { useContext, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { UserButton, useUser } from '@clerk/clerk-react'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import RoleModal from './RoleModal'

const Navbar = () => {
    const { isSignedIn, user } = useUser()
    const { isEducator, isAdmin } = useContext(AppContext)
    const [showRoleModal, setShowRoleModal] = useState(false)
    const location = useLocation()

    const isCourseListPage = location.pathname.includes('/course-list')
    const displayName = user?.fullName || user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || ''

    return (
        <>
            {showRoleModal && <RoleModal onClose={() => setShowRoleModal(false)} />}
            <div className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-300 py-4 ${isCourseListPage ? 'bg-white' : 'bg-cyan-100/70'}`}>
                <Link to='/'>
                    <img src={assets.logo} alt="logo" className='w-28 lg:w-32 cursor-pointer' />
                </Link>

                {/* Desktop */}
                <div className='hidden md:flex items-center gap-4 text-gray-500 text-sm'>
                    {isSignedIn ? (
                        <>
                            {/* Instructor links */}
                            {isEducator && !isAdmin && (
                                <>
                                    <Link to='/educator' className='hover:text-blue-600 transition'>Dashboard</Link>
                                    <span className='text-gray-300'>|</span>
                                    <Link to='/educator/my-course' className='hover:text-blue-600 transition'>My Courses</Link>
                                    <span className='text-gray-300'>|</span>
                                    <Link to='/educator/add-course' className='bg-blue-600 text-white px-4 py-1.5 rounded-full hover:bg-blue-700 transition'>
                                        + Add Course
                                    </Link>
                                    <span className='text-gray-300'>|</span>
                                    <Link to='/educator/student-enrolled' className='hover:text-blue-600 transition'>Student Progress</Link>
                                </>
                            )}

                            {/* Admin links */}
                            {isAdmin && (
                                <Link to='/admin' className='hover:text-blue-600 transition'>Admin Dashboard</Link>
                            )}

                            {/* Student links */}
                            {!isEducator && !isAdmin && (
                                <>
                                    <Link to='/my-enrollments' className='hover:text-blue-600 transition'>My Enrollments</Link>
                                    <span className='text-gray-300'>|</span>
                                    <Link to='/course-list' className='hover:text-blue-600 transition'>Browse Courses</Link>
                                </>
                            )}

                            {/* Username + avatar + profile */}
                            <div className='flex items-center gap-2'>
                                <span className='text-gray-700 font-medium text-sm'>{displayName}</span>
                                <UserButton afterSignOutUrl='/' />
                                <Link to='/profile' className='text-xs text-gray-500 hover:text-blue-600 transition border border-gray-200 px-3 py-1.5 rounded-full'>
                                    My Profile
                                </Link>
                            </div>
                        </>
                    ) : (
                        <button
                            onClick={() => setShowRoleModal(true)}
                            className='bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition'
                        >
                            Login
                        </button>
                    )}
                </div>

                {/* Mobile */}
                <div className='md:hidden flex items-center gap-2'>
                    {isSignedIn ? (
                        <>
                            <span className='text-xs text-gray-600 font-medium'>{displayName}</span>
                            <UserButton afterSignOutUrl='/' />
                        </>
                    ) : (
                        <button onClick={() => setShowRoleModal(true)} className='bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm'>Login</button>
                    )}
                </div>
            </div>
        </>
    )
}

export default Navbar
