import './searchUsers.css'
import '../../assets/styles/widgetsEffects.css'
import userIcon from '../../assets/images/user.svg'

import {useState, useEffect} from "react"
import axios from "axios"
import {Link} from "react-router-dom"
import {DELETE, GET, POST} from "../../utils/methods.jsx"
import {checkResponse} from "../../utils/response.jsx"
import {getFilters} from "../../utils/data.jsx"

import Filters from "../../components/Filters/filters.jsx"
import ListElement from "../../components/ListElement/listElement.jsx"
import Ordering from "../../widgets/Ordering/ordering.jsx"
import Textbox from "../../widgets/Textbox/textbox.jsx"
import Button from "../../widgets/Button/button.jsx"
import InviteModal from "../../components/InviteMdal/inviteModal.jsx"
import {checkConfirmation} from "../../utils/request.jsx";
import NoContent from "../../components/NoContent/noContent.jsx";

export default function SearchUsers(props) {
    const [users, setUser] = useState([])
    const [inviteUserId, setInviteUserId] = useState(null)
    const [inviteStatus, setInviteStatus] = useState('')
    const [groups, setGroups] = useState([])

    function getUsers() {
        let url = `/api/${props.isAdmin ? 'admin/users' : 'users'}/`
        url = getFilters(url, [
            'search',
            'min_projects_count',
            'max_projects_count',
            'ordering_projects_count'
        ])

        axios(GET(url)).then(
            (response) => {
                checkResponse(response, setUser, response.data)
            }
        ).catch((error) => {
            checkResponse(error.response)
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
        const group = document.getElementById('groups_selection').value
        const data = {
            user_id: inviteUserId
        }

        axios(POST(`/api/groups/${group}/invite_member/`, data)).then(
            (response) => {
                checkResponse(response, setInviteStatus, response.data.detail)
            }
        ).catch((error) => {
            checkResponse(error.response, setInviteStatus)
        })
        event.preventDefault()
    }

    useEffect(() => {
        getUsers()
    }, [props.isAdmin]);

    return (
        <>
            <div className="search_users window_main_content">
                <div className="search_users__searching">
                    <Textbox className='search_users__searching__texbox' placeholder='Поиск по email или ФИО'
                             id='search'/>
                    <Button onClick={getUsers}>Искать</Button>
                </div>
                <Filters filterEvent={getUsers}>
                    <Textbox className='search_users__filters__textbox' type='number' min={0}
                             label='Минимальное кол-во проектов' id='min_projects_count'/>
                    <Textbox className='search_users__filters__textbox' type='number' min={0}
                             label='Максимальное кол-во проектов' id='max_projects_count'/>
                    <Ordering id='ordering_projects_count'>Количество проектов</Ordering>
                </Filters>
                {
                    users.length > 0 ? <>
                        <ul className='base_list search_users__list'>
                            {
                                users.map((user) => {
                                    return (
                                        <>
                                            <ListElement headerText={user.full_name} icon={user.photo}
                                                         defaultIcon={userIcon} roundedIcon={true}
                                                         text={user.description}>
                                                <Link to={`/users/${user.id}`} className='list_element__header__text'>
                                                    Email: <span className='list_element__header__text__important'>
                                                {user.email}
                                                </span>
                                                </Link>
                                                <p className='list_element__header__text'>
                                                    Количество проектов: <span
                                                    className='list_element__header__text__important'>
                                                {user.projects_count}
                                            </span>
                                                </p>
                                                {
                                                    props.isAdmin ? <Button
                                                            className='red_button' onClick={() => {
                                                            checkConfirmation(
                                                                'Уверены, что требуется удалить данного пользователя?',
                                                                () => {
                                                                    axios(DELETE(`/api/users/${user.id}/`)).then(
                                                                        (response) => {
                                                                            checkResponse(response, null, null, getUsers)
                                                                        }
                                                                    ).catch((error) => {
                                                                        checkResponse(error.response)
                                                                    })
                                                                }
                                                            )
                                                        }}>Удалить</Button> :
                                                        <Button className='light_button'
                                                                onClick={() => {
                                                                    setInviteUserId(user.id)
                                                                    setInviteStatus('')
                                                                    getUserOwnGroups()
                                                                    const modal = document.getElementById(
                                                                        'searchingInviteModal'
                                                                    )
                                                                    modal.classList.remove('hide_modal')
                                                                    modal.classList.add('show_modal')
                                                                }}>Пригласить в группу</Button>
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
            <InviteModal inviteUserFunc={inviteUser} id='searchingInviteModal' inviteStatus={inviteStatus}
                         groups={groups}/>
        </>
    )
}