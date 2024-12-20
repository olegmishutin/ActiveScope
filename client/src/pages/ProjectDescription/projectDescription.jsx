import './projectDescription.css'
import {useParams} from "react-router-dom";
import ProjectBase from "../../components/ProjectBase/projectBase.jsx";
import {useEffect, useState} from "react";
import axios from "axios";
import {GET} from "../../utils/methods.jsx";
import {checkResponse} from "../../utils/response.jsx";

export default function ProjectDescription(){
    let {id} = useParams()
    const [project, setProject] = useState({})

    useEffect(() => {
        axios(GET(`/api/projects/${id}/`)).then(
            (response) => {
                checkResponse(response, setProject, response.data)
            }
        ).catch((error) => {
            checkResponse(error.response)
        })
    }, [id]);

    return (
        <>
            <ProjectBase project={project}/>
            <div className="window_main_content">
                <p className='project_description' id='project_page_description'>{project.description}</p>
            </div>
        </>
    )
}