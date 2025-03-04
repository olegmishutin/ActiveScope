import './sidePanel.css'
import userIcon from '../../assets/images/user.svg'
import inbox from '../../assets/images/inbox.svg'
import userTasks from '../../assets/images/user tasks.svg'
import loup from '../../assets/images/loup.svg'
import groups from '../../assets/images/groups.svg'
import addIcon from '../../assets/images/add.svg'
import projectIcon from '../../assets/images/project.svg'
import allUserIcon from '../../assets/images/users.svg'
import allGroupsIcon from '../../assets/images/all groups.svg'
import allProjectsIcon from '../../assets/images/all projects.svg'
import threeDots from '../../assets/images/three dots.svg'
import Modal from "../Modal/modal.jsx";

import {useState, useEffect} from "react"
import {GET, POST, PUT} from "../../utils/methods.jsx"
import {checkResponse} from "../../utils/response.jsx"
import axios from "axios"
import {Link} from "react-router-dom"
import {getNewMessagesCount, getMessages} from "../Messages/messages.jsx"

import Messages from "../Messages/messages.jsx"
import BackButton from "../../widgets/BackButton/backButton.jsx"
import FilePicker from "../../widgets/FilePicker/filePicker.jsx";
import Textbox from "../../widgets/Textbox/textbox.jsx";
import Button from "../../widgets/Button/button.jsx";
import {getDataByIDs, getImage} from "../../utils/data.jsx";
import {getDateFromRequest} from "../../utils/date.jsx";

