import './textbox.css'

export default function Textbox(props) {
    return (
        <>
            <div className={`default_textbox ${props.className}`}>
                <label className={`default_textbox__label ${props.labelClassName}`} htmlFor={props.id}>
                    {props.label}{props.isRequired ? <span>*</span> : ''}:
                </label>
                <input type={props.type ? props.type : 'text'}
                       className={`default_textbox__input ${props.inputClassName}`} id={props.id} name={props.name}
                       defaultValue={props.defaultValue}/>
            </div>
        </>
    )
}