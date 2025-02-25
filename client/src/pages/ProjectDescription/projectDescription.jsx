import './projectDescription.css'
import {useOutletContext} from "react-router-dom";

export default function ProjectDescription(){
    const {project} = useOutletContext()

    return (
        <>
            <div className="window_main_content">
                <p className='project_description' id='project_page_description'>{project.description}</p>
            </div>
        </>
    )
}