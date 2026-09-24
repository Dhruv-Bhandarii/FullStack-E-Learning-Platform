import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets'

const SearchBar = ({ defaultValue = '' }) => {
    const [query, setQuery] = useState(defaultValue)
    const navigate = useNavigate()

    const handleSearch = (e) => {
        e.preventDefault()
        if (query.trim()) navigate(`/course-list/${query.trim()}`)
    }

    return (
        <form onSubmit={handleSearch} className='flex items-center bg-white rounded-full shadow-md overflow-hidden w-full max-w-xl'>
            <img src={assets.search_icon} alt='search' className='w-5 ml-4 opacity-50' />
            <input
                type='text'
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder='Search for courses...'
                className='flex-1 px-4 py-3 text-sm outline-none text-gray-700'
            />
            <button type='submit' className='bg-blue-600 text-white px-6 py-3 text-sm font-medium hover:bg-blue-700 transition'>
                Search
            </button>
        </form>
    )
}

export default SearchBar
