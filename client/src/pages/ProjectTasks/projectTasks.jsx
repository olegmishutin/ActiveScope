import './projectTasks.css'
import {useParams} from "react-router-dom";
import ProjectBase from "../../components/ProjectBase/projectBase.jsx";
import {useEffect, useState} from "react";
import axios from "axios";
import {GET} from "../../utils/methods.jsx";
import {checkResponse} from "../../utils/response.jsx";
import Button from "../../widgets/Button/button.jsx";
import Filters from "../../components/Filters/filters.jsx";
import Textbox from "../../widgets/Textbox/textbox.jsx";
import Dropdown from "../../widgets/Dropdown/dropdown.jsx";
import Checkbox from "../../widgets/Checkbox/checkbox.jsx";
import ListElement from "../../components/ListElement/listElement.jsx";
import task_icon from '../../assets/images/project.svg'
import {getFilters} from "../../utils/data.jsx";

export default function ProjectTasks() {
    let {id} = useParams()
    const [project, setProject] = useState({})
    const [tasks, setTasks] = useState([])
    const [members, setMembers] = useState([])
    const [statuses, setStatuses] = useState([])
    const [priorities, setPriorities] = useState([])

    function getTasks() {
        let url = `/api/projects/${id}/tasks/`
        url = getFilters(url, [
            'start_date',
            'end_date',
            'dropdown_executor',
            'dropdown_status',
            'dropdown_priority'
        ])

        axios(GET(url)).then(
            (response) => {
                checkResponse(response, setTasks, response.data)
            }
        ).catch((error) => {
            checkResponse(error.response)
        })
    }

    useEffect(() => {
        axios(GET(`/api/projects/${id}/`)).then(
            (response) => {
                checkResponse(response, setProject, response.data)
            }
        ).catch((error) => {
            checkResponse(error.response)
        })

        axios(GET(`/api/projects/${id}/members/`)).then(
            (response) => {
                checkResponse(response, setMembers, response.data)
            }
        ).catch((error) => {
            checkResponse(error.response)
        })

        axios(GET(`/api/projects/${id}/statuses/`)).then(
            (response) => {
                checkResponse(response, setStatuses, response.data)
            }
        ).catch((error) => {
            checkResponse(error.response)
        })

        axios(GET(`/api/projects/${id}/priorities/`)).then(
            (response) => {
                checkResponse(response, setPriorities, response.data)
            }
        ).catch((error) => {
            checkResponse(error.response)
        })

        getTasks()
    }, [id]);

    return (
        <>
            <ProjectBase project={project}/>
            <div className="window_main_content">
                <div className="project_task_manage_buttons">
                    <Button>Создать задачу</Button>
                    <Button>Сатусы</Button>
                    <Button>Приоритеты</Button>
                </div>
                <Filters filterEvent={getTasks}>
                    <Textbox id='start_date' type='date' label='Дата начала'/>
                    <Textbox id='end_date' type='date' label='Дата окончания'/>
                    <Dropdown id='dropdown_executor' name='Исполнитель' style={{zIndex: 5}}>
                        {
                            members.map((member) => {
                                return (
                                    <>
                                        <Checkbox splash={true}
                                                  id={`checkbox_executor_${member.id}`}>{member.get_full_name}</Checkbox>
                                    </>
                                )
                            })
                        }
                    </Dropdown>
                    <Dropdown id='dropdown_status' name='Статус' style={{zIndex: 4}}>
                        {
                            statuses.map((status) => {
                                return (
                                    <>
                                        <Checkbox splash={true} id={`checkbox_status_${status.id}`}
                                                  background_color={`#${status.color}`}>{status.name}</Checkbox>
                                    </>
                                )
                            })
                        }
                    </Dropdown>
                    <Dropdown id='dropdown_priority' name='Приоритет' style={{zIndex: 3}}>
                        {
                            priorities.map((priority) => {
                                return (
                                    <>
                                        <Checkbox splash={true} id={`checkbox_priority_${priority.id}`}
                                                  background_color={`#${priority.color}`}>{priority.name}</Checkbox>
                                    </>
                                )
                            })
                        }
                    </Dropdown>
                </Filters>
                <ul className='project_tasks_list'>
                    {tasks.map((task) => {
                        return (
                            <>
                                <ListElement defaultIcon={task_icon} headerText={task.name} text={task.description}
                                             additionalButtons={<>
                                                 <Button className='light_button'>Комментарии</Button>
                                                 <Button className='light_button'>Файлы</Button>
                                                 <Button className='light_button'>Изменить</Button>
                                             </>}>
                                    {
                                        task.executor ?
                                            <>
                                                <p className='list_element__header__text'>
                                                    Исполнитель: <span
                                                    className='list_element__header__text__important'>
                                                        {task.executor}
                                                    </span>
                                                </p>
                                            </> : ''
                                    }
                                    {
                                        task.start_date ?
                                            <>
                                                <p className='list_element__header__text'>
                                                    Дата начала: <span
                                                    className='list_element__header__text__important'>
                                                        {task.start_date}
                                                    </span>
                                                </p>
                                            </> : ''
                                    }
                                    {
                                        task.end_date ?
                                            <>
                                                <p className='list_element__header__text'>
                                                    Дата окончания: <span
                                                    className='list_element__header__text__important'>
                                                        {task.end_date}
                                                    </span>
                                                </p>
                                            </> : ''
                                    }
                                    {
                                        task.status ?
                                            <>
                                                <div className="project_task_status"
                                                     style={{backgroundColor: `#${task.status.color}`}}>
                                                    {task.status.name}
                                                </div>
                                            </> : ''
                                    }
                                    {
                                        task.priority ?
                                            <>
                                                <div className="project_task_priority"
                                                     style={{backgroundColor: `#${task.priority.color}`}}>
                                                    {task.priority.name}
                                                </div>
                                            </> : ''
                                    }
                                </ListElement>
                            </>
                        )
                    })}
                </ul>
            </div>
        </>
    )
}