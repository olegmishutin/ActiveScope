import '../../assets/styles/authPages.css'
import registrationImage from '../../assets/images/registration image.png'

import axios from "axios"
import {useState} from "react"
import {POST} from "../../utils/methods.jsx"
import {checkResponse} from "../../utils/response.jsx"
import {getDate} from "../../utils/date.jsx"
import {getJsonDataByIDs} from "../../utils/data.jsx"

import AuthWindow from "../../components/AuthWindow/authWindow.jsx"
import Textbox from "../../widgets/Textbox/textbox.jsx"

export default function Registration() {
    const [status, setStatus] = useState('')

    const description = 'С ActiveScope вы станете частью захватывающего мира управления проектами. ' +
        'Вступайте в команды, создавайте проекты, назначайте задачи и следите за их выполнением в реальном времени. ' +
        'ActiveScope обеспечивает прозрачность и удобство в управлении проектами, позволяя вам и вашей команде ' +
        'сосредотачиваться на важном: достижении целей. Раскройте ваш потенциал ' +
        'с ActiveScope - вашим надежным партнером в управлении проектами.'

    function register(event) {
        const data = getJsonDataByIDs([
            'first_name', 'last_name', 'patronymic', 'email', 'password'
        ])

        const birth_date = document.getElementById('birth_date').value
        if (birth_date) {
            data['birth_date'] = getDate(birth_date)
        }

        axios(POST('/api/registration/', data)).then(
            (response) => {
                checkResponse(response, setStatus, 'Успешно зарегистрировались!')
            }
        ).catch((error) => {
            checkResponse(error.response, setStatus)
        })
        event.preventDefault()
    }

    return (
        <>
            <div className="auth_box">
                <AuthWindow className='registration_window' headerText='Регистрация в ActiveScope'
                            descriptionImage={registrationImage} description={description} status={status}
                            formButtonText='Зарегистрироваться' hrefText='Войти' anotherPage='/login/'
                            onClick={register}>
                    <Textbox id='first_name' label='Ваше имя' isRequired={true}/>
                    <Textbox id='last_name' label='Ваша фамилия' isRequired={true}/>
                    <Textbox id='patronymic' label='Ваше отчество'/>
                    <Textbox type='date' id='birth_date' label='Дата рождения'/>
                    <Textbox type='email' id='email' label='Ваш email' isRequired={true}/>
                    <Textbox type='password' id='password' label='Пароль' isRequired={true}/>
                </AuthWindow>
            </div>
        </>
    )
}