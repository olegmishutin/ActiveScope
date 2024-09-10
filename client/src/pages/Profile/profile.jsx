import './profile.css'
import projectIcon from '../../assets/images/project.svg'

import {useParams} from 'react-router-dom'
import {useState, useEffect} from "react"
import axios from "axios"
import {GET} from "../../utils/methods.jsx"
import {checkResponse} from "../../utils/response.jsx"
import {getFilters} from "../../utils/data.jsx"

import Header from "../../components/Header/header.jsx"
import Button from "../../widgets/Button/button.jsx"
import Filters from "../../components/Filters/filters.jsx"
import Textbox from "../../widgets/Textbox/textbox.jsx"
import Ordering from "../../widgets/Ordering/ordering.jsx"
import ListElement from "../../components/ListElement/listElement.jsx"

export default function Profile() {
    let {id} = useParams()
    const [currentUser, setCurrentUser] = useState({})
    const [user, setUser] = useState({})
    const [projects, setProjects] = useState([])

    function getUserProjects() {
        let url = `/api/users/${id}/projects/`
        url = getFilters(url, [
            'min_tasks_count',
            'max_tasks_count',
            'ordering_total_tasks'
        ])

        axios(GET(url)).then(
            (response) => {
                checkResponse(response, setProjects, response.data)
            }
        ).catch((error) => {
            checkResponse(error.response, null, null, null, true)
        })
    }

    function logout(event) {
        axios(GET('/api/logout/')).then(
            (response) => {
                checkResponse(response, null, null, () => {
                    window.localStorage.removeItem('token')
                    window.location.href = '/login/'
                })
            }
        ).catch((error) => {
            checkResponse(error.response)
        })
        event.preventDefault()
    }

    useEffect(() => {
        axios(GET('/api/me/')).then(
            (response) => {
                checkResponse(response, setCurrentUser, response.data)
            }
        ).catch((error) => {
            checkResponse(error.response)
        })

        axios(GET(`/api/users/${id}/`)).then(
            (response) => {
                checkResponse(response, setUser, response.data)
            }
        ).catch((error) => {
            checkResponse(error.response, null, null, null, true)
        })
        getUserProjects()
    }, [id]);

    return (
        <>
            <Header round_image={true} image={user.photo} header_image={user.header_image}
                    top_content={<>
                        <div className="profile">
                            <div className="profile__info">
                                <h2 className='profile__info__name'>{user.full_name}</h2>
                                {
                                    user.description ?
                                        <p className='profile__info__description'>{user.description}</p> : ''
                                }
                            </div>
                            <div className="profile__info__other">
                                <p className='header__info__text'><span>email:</span> {user.email}</p>
                                {
                                    user.birth_date ?
                                        <p className='header__info__text'><span>Дата рождения:</span> {user.birth_date}
                                        </p> : ''
                                }
                            </div>
                        </div>
                    </>}
                    bottom_content={<>
                        {
                            currentUser.id !== user.id && user.may_be_invited ?
                                <Button>Пригласить в группу</Button> : ''
                        }
                        {
                            currentUser.id !== user.id && currentUser.is_admin ?
                                <Button className='red_button'>Удалить аккаунт</Button> : ''
                        }
                        {
                            currentUser.id === user.id ? <>
                                <Button>Изменить данные</Button>
                                <Button className='red_button' onClick={logout}>Выйти из системы</Button>
                            </> : ''
                        }
                    </>}/>
            <div className="window_main_content">
                <Filters filterEvent={getUserProjects}>
                    <Textbox type='number' className='profile_content__filter' min={0} label='Минимальное кол-во задач'
                             id={'min_tasks_count'}></Textbox>
                    <Textbox type='number' className='profile_content__filter' min={0} label='Максимальное кол-во задач'
                             id={'max_tasks_count'}></Textbox>
                    <Ordering id='ordering_total_tasks'>Количество задач</Ordering>
                </Filters>
                <ul className='base_list'>
                    {
                        projects.map((project) => {
                            return (
                                <>
                                    <ListElement icon={project.icon} defaultIcon={projectIcon}
                                                 headerText={project.name} text={project.description}>
                                        <p className='list_element__header__text'>
                                            Основатель: <span className='list_element__header__text__important'>
                                                {project.owner}
                                            </span>
                                        </p>
                                        <p className='list_element__header__text'>
                                            Количество задач: <span className='list_element__header__text__important'>
                                                {project.total_tasks}
                                            </span>
                                        </p>
                                        <p className='list_element__header__text'>
                                            Количество выполненных задач: <span
                                            className='list_element__header__text__important'>
                                                {project.completed_tasks}
                                            </span>
                                        </p>
                                    </ListElement>
                                </>
                            )
                        })
                    }
                </ul>
            </div>
        </>
    )
}