import './index.css'
import {Outlet} from "react-router-dom"

import SidePanel from "../../components/SidePanel/sidePanel.jsx"

export default function Index() {
    return (
        <>
            <main className='content'>
                <SidePanel/>
                <div className='content__main'>
                    <Outlet/>
                </div>
            </main>
        </>
    )
}