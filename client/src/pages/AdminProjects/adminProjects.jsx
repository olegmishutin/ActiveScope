import './adminProjects.css'
import Textbox from "../../widgets/Textbox/textbox.jsx";
import Button from "../../widgets/Button/button.jsx";
import Filters from "../../components/Filters/filters.jsx";
import Ordering from "../../widgets/Ordering/ordering.jsx";
import {useEffect, useState} from "react";
import ListElement from "../../components/ListElement/listElement.jsx";
import axios from "axios";
import {DELETE, GET} from "../../utils/methods.jsx";
import {checkResponse} from "../../utils/response.jsx";
import projectDefaultIcon from '../../assets/images/project.svg'
import {Link} from "react-router-dom";
import {getFilters} from "../../utils/data.jsx";
import {checkConfirmation} from "../../utils/request.jsx";
import NoContent from "../../components/NoContent/noContent.jsx";

export default function AdminProjects() {
    const [projects, setProjects] = useState([])

    function getProjects() {
        let url = '/api/admin_projects/'
        url = getFilters(url, [
            'search',
            'min_tasks_count',
            'max_tasks_count',
            'ordering_total_tasks'
        ])

        axios(GET(url)).then(
            (response) => {
                checkResponse(response, setProjects, response.data)
            }
        ).catch((error) => {
            checkResponse(error.response)
        })
    }

    useEffect(() => {
        getProjects()
    }, []);

    return (
        <>
            <div className='admin_projects window_main_content'>
                <div className="admin_projects__search">
                    <Textbox id='search' className='admin_projects__search__textbox'
                             placeholder='Поиск по названию проекта'/>
                    <Button onClick={getProjects}>Искать</Button>
                </div>
                <Filters filterEvent={getProjects}>
                    <Textbox id='min_tasks_count' className='admin_projects__filters__textbox'
                             label='Минимальное кол-во задач'/>
                    <Textbox id='max_tasks_count' className='admin_projects__filters__textbox'
                             label='Максимальное кол-во задач'/>
                    <Ordering id='ordering_total_tasks'>Количество задач</Ordering>
                </Filters>
                {
                    projects.length > 0 ? <>
                        <ul className='admin_projects__list'>
                            {
                                projects.map((project) => {
                                    return (
                                        <>
                                            <ListElement icon={project.icon} defaultIcon={projectDefaultIcon}
                                                         detailName={'Задачи'} headerText={project.name}
                                                         text={project.description} detail={
                                                <>
                                                    <ul className='base_list'>
                                                        {project.tasks.map((task) => {
                                                            return (
                                                                <>
                                                                    <ListElement className='light_list_element'
                                                                                 defaultIcon={projectDefaultIcon}
                                                                                 headerText={task.name}
                                                                                 text={task.description}>
                                                                        {
                                                                            task.executor_id ?
                                                                                <Link to={`/users/${task.executor_id}/`}
                                                                                      className='list_element__header__text'>
                                                                                    Исполнитель: <span
                                                                                    className='list_element__header__text__important'>
                                                                                {task.executor}
                                                                            </span>
                                                                                </Link> : ''
                                                                        }
                                                                        {
                                                                            task.start_date ?
                                                                                <p className='list_element__header__text'>
                                                                                    Дата начала: <span
                                                                                    className='list_element__header__text__important'>
                                                                            {task.start_date}
                                                                        </span>
                                                                                </p> : ''
                                                                        }
                                                                        {
                                                                            task.end_date ?
                                                                                <p className='list_element__header__text'>
                                                                                    Дата окончания: <span
                                                                                    className='list_element__header__text__important'>
                                                                            {task.end_date}
                                                                        </span>
                                                                                </p> : ''
                                                                        }
                                                                    </ListElement>
                                                                </>
                                                            )
                                                        })}
                                                    </ul>
                                                </>
                                            }>
                                                <Link to={`/users/${project.owner_id}/`}
                                                      className='list_element__header__text'>
                                                    Основатель: <span
                                                    className='list_element__header__text__important'>
                                                {project.owner}
                                            </span>
                                                </Link>
                                                <p className='list_element__header__text'>
                                                    Количество задач: <span
                                                    className='list_element__header__text__important'>
                                                {project.total_tasks}
                                            </span>
                                                </p>
                                                <p className='list_element__header__text'>
                                                    Количество выполненных задач: <span
                                                    className='list_element__header__text__important'>
                                                {project.completed_tasks}
                                            </span>
                                                </p>
                                                <Button className='red_button' onClick={() => {
                                                    checkConfirmation(
                                                        'Уверены, что требуется удалить этот проект?',
                                                        () => {
                                                            axios(DELETE(`/api/admin_projects/${project.id}/`)).then(
                                                                (response) => {
                                                                    checkResponse(response, null, null, getProjects)
                                                                }
                                                            ).catch((error) => {
                                                                checkResponse(error.response)
                                                            })
                                                        }
                                                    )
                                                }}>Удалить</Button>
                                            </ListElement>
                                        </>
                                    )
                                })
                            }
                        </ul>
                    </> : <NoContent/>
                }
            </div>
        </>
    )
}