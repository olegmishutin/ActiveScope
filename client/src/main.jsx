import './main.css'

import {createRoot} from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'

import Login from "./pages/Login/login.jsx"
import Registration from "./pages/Registration/registration.jsx"
import Index from "./pages/Index/index.jsx"
import Profile from "./pages/Profile/profile.jsx"
import UserTasks from "./pages/UserTasks/userTasks.jsx"

const router = createBrowserRouter([
    {
        path: 'registration/',
        element: <Registration/>
    },
    {
        path: 'login/',
        element: <Login/>
    },
    {
        path: '/',
        element: <Index/>,
        children: [
            {
                path: '/',
                element: <UserTasks/>
            },
            {
                path: 'users/:id',
                element: <Profile/>
            },
            {
                path: '404/',
                element: <h1>Не найдено</h1>
            }
        ]
    }
])

createRoot(document.getElementById('root')).render(
    <RouterProvider router={router}/>
)
