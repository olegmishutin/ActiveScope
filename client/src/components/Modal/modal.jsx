import './modal.css'

import Button from "../../widgets/Button/button.jsx"

export default function Modal(props) {
    function closeModal() {
        const modal = document.getElementById(props.id)
        modal.classList.remove('show_modal')
        modal.classList.add('hide_modal')
    }

    return (
        <>
            <div className='modal' id={props.id}>
                <div className={`modal__window ${props.className}`}>
                    <div className={`modal__window__content ${props.contentClassName}`}>
                        {props.children}
                    </div>
                    <p className='modal__window__status'>{props.status}</p>
                    <div className="modal__window__manage_button">
                        {props.manageButtons}
                        <Button className='red_button' onClick={closeModal}>Закрыть</Button>
                    </div>
                </div>
            </div>
        </>
    )
}