import './messages.css'

import {useState, useEffect} from "react"
import axios from "axios"
import {GET} from "../../utils/methods.jsx"
import {checkResponse} from "../../utils/response.jsx"

import Ordering from "../../widgets/Ordering/ordering.jsx"
import Selection from "../../widgets/Selection/selection.jsx"
import Checkbox from "../../widgets/Checkbox/checkbox.jsx"
import BackButton from "../../widgets/BackButton/backButton.jsx"
import Button from "../../widgets/Button/button.jsx"

export default function Messages(props) {
    const [themes, setThemes] = useState([])

    useEffect(() => {
        axios(GET('/api/messages_topics/')).then(
            (response) => {
                checkResponse(response, setThemes, response.data)
            }
        ).catch((error) => {
            checkResponse(error.response)
        })
    }, []);

    return (
        <>
            <aside className="messages" id='messages_panel'>
                <div className="messages__header">
                    <div className="messages__header__filters">
                        <Ordering id='date'>Дата</Ordering>
                        <Selection className='messages__header__filters__selection' data={themes}
                                   flat={true}>Тема</Selection>
                        <Checkbox id='is_readed'>Прочитано</Checkbox>
                        <Checkbox id='is_not_readed'>Не прочитано</Checkbox>
                    </div>
                    <BackButton className='messages__header__back_button' onClick={() => {
                        const messagesPanel = document.getElementById('messages_panel')
                        messagesPanel.classList.remove('show_messages')
                        messagesPanel.classList.add('hide_messages')
                    }}/>
                </div>
                <ul className='messages__list'>
                    {
                        props.messages.map((message) => {
                            return (
                                <>
                                    <li className='messages__list__message'>
                                        <h3 className='messages__list__message__topic'>{message.topic}</h3>
                                        <p className='messages__list__message__date'>Дата: {message.date}</p>
                                        <p className='messages__list__message__text'>{message.text}</p>
                                        <div className="messages__list__message__buttons">
                                            {
                                                message.topic_code in ['INV_GROUP', 'INV_PROJECT'] ?
                                                    <>
                                                        <Button
                                                            className='light_button messages__list__message__buttons__button'>Принять</Button>
                                                        <Button
                                                            className='red_button messages__list__message__buttons__button'>Отклонить</Button>
                                                    </> :
                                                    <>
                                                        <Button
                                                            className='light_button messages__list__message__buttons__button'>Прочитано</Button>
                                                    </>
                                            }
                                        </div>
                                    </li>
                                </>
                            )
                        })
                    }
                </ul>
            </aside>
        </>
    )
}