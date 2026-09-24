import { assets } from '../../assets/assets'

const Rating = ({ rating }) => {
    return (
        <div className='flex items-center gap-1'>
            {[1, 2, 3, 4, 5].map(i => (
                <img key={i} src={i <= Math.round(rating) ? assets.star : assets.star_blank} alt='star' className='w-3.5' />
            ))}
        </div>
    )
}

export default Rating
