import './button.css'

export default function Button(props) {
    return (
        <>
            <button className={`default_button ${props.className}`} type='button'
                    onClick={props.onClick}>{props.children}</button>
        </>
    )
}