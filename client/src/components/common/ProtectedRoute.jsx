import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { AppContext } from '../context/AppContext'
import Loading from './student/Loading'

// Requires login
export const RequireAuth = ({ children }) => {
    const { isSignedIn, isLoaded } = useUser()
    if (!isLoaded) return <Loading />
    if (!isSignedIn) return <Navigate to='/' replace />
    return children
}

// Educator/Instructor only
export const RequireEducator = ({ children }) => {
    const { isSignedIn, isLoaded } = useUser()
    const { isEducator, isAdmin } = useContext(AppContext)
    if (!isLoaded) return <Loading />
    if (!isSignedIn) return <Navigate to='/' replace />
    if (!isEducator && !isAdmin) return <Navigate to='/course-list' replace />
    return children
}

// Admin only
export const RequireAdmin = ({ children }) => {
    const { isSignedIn, isLoaded } = useUser()
    const { isAdmin } = useContext(AppContext)
    if (!isLoaded) return <Loading />
    if (!isSignedIn) return <Navigate to='/' replace />
    if (!isAdmin) return <Navigate to='/' replace />
    return children
}
