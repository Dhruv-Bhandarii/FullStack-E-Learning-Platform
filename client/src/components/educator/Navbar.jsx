import { UserButton, useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { assets } from '../../assets/assets'

const Navbar = () => {
    const { user } = useUser()
    const displayName = user?.fullName || user?.firstName || ''

    return (
        <div className='flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white'>
            <Link to='/'>
                <img src={assets.logo} alt='logo' className='w-24' />
            </Link>
            <div className='flex items-center gap-3'>
                <span className='text-sm text-gray-500'>Instructor Dashboard</span>
                <Link to='/profile' className='text-xs text-gray-500 hover:text-blue-600 border border-gray-200 px-3 py-1.5 rounded-full transition'>
                    My Profile
                </Link>
                <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium text-gray-700'>{displayName}</span>
                    <UserButton afterSignOutUrl='/' />
                </div>
            </div>
        </div>
    )
}

export default Navbar
