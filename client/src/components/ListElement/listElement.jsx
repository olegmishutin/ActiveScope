import './listElement.css'
import detailsIcon from '../../assets/images/detail icon.svg'

export default function ListElement(props) {
    return (
        <>
            <li className={`list_element ${props.className}`}>
                <div className="list_element__header">
                    <div className="list_element__header__info">
                        <div className={`list_element__header__info__icon ${props.roundedIcon ? 'round' : ''}`}>
                            <img src={props.icon ? props.icon : props.defaultIcon} alt='icon' loading='lazy'/>
                        </div>
                        <p className="list_element__header__text">
                            {props.headerText}
                        </p>
                    </div>
                    {props.children}
                </div>
                <div className="list_element__additional_buttons">
                    {props.additionalButtons}
                </div>
                <div className="list_element__description">
                    <p className='list_element__description__text'>{props.text}</p>
                </div>
                {
                    props.detail ? <>
                        <details className='list_element__details'>
                            <summary className='list_element__details__summary'>
                                <div className="list_element__details__summary__icon">
                                    <img src={detailsIcon} alt='icon' loading='lazy'/>
                                </div>
                                {props.detailName ? props.detailName : 'Участники'}
                            </summary>
                            {props.detail}
                        </details>
                    </> : ''
                }
            </li>
        </>
    )
}