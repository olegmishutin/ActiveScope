import './textbox.css'
import '../../assets/styles/widgetsEffects.css'

export default function Textbox(props) {
    if (props.type !== 'textarea') {
        return (
            <>
                <div className="textbox">
                    <p className='textbox__error' id={`${props.id}_error`}></p>
                    <div className={`widget default_textbox hoverEffect ${props.className}`}>
                        <label className={`default_textbox__label ${props.labelClassName}`} htmlFor={props.id}>
                            {props.label}{props.isRequired ? <span>*</span> : ''}:
                        </label>
                        <input type={props.type ? props.type : 'text'}
                               className={`default_textbox__input ${props.inputClassName}`} id={props.id}
                               name={props.name}
                               defaultValue={props.defaultValue} min={props.min}/>
                    </div>
                </div>
            </>
        )
    } else {
        return (
            <>
                <div className="textbox textbox_textarea">
                    <p className='textbox__error' id={`${props.id}_error`}></p>
                    <textarea className={`widget default_textbox textarea hoverEffect ${props.className}`}
                              placeholder={props.placeholder} id={props.id} name={props.name}
                              defaultValue={props.defaultValue}></textarea>
                </div>
            </>
        )
    }
}