import './dropdown.css'
import '../../assets/styles/widgetsEffects.css'

export default function Dropdown(props){
    return (
        <>
            <div className="dropdown_box" style={props.style}>
                <details className="dropdown hoverEffect">
                    <summary className="dropdown__header">
                        {props.name}
                    </summary>
                    <div className="dropdown__content" id={props.id}>
                        {props.children}
                    </div>
                </details>
            </div>
        </>
    )
}