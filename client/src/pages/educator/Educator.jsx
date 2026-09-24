import { Outlet } from 'react-router-dom'
import Navbar from '../../components/educator/Navbar'
import Sidebar from '../../components/educator/Sidebar'
import Footer from '../../components/educator/Footer'

const Educator = () => {
    return (
        <div className='flex flex-col min-h-screen'>
            <Navbar />
            <div className='flex flex-1'>
                <Sidebar />
                <div className='flex-1 flex flex-col'>
                    <div className='flex-1 p-6 bg-gray-50'>
                        <Outlet />
                    </div>
                    <Footer />
                </div>
            </div>
        </div>
    )
}

export default Educator
