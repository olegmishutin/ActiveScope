import './projectTaskProperties.css'
import Modal from "../Modal/modal.jsx";
import Button from "../../widgets/Button/button.jsx";

export default function ProjectTaskProperties(props) {
    return (
        <>
            <Modal id={props.id} manageButtons={<>
                <Button>Создать {props.whatCreate}</Button>
            </>}>
                <ul className='project_task_properties__list'>
                    {
                        props.data.length > 0 ? props.data.map((value) => {
                            return (
                                <>
                                    <li className='project_task_properties__list__element'>
                                        <p>{value.name}
                                            <span className={props.rounded ? 'rounded' : ''}
                                                  style={{backgroundColor: `#${value.color}`}}></span>
                                        </p>
                                        <Button className='light_button'>Изменить</Button>
                                        <Button className='red_button' onClick={() => {
                                            props.deleteFunc(value.id)
                                        }}>Удалить</Button>
                                    </li>
                                </>
                            )
                        }) : <>
                            <p>Пока что тут пусто</p>
                        </>
                    }
                </ul>
            </Modal>
        </>
    )
}