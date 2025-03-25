import './dropdown.css'
import '../../assets/styles/widgetsEffects.css'

export default function Dropdown(props){
    return (
        <>
            <div className={`dropdown_box ${props.className}`} style={props.style}>
                <details className="dropdown hoverEffect" id={`${props.id}_details`}>
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