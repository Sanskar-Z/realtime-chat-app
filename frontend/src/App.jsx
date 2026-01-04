import {  } from 'react'
import './App.css'
import Chat from './pages/Chat'
import Register from './components/Register'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Chat/>
    },
  ])


  return (
    <div className='APP'>
    <RouterProvider router={router} />
    </div>
  )
}

export default App
