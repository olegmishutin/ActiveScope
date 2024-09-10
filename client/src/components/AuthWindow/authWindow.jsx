import './authWindow.css'
import '../../assets/styles/widgetsEffects.css'
import logo from '../../assets/images/logo.svg'
import {Link} from "react-router-dom"

import Button from "../../widgets/Button/button.jsx"

export default function AuthWindow(props) {
    return (
        <>
            <div className="auth_box">
                <div className={`auth_window ${props.className}`}>
                    <div className="auth_window__header">
                        <Link to='/' className="auth_window__header__logo hoverEffect">
                            <img src={logo} alt='logo'/>
                        </Link>
                        <h1 className='auth_window__header__text'>{props.headerText}</h1>
                    </div>
                    <div className="auth_window__content">
                        <form className="auth_window__content__form">
                            <p className='auth_window__content__form__status'>{props.status}</p>
                            <div className="auth_window__content__form__inputs">
                                {props.children}
                            </div>
                            <Button className='auth_window__content__form__button light_button'
                                    onClick={props.onClick}>{props.formButtonText}</Button>
                            <Link className='auth_window__content__form__link'
                                  to={props.anotherPage}>{props.hrefText}</Link>
                        </form>
                        <div className="auth_window__content__description">
                            <div className="auth_window__content__description__image">
                                <img src={props.descriptionImage} alt='description image'/>
                            </div>
                            <p className='auth_window__content__description__text'>{props.description}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}