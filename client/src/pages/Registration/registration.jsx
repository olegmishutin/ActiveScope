import registrationImage from '../../assets/images/registration image.png'

import axios from "axios"
import {useState} from "react"
import {POST} from "../../utils/methods.jsx"
import {checkResponse} from "../../utils/response.jsx"
import {getDateFromInput} from "../../utils/date.jsx"
import {getDataByIDs} from "../../utils/data.jsx"

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
        const data = getDataByIDs([
            'first_name', 'last_name', 'patronymic', 'email', 'password', 'birth_date'
        ], false)

        if (data.birth_date) {
            data.birth_date = getDateFromInput(birth_date)
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
            <AuthWindow className='registration_window' headerText='Регистрация в ActiveScope'
                        descriptionImage={registrationImage} description={description} status={status}
                        formButtonText='Зарегистрироваться' hrefText='Войти' anotherPage='/login/'
                        onClick={register}>
                <Textbox className='light_textbox' id='first_name' label='Ваше имя' isRequired={true}/>
                <Textbox className='light_textbox' id='last_name' label='Ваша фамилия' isRequired={true}/>
                <Textbox className='light_textbox' id='patronymic' label='Ваше отчество'/>
                <Textbox className='light_textbox' type='date' id='birth_date' label='Дата рождения'/>
                <Textbox className='light_textbox' type='email' id='email' label='Ваш email' isRequired={true}/>
                <Textbox className='light_textbox' type='password' id='password' label='Пароль' isRequired={true}/>
            </AuthWindow>
        </>
    )
}