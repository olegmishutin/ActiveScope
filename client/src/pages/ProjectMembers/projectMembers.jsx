import './projectMembers.css'
import {useParams} from "react-router-dom";
import ProjectBase from "../../components/ProjectBase/projectBase.jsx";
import {useEffect, useState} from "react";
import axios from "axios";
import {GET} from "../../utils/methods.jsx";
import {checkResponse} from "../../utils/response.jsx";

export default function ProjectMembers(){
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
        </>
    )
}