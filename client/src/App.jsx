import { Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Home from './pages/students/Home'
import CourseList from './pages/students/CourseList'
import CourseDetails from './pages/students/CourseDetails'
import MyEnrollments from './pages/students/MyEnrollments'
import Player from './pages/students/Player'
import Loading from './components/common/Loading'
import Educator from './pages/educator/Educator'
import Dashboard from './pages/educator/Dashboard'
import AddCourse from './pages/educator/AddCourse'
import MyCourse from './pages/educator/MyCourse'
import StudentsEnrolled from './pages/educator/StudentsEnrolled'
import EditCourse from './pages/educator/EditCourse'
import Navbar from './components/student/Navbar'
import AdminDashboard from './pages/admin/AdminDashboard'
import Profile from './pages/Profile'
import { RequireAuth, RequireEducator, RequireAdmin } from './components/ProtectedRoute'

const App = () => {
  return (
    <div className='text-default min-h-screen bg-white'>
      <ToastContainer />
      <Routes>
        {/* Protected — Admin only */}
        <Route path='/admin' element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />

        {/* Protected — Educator only */}
        <Route path='/educator' element={<RequireEducator><Educator /></RequireEducator>}>
          <Route index element={<Dashboard />} />
          <Route path='add-course' element={<AddCourse />} />
          <Route path='my-course' element={<MyCourse />} />
          <Route path='student-enrolled' element={<StudentsEnrolled />} />
          <Route path='edit-course/:courseId' element={<EditCourse />} />
        </Route>

        {/* Student routes — shared Navbar */}
        <Route path='/*' element={
          <>
            <Navbar />
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/course-list' element={<CourseList />} />
              <Route path='/course-list/:input' element={<CourseList />} />
              <Route path='/course/:id' element={<CourseDetails />} />
              <Route path='/my-enrollments' element={<RequireAuth><MyEnrollments /></RequireAuth>} />
              <Route path='/player/:courseId' element={<RequireAuth><Player /></RequireAuth>} />
              <Route path='/loading/:path' element={<Loading />} />
              <Route path='/profile' element={<RequireAuth><Profile /></RequireAuth>} />
            </Routes>
          </>
        } />
      </Routes>
    </div>
  )
}

export default App
