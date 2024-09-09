import '../../assets/styles/authPages.css'
import loginImage from '../../assets/images/login image.png'

import axios from "axios"
import {useState} from "react"
import {getJsonDataByIDs} from "../../utils/data.jsx"
import {POST} from "../../utils/methods.jsx"
import {checkResponse} from "../../utils/response.jsx"

import AuthWindow from "../../components/AuthWindow/authWindow.jsx"
import Textbox from "../../widgets/Textbox/textbox.jsx"

export default function Login() {
    const [status, setStatus] = useState('')
    const description = 'Добро пожаловать в ActiveScope - ваш личный помощник в управлении проектами и задачами! ' +
        'Здесь вы можете создавать проекты, разрабатывать задачи и эффективно работать в команде. ' +
        'Наша платформа позволяет вам не только управлять коллективными задачами, но и создавать личные задачи, а ' +
        'также приглашать других участников для совместной работы. Присоединяйтесь к ActiveScope прямо сейчас и ' +
        'превратите свои идеи в результаты!'

    function login(event) {
        const data = getJsonDataByIDs([
            'email', 'password'
        ])

        axios(POST('/api/login/', data)).then(
            (response) => {
                checkResponse(response, setStatus, 'Успешно вошли в систему!', () => {
                    if (response.status === 200) {
                        window.localStorage.setItem('token', response.data['token'])
                    }
                })
            }
        ).catch((error) => {
            checkResponse(error.response, setStatus)
        })
        event.preventDefault()
    }

    return (
        <>
            <div className="auth_box">
                <AuthWindow className='login_window' headerText='Вход в ActiveScope' descriptionImage={loginImage}
                            description={description} formButtonText='Войти в систему' hrefText='Регистрация'
                            anotherPage='/registration/' status={status} onClick={login}>
                    <Textbox className='light_textbox' type='email' id='email' label='Email' isRequired={true}/>
                    <Textbox className='light_textbox' type='password' id='password' label='Пароль' isRequired={true}/>
                </AuthWindow>
            </div>
        </>
    )
}