import './listElement.css'

export default function ListElement(props) {
    return (
        <>
            <li className='list_element'>
                <div className="list_element__header">
                    <div className="list_element__header__info">
                        <div className="list_element__header__info__icon">
                            <img src={props.icon ? props.icon : props.defaultIcon} alt='icon' loading='lazy'/>
                        </div>
                        <p className="list_element__header__text">
                            {props.headerText}
                        </p>
                    </div>
                    {props.children}
                </div>
                <div className="list_element__description">
                    <p className='list_element__description__text'>{props.text}</p>
                </div>
            </li>
        </>
    )
}