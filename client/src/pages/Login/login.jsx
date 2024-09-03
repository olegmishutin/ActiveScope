import '../../assets/styles/authPages.css'
import loginImage from '../../assets/images/login image.png'

import AuthWindow from "../../components/AuthWindow/authWindow.jsx"
import Textbox from "../../widgets/Textbox/textbox.jsx"

export default function Login() {
    const description = 'Добро пожаловать в ActiveScope - ваш личный помощник в управлении проектами и задачами! ' +
        'Здесь вы можете создавать проекты, разрабатывать задачи и эффективно работать в команде. ' +
        'Наша платформа позволяет вам не только управлять коллективными задачами, но и создавать личные задачи, а ' +
        'также приглашать других участников для совместной работы. Присоединяйтесь к ActiveScope прямо сейчас и ' +
        'превратите свои идеи в результаты!'

    return (
        <>
            <div className="auth_box">
                <AuthWindow className='login_window' headerText='Вход в ActiveScope' descriptionImage={loginImage}
                            description={description} formButtonText='Войти' hrefText='Регистрация'
                            anotherPage='/registration/'>
                    <Textbox type='email' id='email' label='Email' isRequired={true}/>
                    <Textbox type='password' id='password' label='Пароль' isRequired={true}/>
                </AuthWindow>
            </div>
        </>
    )
}