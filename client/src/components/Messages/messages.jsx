import './messages.css'

import Ordering from "../../widgets/Ordering/ordering.jsx"
import Selection from "../../widgets/Selection/selection.jsx"
import Checkbox from "../../widgets/Checkbox/checkbox.jsx"
import BackButton from "../../widgets/BackButton/backButton.jsx"

export default function Messages() {
    return (
        <>
            <div className="messages" id='messages_panel'>
                <div className="messages__header">
                    <div className="messages__header__filters">
                        <Ordering>Дата</Ordering>
                        <Selection className='messages__header__filters__selection' data={[]}>Тема</Selection>
                        <Checkbox id='is_readed'>Прочитано</Checkbox>
                        <Checkbox id='is_not_readed'>Не прочитано</Checkbox>
                    </div>
                    <BackButton className='messages__header__back_button' onClick={() => {
                        const messagesPanel = document.getElementById('messages_panel')
                        messagesPanel.classList.remove('show_messages')
                        messagesPanel.classList.add('hide_messages')
                    }}/>
                </div>
            </div>
        </>
    )
}