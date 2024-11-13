import './projectMembers.css'
import {Link, useParams} from "react-router-dom";
import ProjectBase from "../../components/ProjectBase/projectBase.jsx";
import {useEffect, useState} from "react";
import axios from "axios";
import {GET} from "../../utils/methods.jsx";
import {checkResponse} from "../../utils/response.jsx";
import Button from "../../widgets/Button/button.jsx";
import ListElement from "../../components/ListElement/listElement.jsx";
import Textbox from "../../widgets/Textbox/textbox.jsx";
import {getFilters} from "../../utils/data.jsx";
import userIcon from "../../assets/images/user.svg";
import InviteModal from "../../components/InviteMdal/inviteModal.jsx";
import Selection from "../../widgets/Selection/selection.jsx";

export default function ProjectMembers() {
    let {id} = useParams()
    const [project, setProject] = useState({})
    const [members, setMembers] = useState([])
    const [currentUser, setCurrentUser] = useState({})
    const [inviteStatus, setInviteStatus] = useState('')
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

    function getUserOwnGroups() {
        axios(GET('/api/my_groups/')).then(
            (response) => {
                checkResponse(response, setGroups, response.data)
            }
        ).catch((error) => {
            checkResponse(error.response, setInviteStatus)
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
            <ProjectBase project={project}/>
            <div className="window_main_content">
                <Button onClick={() => {
                    setInviteStatus('')
                    getUserOwnGroups()
                    const modal = document.getElementById('project_members_modal')
                    modal.classList.remove('hide_modal')
                    modal.classList.add('show_modal')
                }}>Пригласить участника</Button>
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
                                            currentUser.id !== user.id ?
                                                <Button className='red_button'>Исключить</Button> : ''
                                        }
                                    </ListElement>
                                </>
                            )
                        })
                    }
                </ul>
            </div>
            <InviteModal onChange={(e) => {
                axios(GET(`/api/group/${e.target.value}/members/`)).then(
                    (response) => {
                        checkResponse(response, null, null, () => {
                            const members = []
                            response.data.forEach((member) => {
                                members.push({
                                    id: member.id,
                                    name: member.full_name
                                })
                            })
                            setGroupMembers(members)
                        })
                    }
                ).catch((error) => {
                    checkResponse(error.response, setInviteStatus)
                })
            }} className='project_members_invite_modal' status={inviteStatus} groups={groups}
                         id='project_members_modal'>
                <Selection id='member_selection' data={groupMembers}>Выберите участника</Selection>
            </InviteModal>
        </>
    )
}