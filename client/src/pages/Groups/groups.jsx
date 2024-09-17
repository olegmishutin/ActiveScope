import './groups.css'
import groupsIcon from '../../assets/images/groups.svg'
import userIcon from '../../assets/images/user.svg'

import {useState, useEffect} from "react"
import {Link} from "react-router-dom"
import axios from "axios"
import {GET} from "../../utils/methods.jsx"
import {checkResponse} from "../../utils/response.jsx"
import {getFilters} from "../../utils/data.jsx"

import Button from "../../widgets/Button/button.jsx"
import Textbox from "../../widgets/Textbox/textbox.jsx"
import Ordering from "../../widgets/Ordering/ordering.jsx"
import Filters from "../../components/Filters/filters.jsx"
import ListElement from "../../components/ListElement/listElement.jsx"

export default function Groups(props) {
    const [groups, setGroups] = useState([])

    function getGroups() {
        let url = '/api/groups/'
        url = getFilters(url, [
            'min_members_count',
            'max_members_count',
            'ordering_members_count',
            'ordering_created_date'
        ])

        axios(GET(url)).then(
            (response) => {
                checkResponse(response, setGroups, response.data)
            }
        ).catch((error) => {
            checkResponse(error.response)
        })
    }

    useEffect(() => {
        getGroups()
    }, []);

    return (
        <>
            <div className="groups window_main_content">
                <div className="groups__creation">
                    <Button>Создать группу</Button>
                </div>
                <Filters filterEvent={getGroups}>
                    <Textbox className='groups__filters__textbox' type='number' label='Минимальное кол-во участников'
                             min={0} id='min_members_count'/>
                    <Textbox className='groups__filters__textbox' type='number' label='Максимальное кол-во участников'
                             min={0} id='max_members_count'/>
                    <Ordering id='ordering_members_count'>Количество участников</Ordering>
                    <Ordering id='ordering_created_date'>Дата создания</Ordering>
                </Filters>
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
                                                            </ListElement>
                                                        </>
                                                    )
                                                })}
                                            </ul>
                                        </>
                                    }>
                                        <p className='list_element__header__text'>
                                            Основатель: <span
                                            className='list_element__header__text__important'>
                                                {group.founder_email}
                                            </span>
                                        </p>
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