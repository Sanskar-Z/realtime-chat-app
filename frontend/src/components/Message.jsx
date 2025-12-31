import React from 'react'

const Message = (props) => {
return (
    <div className='p-2 bg-gray-200 rounded-xl m-1.5'>
            <h1 className='font-semibold'>{props.user}</h1>
            <p>{'\u00A0     '}{props.message}</p>
    </div>
)
}

export default Message
