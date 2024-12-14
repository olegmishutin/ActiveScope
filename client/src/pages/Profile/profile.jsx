import './profile.css'
import projectIcon from '../../assets/images/project.svg'

import {useParams} from 'react-router-dom'
import {useState, useEffect} from "react"
import axios from "axios"
import {GET, PUT, DELETE, POST} from "../../utils/methods.jsx"
import {checkResponse} from "../../utils/response.jsx"
import {getFilters, getDataByIDs, getImage} from "../../utils/data.jsx"
import {getDateFromRequest, getDateFromInput} from "../../utils/date.jsx"

import Header from "../../components/Header/header.jsx"
import Button from "../../widgets/Button/button.jsx"
import Filters from "../../components/Filters/filters.jsx"
import Textbox from "../../widgets/Textbox/textbox.jsx"
import Ordering from "../../widgets/Ordering/ordering.jsx"
import ListElement from "../../components/ListElement/listElement.jsx"
import Modal from "../../components/Modal/modal.jsx"
import FilePicker from "../../widgets/FilePicker/filePicker.jsx"
import Checkbox from "../../widgets/Checkbox/checkbox.jsx"
import InviteModal from "../../components/InviteMdal/inviteModal.jsx"

export default function Profile() {
    let {id} = useParams()
    const [editStatus, setEditStatus] = useState('')
    const [inviteStatus, setInviteStatus] = useState('')
    const [currentUser, setCurrentUser] = useState({})
    const [user, setUser] = useState({birth_date: '', full_name: ''})
    const [projects, setProjects] = useState([])
    const [groups, setGroups] = useState([])

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

    function getUserOwnGroups() {
        axios(GET('/api/my_groups/')).then(
            (response) => {
                checkResponse(response, setGroups, response.data)
            }
        ).catch((error) => {
            checkResponse(error.response, setInviteStatus)
        })
    }

    function inviteUser(event) {
        const groupId = document.getElementById('groups_selection').value
        const data = {
            user_id: id
        }

        axios(POST(`/api/groups/${groupId}/invite_member/`, data)).then(
            (response) => {
                checkResponse(response, setInviteStatus, response.data.detail)
            }
        ).catch((error) => {
            checkResponse(error.response, setInviteStatus)
        })
        event.preventDefault()
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

    function changeUserInfo(event) {
        const data = getDataByIDs([
            'photo',
            'header_image',
            'first_name',
            'last_name',
            'patronymic',
            'email',
            'old_password',
            'new_password',
            'birth_date',
            'description',
            'may_be_invited'
        ], true, true)

        if (data.get('birth_date')) {
            data.set('birth_date', getDateFromInput(data.get('birth_date')))
        }

        axios(PUT(`/api/users/${id}/`, data)).then(
            (response) => {
                checkResponse(response, setUser, response.data, () => {
                    setEditStatus('Данные успешно изменены!')
                    const panel_user_name = document.getElementById('panel_user_name')

                    if (response.data.photo) {
                        const panel_user_photo = document.getElementById('panel_user_photo')
                        panel_user_photo.src = getImage(response.data.photo)
                    }
                    panel_user_name.textContent = response.data.full_name
                })
            }
        ).catch((error) => {
            checkResponse(error.response, setEditStatus)
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
                                <Button onClick={() => {
                                    setInviteStatus('')
                                    getUserOwnGroups()

                                    const modal = document.getElementById('profileInviteModal')
                                    modal.classList.remove('hide_modal')
                                    modal.classList.add('show_modal')
                                }}>Пригласить в группу</Button> : ''
                        }
                        {
                            currentUser.id !== user.id && currentUser.is_admin ?
                                <Button className='red_button' onClick={() => {
                                    if (confirm('Уверены, что требуется удалить данного пользователя?')) {
                                        axios(DELETE(`/api/users/${id}/`)).then(
                                            (response) => {
                                                checkResponse(response, null, null, () => {
                                                    window.location.href = '/users/'
                                                })
                                            }
                                        ).catch((error) => {
                                            checkResponse(error.response)
                                        })
                                    }
                                }}>Удалить аккаунт</Button> : ''
                        }
                        {
                            currentUser.id === user.id ? <>
                                <Button onClick={() => {
                                    setEditStatus('')
                                    const modal = document.getElementById('editModal')
                                    modal.classList.remove('hide_modal')
                                    modal.classList.add('show_modal')
                                }}>Изменить данные</Button>
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
            <Modal id='editModal' className='profile_modal' contentClassName='profile_modal_content' status={editStatus}
                   manageButtons={
                       <Button onClick={changeUserInfo}>Изменить</Button>
                   }>
                <div className="profile_edit_modal">
                    <div className="profile_edit_modal__left_side">
                        <FilePicker accept='image/*' className='profile_edit_modal__left_side__file'
                                    big={true} id='photo'>Фотография</FilePicker>
                        <FilePicker accept='image/*' className='profile_edit_modal__left_side__file' big={true}
                                    id='header_image'>Задний фон профиля</FilePicker>
                    </div>
                    <div className="profile_edit_modal__right_side">
                        <div className="profile_edit_modal__right_side__inline">
                            <Textbox id='first_name' label='Имя' isRequired={true}
                                     defaultValue={user.full_name.split(' ')[1]}/>
                            <Textbox id='last_name' label='Фамилия' isRequired={true}
                                     defaultValue={user.full_name.split(' ')[0]}/>
                        </div>
                        <Textbox id='patronymic' label='Отчество' defaultValue={user.full_name.split(' ')[2]}/>
                        <Textbox id='email' type='email' label='Email' isRequired={true} defaultValue={user.email}/>
                        <div className="profile_edit_modal__right_side__inline">
                            <Textbox type='password' id='old_password' label='Старый пароль'/>
                            <Textbox type='password' id='new_password' label='Новый пароль'/>
                        </div>
                        <Textbox id='birth_date' type='date' label='Дата рождения'
                                 defaultValue={getDateFromRequest(user.birth_date)}/>
                    </div>
                </div>
                <Textbox className='profile_edit_modal__description' type='textarea' id='description'
                         placeholder='Краткое описание вас:' defaultValue={user.description}/>
                <Checkbox defaultChecked={user.may_be_invited} id='may_be_invited'>Можете быть приглашены в
                    группу</Checkbox>
            </Modal>
            <InviteModal id='profileInviteModal' inviteStatus={inviteStatus} inviteUserFunc={inviteUser}
                         groups={groups}/>
        </>
    )
}