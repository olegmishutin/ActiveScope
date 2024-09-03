import './button.css'
import '../../assets/styles/widgetsEffects.css'

export default function Button(props) {
    return (
        <>
            <button className={`default_button hoverEffect ${props.className}`} type='button'
                    onClick={props.onClick}>{props.children}</button>
        </>
    )
}