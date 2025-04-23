import './messages.css'

import {useState, useEffect} from "react"
import axios from "axios"
import {GET, PATCH,} from "../../utils/methods.jsx"
import {checkResponse} from "../../utils/response.jsx"

import Ordering from "../../widgets/Ordering/ordering.jsx"
import Selection from "../../widgets/Selection/selection.jsx"
import Checkbox from "../../widgets/Checkbox/checkbox.jsx"
import BackButton from "../../widgets/BackButton/backButton.jsx"
import Button from "../../widgets/Button/button.jsx"
import {getFilters} from "../../utils/data.jsx";
import {useNavigate} from 'react-router-dom';
import {changePanel} from "../SidePanel/sidePanel.jsx";

export function getIsReadedForUrl(url) {
    const isReadedCheckbox = document.getElementById('is_readed')
    const isNotReadedCheckbox = document.getElementById('is_not_readed')

    if (isReadedCheckbox.checked && isNotReadedCheckbox.checked) {
        url += `&is_readed=${true}, ${false}`
    } else if (isReadedCheckbox.checked) {
        url += `&is_readed=${true}`
    } else if (isNotReadedCheckbox.checked) {
        url += `&is_readed=${false}`
    }

    return url
}

export function getNewMessagesCount(messagesCountSetter) {
    axios(GET('/api/new_messages_count/')).then(
        (response) => {
            checkResponse(response, messagesCountSetter, response.data.count)
        }
    ).catch((error) => {
        checkResponse(error.response)
    })
}

export function getMessages(messagesSetter, messagesCountSetter) {
    let url = '/api/messages/'
    url = getFilters(url, [
        'ordering_date',
        'topic'
    ])
    url = getIsReadedForUrl(url)

    axios(GET(url)).then(
        (response) => {
            checkResponse(response, messagesSetter, response.data, () => {
                getNewMessagesCount(messagesCountSetter)
            })
        }
    ).catch((error) => {
        checkResponse(error.response)
    })
}

export default function Messages(props) {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([...props.messages])
    const [themes, setThemes] = useState([])

    function readMessage(id, agreement, need_update_projects) {
        const data = {}

        if (agreement) {
            data['agreement'] = agreement
        }

        axios(PATCH(`/api/messages/${id}/`, data)).then(
            (response) => {
                checkResponse(response, null, null, () => {
                    getMessages(setMessages, props.messagesCountSetter)

                    if (need_update_projects) {
                        props.update_projects_method()
                    }
                })
            }
        ).catch((error) => {
            checkResponse(error.response)
        })
    }

    useEffect(() => {
        axios(GET('/api/messages_topics/')).then(
            (response) => {
                checkResponse(response, setThemes, response.data)
            }
        ).catch((error) => {
            checkResponse(error.response)
        })
    }, []);

    useEffect(() => {
        setMessages(props.messages)
    }, [props.messages]);

    function closeMessagePanel() {
        const messagesPanel = document.getElementById('messages_panel')
        messagesPanel.classList.remove('show_messages')
        messagesPanel.classList.add('hide_messages')
    }

    return (
        <>
            <aside className="messages" id='messages_panel'>
                <div className="messages__header">
                    <div className="messages__header__filters">
                        <Ordering id='ordering_date' onChange={() => {
                            getMessages(setMessages, props.messagesCountSetter)
                        }}>Дата</Ordering>
                        <Selection className='messages__header__filters__selection' data={themes} id='topic'
                                   flat={true} onChange={() => {
                            getMessages(setMessages, props.messagesCountSetter)
                        }}>Тема</Selection>
                        <Checkbox id='is_readed' onChange={() => {
                            getMessages(setMessages, props.messagesCountSetter)
                        }}>Прочитано</Checkbox>
                        <Checkbox id='is_not_readed' defaultChecked={true} onChange={() => {
                            getMessages(setMessages, props.messagesCountSetter)
                        }}>Не
                            прочитано</Checkbox>
                    </div>
                    <BackButton className='messages__header__back_button' onClick={closeMessagePanel}/>
                </div>
                <ul className='messages__list'>
                    {
                        messages.map((message) => {
                            return (
                                <>
                                    <li className='messages__list__message'>
                                        <h3 className='messages__list__message__topic'>{message.topic}</h3>
                                        <p className='messages__list__message__date'>Дата: {message.date}</p>
                                        <p className='messages__list__message__text'>{message.text}</p>
                                        <div className="messages__list__message__buttons">
                                            {
                                                !message.is_readed ?
                                                    <>
                                                        <>
                                                            {
                                                                ['INV_GROUP', 'INV_PROJECT'].includes(message.topic_code) ?
                                                                    <>
                                                                        <Button
                                                                            className='light_button messages__list__message__buttons__button'
                                                                            onClick={() => {
                                                                                readMessage(message.id, true, true)
                                                                            }}>Принять</Button>
                                                                        <Button
                                                                            className='red_button messages__list__message__buttons__button'
                                                                            onClick={() => {
                                                                                readMessage(message.id, false, false)
                                                                            }}>Отклонить</Button>
                                                                    </> : ''
                                                            }
                                                            {
                                                                message.topic_code === 'PROJECT_MESSAGE' ? <>
                                                                    <Button
                                                                        className='light_button messages__list__message__buttons__button'
                                                                        onClick={() => {
                                                                            readMessage(message.id)
                                                                            closeMessagePanel()

                                                                            changePanel('panel', 'show_panel', 'hidden_panel')
                                                                            navigate(`/project/${message.messanger_id}/messanger?message=${message.message_id}`)
                                                                        }}>Перейти к сообщению
                                                                    </Button>
                                                                </> : ''
                                                            }
                                                            <Button
                                                                className='light_button messages__list__message__buttons__button'
                                                                onClick={() => {
                                                                    readMessage(message.id)
                                                                }}>Прочитано
                                                            </Button>
                                                        </>
                                                    </> : ''
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