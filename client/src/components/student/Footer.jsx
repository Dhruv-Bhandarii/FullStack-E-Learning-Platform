import { Link } from 'react-router-dom'
import { assets } from '../../assets/assets'

const Footer = () => {
    return (
        <footer className='bg-gray-900 text-gray-400 px-4 sm:px-10 md:px-14 lg:px-36 py-10'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-8'>
                <div>
                    <img src={assets.logo_dark} alt='logo' className='w-28 mb-3' />
                    <p className='text-sm leading-relaxed'>Empowering learners worldwide with quality education and expert-led courses.</p>
                    <div className='flex gap-3 mt-4'>
                        <img src={assets.facebook_icon} alt='facebook' className='w-5 cursor-pointer hover:opacity-80' />
                        <img src={assets.twitter_icon} alt='twitter' className='w-5 cursor-pointer hover:opacity-80' />
                        <img src={assets.instagram_icon} alt='instagram' className='w-5 cursor-pointer hover:opacity-80' />
                    </div>
                </div>
                <div>
                    <h4 className='text-white font-semibold mb-3'>Quick Links</h4>
                    <ul className='space-y-2 text-sm'>
                        <li><Link to='/' className='hover:text-white transition'>Home</Link></li>
                        <li><Link to='/course-list' className='hover:text-white transition'>Courses</Link></li>
                        <li><Link to='/my-enrollments' className='hover:text-white transition'>My Enrollments</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className='text-white font-semibold mb-3'>Contact</h4>
                    <ul className='space-y-2 text-sm'>
                        <li>support@eduera.com</li>
                        <li>+1 (555) 000-0000</li>
                    </ul>
                </div>
            </div>
            <div className='border-t border-gray-700 pt-6 text-center text-xs'>
                © {new Date().getFullYear()} EDUERA — A QuadTech Service. All rights reserved.
            </div>
        </footer>
    )
}

export default Footer
