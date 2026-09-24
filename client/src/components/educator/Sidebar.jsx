import { NavLink } from 'react-router-dom'
import { assets } from '../../assets/assets'

const links = [
    { to: '/educator', label: 'Dashboard', icon: assets.home_icon, end: true },
    { to: '/educator/add-course', label: 'Add Course', icon: assets.add_icon },
    { to: '/educator/my-course', label: 'My Courses', icon: assets.my_course_icon },
    { to: '/educator/student-enrolled', label: 'Student Progress', icon: assets.person_tick_icon },
]

const Sidebar = () => {
    return (
        <div className='w-16 md:w-60 border-r border-gray-200 bg-white min-h-screen flex-shrink-0 pt-2'>
            {links.map(link => (
                <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 text-sm transition hover:bg-blue-50 ${isActive ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600 font-medium' : 'text-gray-600'}`
                    }
                >
                    <img src={link.icon} alt={link.label} className='w-5 flex-shrink-0' />
                    <span className='hidden md:block'>{link.label}</span>
                </NavLink>
            ))}
        </div>
    )
}

export default Sidebar
