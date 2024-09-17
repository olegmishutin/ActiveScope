import './main.css'

import {createRoot} from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'

import Login from "./pages/Login/login.jsx"
import Registration from "./pages/Registration/registration.jsx"
import Index from "./pages/Index/index.jsx"
import Profile from "./pages/Profile/profile.jsx"
import UserTasks from "./pages/UserTasks/userTasks.jsx"
import SearchUsers from "./pages/SearchUsers/searchUsers.jsx"
import Groups from "./pages/Groups/groups.jsx"

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
                path: "users/",
                element: <SearchUsers/>
            },
            {
                path: 'admin/users/',
                element: <SearchUsers isAdmin={true}/>
            },
            {
                path: 'users/:id',
                element: <Profile/>
            },
            {
                path: 'groups/',
                element: <Groups/>
            },
            {
                path: 'admin/groups/',
                element: <Groups isAdmin={true}/>
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
