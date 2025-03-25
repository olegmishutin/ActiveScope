import './projectMembers.css'
import {Link, useOutletContext, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";
import {GET, POST} from "../../utils/methods.jsx";
import {checkResponse} from "../../utils/response.jsx";
import Button from "../../widgets/Button/button.jsx";
import ListElement from "../../components/ListElement/listElement.jsx";
import Textbox from "../../widgets/Textbox/textbox.jsx";
import {getFilters} from "../../utils/data.jsx";
import userIcon from "../../assets/images/user.svg";
import InviteModal from "../../components/InviteMdal/inviteModal.jsx";
import {checkConfirmation} from "../../utils/request.jsx";
import Dropdown from "../../widgets/Dropdown/dropdown.jsx";
import Checkbox from "../../widgets/Checkbox/checkbox.jsx";

export default function ProjectMembers() {
    let {id} = useParams()
    const {project} = useOutletContext()
    const [members, setMembers] = useState([])
    const [currentUser, setCurrentUser] = useState({})
    const [addingStatus, setAddingStatus] = useState('')
    const [groups, setGroups] = useState([])
    const [groupMembers, setGroupMembers] = useState([])

    function getMembers() {
        let url = `/api/projects/${id}/members/`
        url = getFilters(url, [
            'search',
        ])

        axios(GET(url)).then(
            (response) => {
                checkResponse(response, setMembers, response.data)
            }
        ).catch((error) => {
            checkResponse(error.response)
        })
    }

    function setMembersShortcut(response, single) {
        const members = []
        const data = single ? response.data : response.data[0]

        data.members.forEach((member) => {
            members.push({
                id: member.id,
                name: member.full_name
            })
        })
        setGroupMembers(members)
    }

    function getUserOwnGroups() {
        axios(GET('/api/groups/')).then(
            (response) => {
                checkResponse(response, setGroups, response.data, () => {
                    setMembersShortcut(response, false)
                    document.getElementById('groups_selection').value = response.data[0].id
                })
            }
        ).catch((error) => {
            checkResponse(error.response, setAddingStatus)
        })
    }

    function addMember(event) {
        const group_selection = document.getElementById('groups_selection')

        if (group_selection.value) {
            const data = {
                group_id: group_selection.value,
                users_ids: []
            }

            groupMembers.forEach((member) => {
                const checkbox = document.getElementById(`member_selection_checkbox_${member.id}`)

                if (checkbox.checked) {
                    data['users_ids'].push(member.id)
                }
            })

            axios(POST(`/api/projects/${id}/add_member/`, data)).then(
                (response) => {
                    checkResponse(response, setAddingStatus, response.data.detail, getMembers)
                }
            ).catch((error) => {
                checkResponse(error.response, setAddingStatus)
            })

            document.getElementById('dropdown_project_member_selection_details').removeAttribute('open')
            event.preventDefault()
        }
    }

    function removeMember(user_id) {
        checkConfirmation(
            'Уверены, что хотит исключить этого участника?',
            () => {
                axios(POST(`/api/projects/${id}/remove_member/`, {user_id: user_id})).then(
                    (response) => {
                        checkResponse(response, null, null, getMembers)
                    }
                ).catch((error) => {
                    checkResponse(error.response)
                })
            }
        )
    }

    useEffect(() => {
        axios(GET('/api/me/')).then(
            (response) => {
                checkResponse(response, setCurrentUser, response.data)
            }
        ).catch((error) => {
            checkResponse(error.response)
        })

        getMembers()
    }, [id]);

    return (
        <>
            <div className="window_main_content">
                {
                    currentUser.email === project.owner ? <>
                        <Button onClick={() => {
                            setAddingStatus('')
                            getUserOwnGroups()
                            const modal = document.getElementById('project_members_modal')
                            modal.classList.remove('hide_modal')
                            modal.classList.add('show_modal')
                        }} className='window_main_content__project_invite_button'>Добавить участника</Button>
                    </> : ''
                }
                <div className="project_members_search">
                    <Textbox placeholder='Поиск по email или ФИО' id='search'/>
                    <Button onClick={getMembers}>Искать</Button>
                </div>
                <ul className='project_members'>
                    {
                        members.map((user) => {
                            return (
                                <>
                                    <ListElement headerText={user.get_full_name} icon={user.photo}
                                                 defaultIcon={userIcon} roundedIcon={true} text={user.description}>
                                        <Link to={`/users/${user.id}/`} className='list_element__header__text'>
                                            Email: <span className='list_element__header__text__important'>
                                                {user.email}
                                                </span>
                                        </Link>
                                        <p className='list_element__header__text'>
                                            Количество задач в проекте: <span
                                            className='list_element__header__text__important'>
                                                {user.tasks_count}
                                            </span>
                                        </p>
                                        {
                                            currentUser.email === project.owner && user.email !== project.owner ?
                                                <Button className='red_button' onClick={() => {
                                                    removeMember(user.id)
                                                }}>Исключить</Button> : ''
                                        }
                                    </ListElement>
                                </>
                            )
                        })
                    }
                </ul>
            </div>
            <InviteModal onChange={(e) => {
                axios(GET(`/api/groups/${e.target.value}/`)).then(
                    (response) => {
                        checkResponse(response, null, null, () => {
                            setMembersShortcut(response, true)
                        })
                    }
                ).catch((error) => {
                    checkResponse(error.response, setAddingStatus)
                })
            }} extendCloseFunc={() => {
                document.getElementById('dropdown_project_member_selection_details').removeAttribute('open')

                groupMembers.forEach((member) => {
                    document.getElementById(`member_selection_checkbox_${member.id}`).checked = false
                    document.getElementById(`member_selection_checkbox_${member.id}_indicator`).classList.remove('default_checkbox__checked')
                })
            }} className='project_members_invite_modal' inviteStatus={addingStatus} groups={groups}
                         id='project_members_modal' inviteUserFunc={addMember} inviteButtonText='Добавить'
                         selectionClassName='project_members_invite_modal__selection'>
                <Dropdown className='project_members_invite_modal__dropdown' id='dropdown_project_member_selection'
                          name='Выберите участника'>
                    {
                        groupMembers.map((member) => {
                            return (
                                <>
                                    <Checkbox splash={true} id={`member_selection_checkbox_${member.id}`}>
                                        {member.name}
                                    </Checkbox>
                                </>
                            )
                        })
                    }
                </Dropdown>
            </InviteModal>
        </>
    )
}