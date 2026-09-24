import { useClerk } from '@clerk/clerk-react'

const roles = [
    {
        key: 'student',
        label: 'Student',
        desc: 'Browse and enroll in courses',
        icon: '🎓',
        color: 'border-blue-400 hover:bg-blue-50',
        badge: 'bg-blue-100 text-blue-700',
    },
    {
        key: 'instructor',
        label: 'Instructor',
        desc: 'Create and manage your courses',
        icon: '📚',
        color: 'border-green-400 hover:bg-green-50',
        badge: 'bg-green-100 text-green-700',
    },
    {
        key: 'admin',
        label: 'Admin',
        desc: 'Platform administration access',
        icon: '🛡️',
        color: 'border-purple-400 hover:bg-purple-50',
        badge: 'bg-purple-100 text-purple-700',
    },
]

const RoleModal = ({ onClose }) => {
    const { openSignIn } = useClerk()

    const handleRoleSelect = (role) => {
        sessionStorage.setItem('selectedRole', role)
        onClose()
        openSignIn()
    }

    return (
        <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4' onClick={onClose}>
            <div className='bg-white rounded-2xl shadow-2xl w-full max-w-md p-6' onClick={e => e.stopPropagation()}>
                <div className='text-center mb-6'>
                    <h2 className='text-xl font-bold text-gray-800'>Login As</h2>
                    <p className='text-sm text-gray-500 mt-1'>Choose your role to continue</p>
                </div>
                <div className='space-y-3'>
                    {roles.map(role => (
                        <button
                            key={role.key}
                            onClick={() => handleRoleSelect(role.key)}
                            className={`w-full flex items-center gap-4 border-2 rounded-xl p-4 transition text-left ${role.color}`}
                        >
                            <span className='text-3xl'>{role.icon}</span>
                            <div className='flex-1'>
                                <div className='flex items-center gap-2'>
                                    <span className='font-semibold text-gray-800'>{role.label}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${role.badge}`}>{role.label}</span>
                                </div>
                                <p className='text-xs text-gray-500 mt-0.5'>{role.desc}</p>
                            </div>
                            <span className='text-gray-400'>→</span>
                        </button>
                    ))}
                </div>
                <button onClick={onClose} className='w-full mt-4 text-sm text-gray-400 hover:text-gray-600 transition'>
                    Cancel
                </button>
            </div>
        </div>
    )
}

export default RoleModal
