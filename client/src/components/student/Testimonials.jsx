import { assets, dummyTestimonial } from '../../assets/assets'
import Rating from './Rating'

const Testimonials = () => {
    return (
        <div className='px-4 sm:px-10 md:px-14 lg:px-36 py-16 bg-white'>
            <div className='text-center mb-10'>
                <h2 className='text-2xl md:text-3xl font-bold text-gray-800'>What Our Students Say</h2>
                <p className='text-gray-500 text-sm mt-2'>Real feedback from real learners</p>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {dummyTestimonial.map((t, i) => (
                    <div key={i} className='border border-gray-200 rounded-xl p-6 hover:shadow-md transition'>
                        <div className='flex items-center gap-3 mb-4'>
                            <img src={t.image} alt={t.name} className='w-10 h-10 rounded-full object-cover' />
                            <div>
                                <p className='font-semibold text-gray-800 text-sm'>{t.name}</p>
                                <p className='text-xs text-gray-500'>{t.role}</p>
                            </div>
                        </div>
                        <Rating rating={t.rating} />
                        <p className='text-gray-600 text-sm mt-3 leading-relaxed'>{t.feedback}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Testimonials