export default function SidePanel() {
    const [user, setUser] = useState({photo: null})
    const [projects, setProjects] = useState([])
    const [newMessagesCount, setNewMessagesCount] = useState(0)
    const [messages, setMessages] = useState([])
    const [projectStatus, setProjectStatus] = useState('')

    function getProjects() {
        axios(GET('/api/my_projects/')).then(
            (response) => {
                checkResponse(response, setProjects, response.data)
            }
        ).catch((error) => {
            checkResponse(error.response)
        })
    }

    useEffect(() => {
        axios(GET('/api/me/')).then(
            (response) => {
                checkResponse(response, setUser, response.data)
            }
        ).catch((error) => {
            checkResponse(error.response)
        })

        getProjects()
        getNewMessagesCount(setNewMessagesCount)

        setInterval(getProjects, 30000)
        setInterval(() => {
            getNewMessagesCount(setNewMessagesCount)
        }, 30000)
    }, []);

    function createProject(event) {
        const data = getDataByIDs([
            ['project_icon', 'icon'],
            ['project_header_image', 'header_image'],
            ['project_name', 'name'],
            ['project_start_date', 'start_date'],
            ['project_end_date', 'end_date'],
            ['project_description', 'description'],
        ], true, false)

        axios(POST('/api/projects/', data)).then((response) => {
            checkResponse(response, setProjectStatus, 'Проект успешно создан!', getProjects)
        }).catch((error) => {
            checkResponse(error.response, setProjectStatus, null, null, null, 'project')
        })
        event.preventDefault()
    }

    function editProject(id) {
        const data = getDataByIDs([
            ['project_icon', 'icon'],
            ['project_header_image', 'header_image'],
            ['project_name', 'name'],
            ['project_start_date', 'start_date'],
            ['project_end_date', 'end_date'],
            ['project_description', 'description'],
        ], true, true)

        axios(PUT(`/api/projects/${id}/`, data)).then(
            (response) => {
                checkResponse(response, setProjectStatus, 'Проект изменен!', () => {
                    getProjects()
                    if (window.location.href.includes(`/project/${id}/`)) {
                        window.location.reload()
                    }
                })
            }
        ).catch((error) => {
            checkResponse(error.response, setProjectStatus, null, null, null, 'project')
        })
    }

    function openModal(buttonText, buttonFunc, id) {
        setProjectStatus('')

        const modal = document.getElementById('projects_modal')
        modal.classList.add('show_modal')
        modal.classList.remove('hide_modal')

        const button = document.getElementById('projects_modal__manage_button')
        button.textContent = buttonText
        button.onclick = buttonFunc


        if (id !== null) {
            axios(GET(`/api/projects/${id}/`)).then(
                (response) => {
                    checkResponse(response, null, null, () => {
                        document.getElementById('project_name').value = response.data.name
                        document.getElementById('project_start_date').value = getDateFromRequest(response.data.start_date)
                        document.getElementById('project_end_date').value = getDateFromRequest(response.data.end_date)
                        document.getElementById('project_description').value = response.data.description
                    })
                }
            ).catch((error) => {
                checkResponse(error.response)
            })
        } else {
            document.getElementById('project_name').value = ''
            document.getElementById('project_start_date').value = ''
            document.getElementById('project_end_date').value = ''
            document.getElementById('project_description').value = ''
        }
    }

    function changePanel(id, removeClass, addClass) {
        const panel = document.getElementById(id)
        panel.classList.remove(removeClass)
        panel.classList.add(addClass)
    }

    function closePanelOnMobile() {
        if (window.innerWidth <= 768) {
            changePanel('panel', 'show_panel', 'hidden_panel')
        }
    }

    return (
        <>
            <aside className="panel" id='panel'>
                <header className="panel__header">
                    <div className="panel__header__box">
                        <div className="panel__header__logo">
                            <img src='/logo.svg' alt='logo'/>
                        </div>
                        <h4 className='panel__header__name'>ActiveScope</h4>
                    </div>
                    <div className="panel__header__box control_buttons">
                        <BackButton onClick={() => {
                            changePanel('panel', 'show_panel', 'hidden_panel')
                        }}/>
                        <BackButton className='panel__header__control_button maximize' onClick={() => {
                            changePanel('panel', 'hidden_panel', 'show_panel')
                        }}/>
                    </div>
                </header>
                <nav className='panel__main'>
                    <div className="panel__main_box">
                        <Link onClick={closePanelOnMobile} to={`/users/${user.id}`} className="panel__main__selector">
                            <div className="panel__main__selector__icon">
                                <img className='panel__main__selector__icon__user' src={
                                    user.photo ? getImage(user.photo) : userIcon
                                } alt='user icon' loading='lazy' id='panel_user_photo'/>
                            </div>
                            <p className='panel__main__selector__name' id='panel_user_name'>{user.get_full_name}</p>
                        </Link>
                        <button onClick={() => {
                            changePanel('messages_panel', 'hide_messages', 'show_messages')
                            getMessages(setMessages, setNewMessagesCount)
                        }} className="panel__main__selector">
                            <div className="panel__main__selector__icon">
                                <img src={inbox} alt='icon'/>
                            </div>
                            <p className='panel__main__selector__name'>Входящие сообщения</p>
                            {
                                newMessagesCount ?
                                    <div className="panel__main__selector__counter">
                                        <p className='panel__main__selector__counter__number'>{newMessagesCount}</p>
                                    </div> : ''
                            }
                        </button>
                    </div>
                    <div className="panel__main_box">
                        <Link onClick={closePanelOnMobile} to='/' className="panel__main__selector">
                            <div className="panel__main__selector__icon">
                                <img src={loup} alt='icon'/>
                            </div>
                            <p className='panel__main__selector__name'>Поиск людей</p>
                        </Link>
                        <Link onClick={closePanelOnMobile} to='/groups/' className="panel__main__selector">
                            <div className="panel__main__selector__icon">
                                <img src={groups} alt='icon'/>
                            </div>
                            <p className='panel__main__selector__name'>Группы</p>
                        </Link>
                    </div>
                    <div className="panel__main_box">
                        <button onClick={() => {
                            openModal('Создать', createProject, null)
                        }} className="panel__main__selector">
                            <div className="panel__main__selector__icon">
                                <img src={addIcon} alt='icon'/>
                            </div>
                            <p className='panel__main__selector__name'>Создать проект</p>
                        </button>
                        {
                            projects.map((value) => {
                                return (
                                    <>
                                        <div className="panel__main__selector">
                                            <Link onClick={closePanelOnMobile} to={`/project/${value.id}/tasks/`}
                                                  className="panel__main__selector__nested" id={`project_${value.id}`}>
                                                <div className="panel__main__selector__icon">
                                                    <img src={
                                                        value.icon ? getImage(value.icon) : projectIcon
                                                    } alt='icon' loading='lazy'/>
                                                </div>
                                                <p className='panel__main__selector__name'
                                                   id={`project_${value.id}_name`}>{value.name}</p>
                                            </Link>
                                            {
                                                value.owner === user.id ? <>
                                                    <button className="panel__main__selector__icon project_edition_dots"
                                                            onClick={() => {
                                                                openModal('Изменить', () => {
                                                                    editProject(value.id)
                                                                }, value.id)
                                                            }}>
                                                        <img src={threeDots} alt='edit' loading='lazy'/>
                                                    </button>
                                                </> : ''
                                            }
                                        </div>
                                    </>
                                )
                            })
                        }
                    </div>
                    {
                        user.is_admin ? <>
                            <div className="panel__main_box">
                                <Link onClick={closePanelOnMobile} to='/admin/users/' className="panel__main__selector">
                                    <div className="panel__main__selector__icon">
                                        <img src={allUserIcon} alt='icon'/>
                                    </div>
                                    <p className='panel__main__selector__name'>Все пользователи</p>
                                </Link>
                                <Link onClick={closePanelOnMobile} to='/admin/groups/'
                                      className="panel__main__selector">
                                    <div className="panel__main__selector__icon">
                                        <img src={allGroupsIcon} alt='icon'/>
                                    </div>
                                    <p className='panel__main__selector__name'>Все группы</p>
                                </Link>
                                <Link onClick={closePanelOnMobile} to='/admin/projects/'
                                      className="panel__main__selector">
                                    <div className="panel__main__selector__icon">
                                        <img src={allProjectsIcon} alt='icon'/>
                                    </div>
                                    <p className='panel__main__selector__name'>Все проекты</p>
                                </Link>
                            </div>
                        </> : ''
                    }
                </nav>
            </aside>
            <Messages messages={messages} messagesCountSetter={setNewMessagesCount}
                      update_projects_method={getProjects}/>
            <Modal id='projects_modal' className='projects_modal_window' status={projectStatus}
                   contentClassName='projects_modal_window_content' manageButtons={<>
                <Button id='projects_modal__manage_button'/>
            </>}>
                <div className="projects_modal__content">
                    <div className="projects_modal__content__side">
                        <FilePicker id='project_icon' accept='image/*' className='projects_modal__content__filepicker'>
                            Иконка
                        </FilePicker>
                        <FilePicker id='project_header_image' accept='image/*'
                                    className='projects_modal__content__filepicker'>
                            Задний фон проекта
                        </FilePicker>
                    </div>
                    <div className="projects_modal__content__side">
                        <Textbox id='project_name' label='Название' isRequired={true}/>
                        <div className="projects_modal__content__inline">
                            <Textbox id='project_start_date' type='date' label='Дата начала'/>
                            <Textbox id='project_end_date' type='date' label='Дата окончания'/>
                        </div>
                    </div>
                </div>
                <Textbox id='project_description' type='textarea' placeholder='Описание проекта:'
                         className='projects_modal__description'/>
            </Modal>
        </>
    )
}