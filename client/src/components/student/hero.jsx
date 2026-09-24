import { assets } from '../../assets/assets'
import SearchBar from './SearchBar'

const Hero = () => {
    return (
        <div className='flex flex-col items-center justify-center text-center bg-gradient-to-b from-cyan-100/70 to-white px-6 py-20 gap-6'>
            <h1 className='text-3xl md:text-5xl font-bold text-gray-800 max-w-3xl leading-tight'>
                Empower Your Future with the Right Skills
            </h1>
            <p className='text-gray-500 max-w-xl text-sm md:text-base'>
                Learn from expert instructors. Access hundreds of courses in programming, design, business, and more.
            </p>
            <SearchBar />
            <div className='flex items-center gap-6 mt-2 text-sm text-gray-500'>
                <span>✓ Expert Instructors</span>
                <span>✓ Lifetime Access</span>
                <span>✓ Certificate of Completion</span>
            </div>
        </div>
    )
}

export default Hero
