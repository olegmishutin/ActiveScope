import './backButton.css'
import arrowIcon from '../../assets/images/arrow.svg'

export default function BackButton(props) {
    return (
        <>
            <button className={`backButton ${props.className}`} onClick={props.onClick}>
                <img src={arrowIcon} alt='icon'/>
            </button>
        </>
    )
}