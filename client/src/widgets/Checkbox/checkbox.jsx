import './checkbox.css'
import '../../assets/styles/widgetsEffects.css'

export default function Checkbox(props) {
    return (
        <>
            <label className={`default_checkbox ${props.className} ${
                props.splash ? 'splashed_checkbox' : 'hoverEffect'
            } ${
                !props.background_color && props.splash ? 'splashed_checkbox_background' : ''
            }`} style={{backgroundColor: props.background_color}} htmlFor={props.id}>
                <input type='checkbox' id={props.id} defaultChecked={props.defaultChecked} onClick={(e) => {
                    const indicator = document.getElementById(`${props.id}_indicator`)
                    if (e.target.checked) {
                        indicator.classList.add('default_checkbox__checked')
                    } else {
                        indicator.classList.remove('default_checkbox__checked')
                    }
                }} onChange={props.onChange}/>
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