import './App.css'
import Chat from './pages/Chat'
import Register from './components/Register'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import RegisterUser from './components/RegisterUser'
import LoginUser from './components/LoginUser'

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Chat/>
    },
    
    {
      path: "/register",
      element: <RegisterUser/>

    },

    {
      path: "/login",
      element: <LoginUser/>
    }
  ])


  return (
    <div className='APP'>
    <RouterProvider router={router} />
    </div>
  )
}

export default App
