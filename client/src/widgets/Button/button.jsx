import './button.css'
import '../../assets/styles/widgetsEffects.css'

export default function Button(props) {
    return (
        <>
            <button className={`widget default_button hoverEffect ${props.className}`} type='button' id={props.id}
                    onClick={props.onClick}>{props.children}</button>
        </>
    )
}