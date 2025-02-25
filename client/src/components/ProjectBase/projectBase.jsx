import './projectBase.css'
import Header from "../Header/header.jsx";

import projectIcon from '../../assets/images/project big.svg'
import {useEffect, useState} from "react";
import {Link, Outlet, useParams} from "react-router-dom";
import axios from "axios";
import {GET} from "../../utils/methods.jsx";
import {checkResponse} from "../../utils/response.jsx";

export default function ProjectBase() {
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
            <Header image={project.icon ? project.icon : projectIcon} header_image={project.header_image}
                    top_content={<>
                        <div className="project">
                            <h1 className='project__info__name' id='project_page_name'>{project.name}</h1>
                            <div className="project__info">
                                {
                                    project.start_date || project.end_date ?
                                        <>
                                            <div className="project__info__incolumn">
                                                {
                                                    project.start_date ?
                                                        <>
                                                            <p className='project__info__text'>
                                                                <b>Дата начала:</b> <span
                                                                id='project_page_start_date'>{project.start_date}</span>
                                                            </p>
                                                        </> : ''
                                                }
                                                {
                                                    project.end_date ?
                                                        <>
                                                            <p className='project__info__text'>
                                                                <b>Дата окончания:</b> <span
                                                                id='project_page_end_date'>{project.end_date}</span>
                                                            </p>
                                                        </> : ''
                                                }
                                            </div>
                                        </> : ''
                                }
                                <div className="project__info__incolumn">
                                    <p className='project__info__text'>
                                        <b>Количество задач:</b> <span
                                        id='project_page_total_tasks'>{project.total_tasks}</span>
                                    </p>
                                    <p className='project__info__text'>
                                        <b>Количество выполненных задач:</b> <span
                                        id='project_page_completed_tasks'>{project.completed_tasks}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>}
                    bottom_content={<>
                        <Link className='widget default_button hoverEffect project_pages_button'
                              to={`/project/${project.id}/tasks/`}>Задачи</Link>
                        <Link className='widget default_button hoverEffect project_pages_button'
                              to={`/project/${project.id}/members/`}>Участники</Link>
                        {
                            project.description ? <>
                                <Link className='widget default_button hoverEffect project_pages_button'
                                      to={`/project/${project.id}/description/`}>Описание проекта</Link>
                            </> : ''
                        }
                    </>}/>
            <Outlet context={{ project: project }}/>
        </>
    )
}