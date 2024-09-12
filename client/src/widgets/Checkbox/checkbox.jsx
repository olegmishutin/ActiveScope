import './checkbox.css'
import '../../assets/styles/widgetsEffects.css'

export default function Checkbox(props) {
    return (
        <>
            <label className={`default_checkbox hoverEffect ${props.className}`} htmlFor={props.id}>
                <input type='checkbox' id={props.id} defaultChecked={props.defaultChecked} onClick={(e) => {
                    const indicator = document.getElementById(`${props.id}_indicator`)
                    if (e.target.checked) {
                        indicator.classList.add('default_checkbox__checked')
                    } else {
                        indicator.classList.remove('default_checkbox__checked')
                    }
                }}/>
                <div className="default_checkbox__background">
                    <div className="default_checkbox__foreground">
                        <div className={props.defaultChecked ? 'default_checkbox__checked' : ''}
                             id={`${props.id}_indicator`}></div>
                    </div>
                </div>
                {props.children}
            </label>
        </>
    )
}