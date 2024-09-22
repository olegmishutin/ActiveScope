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

import {useState, useEffect} from "react"
import {GET} from "../../utils/methods.jsx"
import {checkResponse} from "../../utils/response.jsx"
import axios from "axios"
import {Link} from "react-router-dom"
import {getNewMessagesCount, getMessages} from "../Messages/messages.jsx"

import Messages from "../Messages/messages.jsx"
import BackButton from "../../widgets/BackButton/backButton.jsx"

export default function SidePanel() {
    const [user, setUser] = useState({photo: null})
    const [projects, setProjects] = useState([])
    const [newMessagesCount, setNewMessagesCount] = useState(0)
    const [messages, setMessages] = useState([])

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
            <aside className="panel show_panel" id='panel'>
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
                                    user.photo ? user.photo : userIcon
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
                            <div className="panel__main__selector__counter">
                                <p className='panel__main__selector__counter__number'>{newMessagesCount}</p>
                            </div>
                        </button>
                        <Link onClick={closePanelOnMobile} to='' className="panel__main__selector">
                            <div className="panel__main__selector__icon">
                                <img src={userTasks} alt='icon'/>
                            </div>
                            <p className='panel__main__selector__name'>Мои задачи</p>
                        </Link>
                    </div>
                    <div className="panel__main_box">
                        <Link onClick={closePanelOnMobile} to='/users/' className="panel__main__selector">
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
                        <Link to='' className="panel__main__selector">
                            <div className="panel__main__selector__icon">
                                <img src={addIcon} alt='icon'/>
                            </div>
                            <p className='panel__main__selector__name'>Создать проект</p>
                        </Link>
                        {
                            projects.map((value) => {
                                return (
                                    <>
                                        <Link onClick={closePanelOnMobile} to='' className="panel__main__selector"
                                              id={`project_${value.id}`}>
                                            <div className="panel__main__selector__icon">
                                                <img src={
                                                    value.icon ? value.icon : projectIcon
                                                } alt='icon' loading='lazy'/>
                                            </div>
                                            <p className='panel__main__selector__name'
                                               id={`project_${value.id}_name`}>{value.name}</p>
                                        </Link>
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
                                <Link onClick={closePanelOnMobile} to='' className="panel__main__selector">
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
            <Messages messages={messages} messagesCountSetter={setNewMessagesCount}/>
        </>
    )
}