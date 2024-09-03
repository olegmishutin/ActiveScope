import './registration.css'
import '../../assets/styles/authPages.css'
import registrationImage from '../../assets/images/registration image.png'

import AuthWindow from "../../components/AuthWindow/authWindow.jsx"
import Textbox from "../../widgets/Textbox/textbox.jsx"

export default function Registration() {
    const description = 'С ActiveScope вы станете частью захватывающего мира управления проектами. ' +
        'Вступайте в команды, создавайте проекты, назначайте задачи и следите за их выполнением в реальном времени. ' +
        'ActiveScope обеспечивает прозрачность и удобство в управлении проектами, позволяя вам и вашей команде ' +
        'сосредотачиваться на важном: достижении целей. Раскройте ваш потенциал ' +
        'с ActiveScope - вашим надежным партнером в управлении проектами.'

    return (
        <>
            <div className="auth_box">
                <AuthWindow className='registration_window' headerText='Регистрация в ActiveScope'
                            descriptionImage={registrationImage}
                            description={description} formButtonText='Зарегистрироваться' hrefText='Войти'
                            anotherPage='/login/'>
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