import Button from "../../widgets/Button/button.jsx"
import Selection from "../../widgets/Selection/selection.jsx"
import Modal from "../Modal/modal.jsx"


export default function InviteModal(props) {
    return (
        <>
            <Modal id={props.id} status={props.inviteStatus} manageButtons={
                <Button onClick={props.inviteUserFunc}>Пригласить</Button>
            }>
                <Selection id='groups_selection' data={props.groups}/>
            </Modal>
        </>
    )
}