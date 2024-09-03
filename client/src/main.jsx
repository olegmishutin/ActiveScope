import './main.css'

import {createRoot} from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'

import Login from "./pages/Login/login.jsx"
import Registration from "./pages/Registration/registration.jsx"

const router = createBrowserRouter([
    {
        path: 'registration/',
        element: <Registration/>
    },
    {
        path: 'login/',
        element: <Login/>
    }
])

createRoot(document.getElementById('root')).render(
    <RouterProvider router={router}/>
)
