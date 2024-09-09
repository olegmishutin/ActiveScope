import './profile.css'

import {useParams} from 'react-router-dom'
import {useState, useEffect} from "react"
import axios from "axios"
import {GET} from "../../utils/methods.jsx"
import {checkResponse} from "../../utils/response.jsx"

import Header from "../../components/Header/header.jsx"
import Button from "../../widgets/Button/button.jsx"
import Filters from "../../components/Filters/filters.jsx"
import Textbox from "../../widgets/Textbox/textbox.jsx"
import Ordering from "../../widgets/Ordering/ordering.jsx"

export default function Profile() {
    let {id} = useParams()
    const [currentUser, setCurrentUser] = useState({})
    const [user, setUser] = useState({})

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
            if (error.response.status === 404) {
                return window.history.back()
            }
            checkResponse(error.response)
        })
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
                                <Button className='red_button'>Выйти из системы</Button>
                            </> : ''
                        }
                    </>}/>
            <div className="window_main_content profile_content">
                <Filters>
                    <Textbox type='number' className='profile_content__filter' min={0} label='Минимальное кол-во задач'
                             id={'min_total_tasks'}></Textbox>
                    <Textbox type='number' className='profile_content__filter' min={0} label='Максимальное кол-во задач'
                             id={'max_total_tasks'}></Textbox>
                    <Ordering id='total_tasks_ordering'>Количество задач</Ordering>
                </Filters>
            </div>
        </>
    )
}