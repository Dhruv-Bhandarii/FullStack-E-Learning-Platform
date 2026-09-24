import { assets } from '../../assets/assets'

const Companies = () => {
    const logos = [
        assets.microsoft_logo, assets.accenture_logo,
        assets.adobe_logo, assets.paypal_logo, assets.walmart_logo
    ]

    return (
        <div className='px-4 sm:px-10 md:px-14 lg:px-36 py-10 bg-gray-50'>
            <p className='text-center text-gray-500 text-sm mb-6'>Trusted by learners from top companies</p>
            <div className='flex flex-wrap items-center justify-center gap-8 md:gap-14'>
                {logos.map((logo, i) => (
                    <img key={i} src={logo} alt='company' className='h-6 opacity-60 grayscale hover:grayscale-0 transition' />
                ))}
            </div>
        </div>
    )
}

export default Companies
