import React from 'react'

const Ratings = ({rating}: {rating: number}) => {
    const stars = [];

    for (let i = 0; i < 5; i++) {
        if (i < rating) {
            stars.push(<span key={i} className='text-yellow-500'>★</span>);
        } else {
            stars.push(<span key={i} className='text-gray-300'>★</span>);
        }
    }

    return (
        <div className='flex items-center gap-1'>
            {stars}
        </div>
  )
}

export default Ratings