import './App.css'
import Chat from './pages/Chat'
import Register from './components/Register'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import RegisterUser from './components/RegisterUser'

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Chat/>
    },
    
    {
      path: "/register",
      element: <RegisterUser/>

    }
  ])


  return (
    <div className='APP'>
    <RouterProvider router={router} />
    </div>
  )
}

export default App
