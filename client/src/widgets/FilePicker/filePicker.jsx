import './filePicker.css'
import '../../assets/styles/widgetsEffects.css'
import bigFilePickerIcon from '../../assets/images/big file picker.svg'
import smallFilePickerIcon from '../../assets/images/small file picker.svg'

export default function FilePicker(props) {
    return (
        <>
            <label
                className={`default_file_picker ${props.big ? 'big_file_picker' : ''} ${props.className} hoverEffect`}
                htmlFor={props.id}>
                <input type='file' multiple={props.multiple} id={props.id} accept={props.accept}/>
                <div className="default_file_picker__icon">
                    <img src={props.big ? bigFilePickerIcon : smallFilePickerIcon} alt='icon' loading='lazy'/>
                </div>
                {props.children}
                {
                    props.remove_error ? '' : <p className='default_file_picker__error' id={`${props.id}_error`}></p>
                }
            </label>
        </>
    )
}