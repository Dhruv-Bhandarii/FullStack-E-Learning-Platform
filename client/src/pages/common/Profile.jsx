import { useContext, useEffect, useRef, useState } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const Profile = () => {
    const { user, isSignedIn } = useUser()
    const { openUserProfile } = useClerk()
    const { backendUrl, getToken, isEducator, isAdmin, fetchUserData } = useContext(AppContext)
    const navigate = useNavigate()

    const [name, setName] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (user) {
            setName(user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim())
        }
    }, [user])

    if (!isSignedIn) {
        navigate('/')
        return null
    }

    const getRoleBadge = () => {
        if (isAdmin) return { label: 'Admin', color: 'bg-purple-100 text-purple-700' }
        if (isEducator) return { label: 'Instructor', color: 'bg-green-100 text-green-700' }
        return { label: 'Student', color: 'bg-blue-100 text-blue-700' }
    }

    const badge = getRoleBadge()

    const handleSaveName = async () => {
        if (!name.trim()) return toast.error('Name cannot be empty')
        setSaving(true)
        try {
            // Update in Clerk
            const parts = name.trim().split(' ')
            await user.update({
                firstName: parts[0],
                lastName: parts.slice(1).join(' ') || '',
            })

            // Sync to our backend
            try {
                const token = await getToken()
                await axios.patch(`${backendUrl}/api/user/update-name`,
                    { name: name.trim() },
                    { headers: { Authorization: `Bearer ${token}` } }
                )
                await fetchUserData()
            } catch { }

            // Update local student info for progress tracking
            const localStudentInfo = JSON.parse(localStorage.getItem('localStudentInfo') || '{}')
            localStorage.setItem('localStudentInfo', JSON.stringify({
                ...localStudentInfo,
                name: name.trim(),
            }))

            toast.success('Name updated successfully')
        } catch (err) {
            toast.error(err.message || 'Could not update name')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className='min-h-screen bg-gray-50 px-4 py-10'>
            <div className='max-w-xl mx-auto'>
                <h1 className='text-2xl font-bold text-gray-800 mb-6'>My Profile</h1>

                <div className='bg-white rounded-2xl border border-gray-200 overflow-hidden'>
                    {/* Header */}
                    <div className='bg-gradient-to-r from-blue-600 to-cyan-500 h-24'></div>

                    {/* Avatar */}
                    <div className='px-6 pb-6'>
                        <div className='flex items-end justify-between -mt-12 mb-4'>
                            <div className='relative'>
                                <img
                                    src={user?.imageUrl}
                                    alt={name}
                                    className='w-20 h-20 rounded-full border-4 border-white object-cover shadow'
                                />
                                <button
                                    onClick={() => openUserProfile()}
                                    className='absolute bottom-0 right-0 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-blue-700 transition'
                                    title='Change photo'
                                >
                                    ✎
                                </button>
                            </div>
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badge.color}`}>
                                {badge.label}
                            </span>
                        </div>

                        {/* Name */}
                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Display Name</label>
                            <div className='flex gap-2'>
                                <input
                                    type='text'
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className='flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400'
                                    placeholder='Your name'
                                />
                                <button
                                    onClick={handleSaveName}
                                    disabled={saving}
                                    className='bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-60'
                                >
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>

                        {/* Email (read-only) */}
                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
                            <input
                                type='text'
                                value={user?.emailAddresses?.[0]?.emailAddress || ''}
                                readOnly
                                className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed'
                            />
                        </div>

                        {/* Profile picture via Clerk */}
                        <div className='border-t border-gray-100 pt-4'>
                            <p className='text-sm text-gray-500 mb-3'>To change your profile picture or manage security settings:</p>
                            <button
                                onClick={() => openUserProfile()}
                                className='w-full border border-blue-300 text-blue-600 py-2.5 rounded-lg text-sm hover:bg-blue-50 transition font-medium'
                            >
                                Open Full Profile Settings
                            </button>
                        </div>
                    </div>
                </div>

                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className='mt-4 text-sm text-gray-400 hover:text-gray-600 transition'
                >
                    ← Go back
                </button>
            </div>
        </div>
    )
}

export default Profile
