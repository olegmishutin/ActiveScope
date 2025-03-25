import Button from "../../widgets/Button/button.jsx"
import Selection from "../../widgets/Selection/selection.jsx"
import Modal from "../Modal/modal.jsx"


export default function InviteModal(props) {
    return (
        <>
            <Modal id={props.id} status={props.inviteStatus} className={props.className}
                   extendCloseFunc={props.extendCloseFunc} manageButtons={
                <Button
                    onClick={props.inviteUserFunc}>{props.inviteButtonText ? props.inviteButtonText : 'Пригласить'}</Button>
            }>
                <div className="invite_modal_content">
                    <Selection className={props.selectionClassName} id='groups_selection' data={props.groups}
                               onChange={props.onChange}>Выберите
                        группу</Selection>
                    {props.children}
                </div>
            </Modal>
        </>
    )
}