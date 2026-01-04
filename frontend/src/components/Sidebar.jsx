import React from 'react'

const Sidebar = () => {
  return (
    <>
        <div className='p-3 w-[30vw] h-[96vh] rounded-2xl bg-gray-50 border border-gray-200 shadow-md'>
            <p className='p-3 font-bold text-xl text-blue-600 bg-white shadow-sm rounded-lg'>ChatAPP</p>

            
            <div className='mt-2 p-3 flex-col gap-1.5   '>
                <h2 className="text-xl font-semibold mb-4">Online Users</h2>
            </div>
        </div>
    </>
  )
}

export default Sidebar
