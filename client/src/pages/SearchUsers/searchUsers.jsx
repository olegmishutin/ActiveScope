import './searchUsers.css'
import userIcon from '../../assets/images/user.svg'

import {useState, useEffect} from "react"
import axios from "axios"
import {GET} from "../../utils/methods.jsx"
import {checkResponse} from "../../utils/response.jsx"
import {getFilters} from "../../utils/data.jsx"

import Filters from "../../components/Filters/filters.jsx"
import ListElement from "../../components/ListElement/listElement.jsx"
import Ordering from "../../widgets/Ordering/ordering.jsx"
import Textbox from "../../widgets/Textbox/textbox.jsx"
import Button from "../../widgets/Button/button.jsx"

export default function SearchUsers(props) {
    const [users, setUser] = useState([])

    function getUsers() {
        let url = '/api/users/'
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

    useEffect(() => {
        getUsers()
    }, []);

    return (
        <>
            <div className="search_users window_main_content">
                <div className="search_users__searching">
                    <Textbox className='search_users__searching__texbox' placeholder='Поиск по email или ФИО'
                             id='search'/>
                    <Button onClick={getUsers}>Искать</Button>
                </div>
                <Filters filterEvent={getUsers}>
                    <Textbox type='number' min={0} label='Минимальное кол-во проектов' id='min_projects_count'/>
                    <Textbox type='number' min={0} label='Максимальное кол-во проектов' id='max_projects_count'/>
                    <Ordering id='ordering_projects_count'>Количество проектов</Ordering>
                </Filters>
                <ul className='base_list search_users__list'>
                    {
                        users.map((user) => {
                            return (
                                <>
                                    <ListElement headerText={user.full_name} icon={user.photo} defaultIcon={userIcon}
                                                 roundedIcon={true} text={user.description}>
                                        <p className='list_element__header__text'>
                                            Email: <span className='list_element__header__text__important'>
                                                {user.email}
                                            </span>
                                        </p>
                                        <p className='list_element__header__text'>
                                            Количество проектов: <span
                                            className='list_element__header__text__important'>
                                                {user.projects_count}
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