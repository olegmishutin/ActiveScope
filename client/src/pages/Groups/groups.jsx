import './groups.css'
import groupsIcon from '../../assets/images/groups.svg'
import userIcon from '../../assets/images/user.svg'

import {useState, useEffect} from "react"
import {Link} from "react-router-dom"
import axios from "axios"
import {GET, POST, DELETE, PUT} from "../../utils/methods.jsx"
import {checkResponse} from "../../utils/response.jsx"
import {checkConfirmation} from "../../utils/request.jsx";
import {getFilters, getDataByIDs} from "../../utils/data.jsx"

import Button from "../../widgets/Button/button.jsx"
import Textbox from "../../widgets/Textbox/textbox.jsx"
import Ordering from "../../widgets/Ordering/ordering.jsx"
import Filters from "../../components/Filters/filters.jsx"
import ListElement from "../../components/ListElement/listElement.jsx"
import Modal from "../../components/Modal/modal.jsx"
import FilePicker from "../../widgets/FilePicker/filePicker.jsx"
import NoContent from "../../components/NoContent/noContent.jsx";

export default function Groups(props) {
    const [currentUser, setCurrentUser] = useState({})
    const [status, setStatus] = useState('')
    const [groups, setGroups] = useState([])

    function getGroups() {
        let url = props.isAdmin ? '/api/admin_groups/' : '/api/groups/'

        const filters = [
            'ordering_created_date',
            'min_members_count',
            'max_members_count',
            'ordering_members_count',
        ]

        if (props.isAdmin) {
            filters.push('search')
        }
        url = getFilters(url, filters)

        axios(GET(url)).then(
            (response) => {
                checkResponse(response, setGroups, response.data)
            }
        ).catch((error) => {
            checkResponse(error.response)
        })
    }

    function createGroup(event) {
        const data = getDataByIDs([
            'icon',
            'name',
            'description'
        ], true, true)

        axios(POST('/api/groups/', data)).then(
            (response) => {
                checkResponse(response, setStatus, 'Группа успешно создана!', getGroups)
            }
        ).catch((error) => {
            checkResponse(error.response, setStatus)
        })
        event.preventDefault()
    }

    function editGroup(id) {
        const data = getDataByIDs([
            'icon',
            'name',
            'description'
        ], true, true)

        axios(PUT(`/api/groups/${id}/`, data)).then(
            (response) => {
                checkResponse(response, setStatus, 'Группа изменена!', getGroups)
            }
        ).catch((error) => {
            checkResponse(error.response, setStatus)
        })
    }

    function removeMember(id, memberId) {
        checkConfirmation(
            'Уверены, что требуется исключить участника?',
            () => {
                axios(POST(`/api/groups/${id}/remove_member/`, {
                    user_id: memberId
                })).then(
                    (response) => {
                        checkResponse(response, null, null, getGroups)
                    }
                ).catch((error) => {
                    checkResponse(error.response)
                })
            }
        )
    }

    function leaveGroup(id) {
        checkConfirmation(
            'Уверены, что хотите выйти из группы?',
            () => {
                axios(POST(`/api/groups/${id}/leave_group/`)).then(
                    (response) => {
                        checkResponse(response, null, null, getGroups)
                    }
                ).catch((error) => {
                    checkResponse(error.response)
                })
            }
        )
    }

    function openModal(buttonText, buttonFunc, nameText, descriptionText) {
        setStatus('')

        const modal = document.getElementById('groupsModal')
        modal.classList.add('show_modal')
        modal.classList.remove('hide_modal')

        const button = document.getElementById('groupsModalButton')
        button.textContent = buttonText
        button.onclick = buttonFunc

        document.getElementById('name').value = nameText
        document.getElementById('description').value = descriptionText
    }

    useEffect(() => {
        getGroups()
        axios(GET('/api/me/')).then(
            (response) => {
                checkResponse(response, setCurrentUser, response.data)
            }
        ).catch((error) => {
            checkResponse(error.response)
        })
    }, [props.isAdmin]);

    return (
        <>
            <div className="groups window_main_content">
                {
                    props.isAdmin ? <>
                        <div className="group__search">
                            <Textbox id='search' className='group__search__textbox'
                                     placeholder='Поиск по группе или по email основателя'/>
                            <Button onClick={getGroups}>Искать</Button>
                        </div>
                    </> : <>
                        <div className="groups__creation">
                            <Button onClick={() => {
                                openModal('Создать', createGroup, '', '')
                            }}>Создать группу</Button>
                        </div>
                    </>
                }
                <Filters filterEvent={getGroups}>
                    <Textbox className='groups__filters__textbox' type='number' label='Минимальное кол-во участников'
                             min={0} id='min_members_count'/>
                    <Textbox className='groups__filters__textbox' type='number' label='Максимальное кол-во участников'
                             min={0} id='max_members_count'/>
                    <Ordering id='ordering_members_count'>Количество участников</Ordering>
                    <Ordering id='ordering_created_date'>Дата создания</Ordering>
                </Filters>
                {
                    groups.length > 0 ? <>
                        <ul className='base_list'>
                            {
                                groups.map((group) => {
                                    return (
                                        <>
                                            <ListElement icon={group.icon} defaultIcon={groupsIcon}
                                                         headerText={group.name} text={group.description} detail={
                                                <>
                                                    <ul className='base_list'>
                                                        {group.members.map((member) => {
                                                            return (
                                                                <>
                                                                    <ListElement className='light_list_element'
                                                                                 icon={member.photo} roundedIcon={true}
                                                                                 headerText={member.full_name}
                                                                                 defaultIcon={userIcon}
                                                                                 text={member.description}>
                                                                        <Link to={`/users/${member.id}`}
                                                                              className='list_element__header__text'>
                                                                            Email: <span
                                                                            className='list_element__header__text__important'>
                                                                        {member.email}
                                                                    </span>
                                                                        </Link>
                                                                        <p className='list_element__header__text'>
                                                                            Количество проектов: <span
                                                                            className='list_element__header__text__important'>
                                                                        {member.projects_count}
                                                                    </span>
                                                                        </p>
                                                                        {
                                                                            group.founder_id === currentUser.id && currentUser.id !== member.id && !props.isAdmin ?
                                                                                <Button className='red_button'
                                                                                        onClick={() => {
                                                                                            removeMember(group.id, member.id)
                                                                                        }}>
                                                                                    Исключить
                                                                                </Button> : ''
                                                                        }
                                                                    </ListElement>
                                                                </>
                                                            )
                                                        })}
                                                    </ul>
                                                </>
                                            }>
                                                <Link to={`/users/${group.founder_id}/`}
                                                      className='list_element__header__text'>
                                                    Основатель: <span
                                                    className='list_element__header__text__important'>
                                                {group.founder_email}
                                            </span>
                                                </Link>
                                                <p className='list_element__header__text'>
                                                    Дата создания: <span
                                                    className='list_element__header__text__important'>
                                                {group.created_date}
                                            </span>
                                                </p>
                                                <p className='list_element__header__text'>
                                                    Количество участников: <span
                                                    className='list_element__header__text__important'>
                                                {group.members_count}
                                            </span>
                                                </p>
                                                {
                                                    group.founder_id === currentUser.id && !props.isAdmin ? <>
                                                        <Button className='light_button' onClick={() => {
                                                            openModal('Изменить', () => {
                                                                editGroup(group.id)
                                                            }, group.name, group.description)
                                                        }}> Изменить
                                                        </Button>
                                                    </> : !props.isAdmin ?
                                                        <Button className='red_button' onClick={() => {
                                                            leaveGroup(group.id)
                                                        }}>Покинуть</Button> : ''
                                                }
                                                {
                                                    props.isAdmin || group.founder_id === currentUser.id ?
                                                        <Button className='red_button' onClick={() => {
                                                            checkConfirmation(
                                                                'Уверены, что требуется удалить группу?',
                                                                () => {
                                                                    const url = props.isAdmin ? `/api/admin_groups/${group.id}` : `/api/groups/${group.id}/`

                                                                    axios(DELETE(url)).then(
                                                                        (response) => {
                                                                            checkResponse(response, null, null, getGroups)
                                                                        }
                                                                    ).catch((error) => {
                                                                        checkResponse(error.response)
                                                                    })
                                                                }
                                                            )
                                                        }}>Удалить</Button> : ''
                                                }
                                            </ListElement>
                                        </>
                                    )
                                })
                            }
                        </ul>
                    </> : <NoContent/>
                }
            </div>
            <Modal id='groupsModal' className='groups_modal_window' status={status} manageButtons={
                <>
                    <Button id='groupsModalButton'/>
                </>
            }>
                <div className="groups_modal">
                    <div className="groups_modal__inline">
                        <FilePicker id='icon' accept='image/*'>
                            Иконка
                        </FilePicker>
                        <Textbox id='name' isRequired={true} label='Название'/>
                    </div>
                    <Textbox type='textarea' id='description' placeholder='Краткое описание для группы:'/>
                </div>
            </Modal>
        </>
    )
}