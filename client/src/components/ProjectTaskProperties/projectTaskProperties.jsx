import './projectTaskProperties.css'
import Modal from "../Modal/modal.jsx";
import Button from "../../widgets/Button/button.jsx";
import Textbox from "../../widgets/Textbox/textbox.jsx";
import {HexColorPicker} from "react-colorful";
import Checkbox from "../../widgets/Checkbox/checkbox.jsx";
import {useState} from "react";

export default function ProjectTaskProperties(props) {
    const [color, setColor] = useState('#000000')

    return (
        <>
            <Modal id={props.id} manageButtons={<>
                <Button onClick={() => {
                    const modal = document.getElementById(`${props.id}_manage`)
                    modal.classList.add('show_modal')
                    modal.classList.remove('hide_modal')

                    const button = document.getElementById(`${props.id}_manage_button`)
                    button.textContent = 'Создать'
                    button.onclick = () => {
                        let color = document.getElementById(`${props.id}_hex_color_value`).innerHTML
                        color = color.replace('#', '')
                        props.createFunc(color)
                    }

                    props.statusSetter('')
                }}>Создать {props.whatCreate}</Button>
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
            <Modal id={`${props.id}_manage`} status={props.status} manageButtons={<>
                <Button id={`${props.id}_manage_button`}/>
            </>}>
                <div className="project_task_properties_manage">
                    <Textbox id={`${props.prefix}_name`} label='Название' isRequired={true}/>
                    <HexColorPicker id={`${props.prefix}_color`} color={color} onChange={setColor}
                                    className='project_task_properties_manage__color'/>
                    <p id={`${props.id}_hex_color_value`} style={{display: "none"}}>{color}</p>
                    {
                        props.prefix === 'status' ? <>
                            <Checkbox className='project_task_properties_manage__checkbox'
                                      id={`${props.prefix}_is_means_completeness`}>Статус законченности</Checkbox>
                        </> : ''
                    }
                </div>
            </Modal>
        </>
    )
}