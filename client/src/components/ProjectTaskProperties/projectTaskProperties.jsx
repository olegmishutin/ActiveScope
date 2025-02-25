import './projectTaskProperties.css'
import Modal from "../Modal/modal.jsx";
import Button from "../../widgets/Button/button.jsx";
import Textbox from "../../widgets/Textbox/textbox.jsx";
import {HexColorPicker} from "react-colorful";
import Checkbox from "../../widgets/Checkbox/checkbox.jsx";
import {useState} from "react";

export default function ProjectTaskProperties(props) {
    const [color, setColor] = useState('#000000')

    function buttonClick(func, text, textboxValue, checkboxChecked) {
        const modal = document.getElementById(`${props.id}_manage`)
        modal.classList.add('show_modal')
        modal.classList.remove('hide_modal')

        const button = document.getElementById(`${props.id}_manage_button`)
        button.textContent = text
        button.onclick = () => {
            let color = document.getElementById(`${props.id}_hex_color_value`).innerHTML
            color = color.replace('#', '')
            func(color)
        }

        const textbox = document.getElementById(`${props.prefix}_name`)
        textbox.value = textboxValue

        if (props.prefix === 'status') {
            const checkbox = document.getElementById(`${props.prefix}_is_means_completeness`)
            checkbox.checked = checkboxChecked

            const checkboxIndicator = document.getElementById(`${props.prefix}_is_means_completeness_indicator`)
            if (checkboxChecked) {
                checkboxIndicator.classList.add('default_checkbox__checked')
            } else {
                checkboxIndicator.classList.remove('default_checkbox__checked')
            }
        }

        props.statusSetter('')
    }

    return (
        <>
            <Modal id={props.id} className='project_task_properties_modal' manageButtons={<>
                <Button onClick={() => {
                    buttonClick(props.createFunc, 'Создать', '', false)
                }}>Создать {props.whatCreate}</Button>
            </>}>
                <ul className='project_task_properties__list'>
                    {
                        props.data.length > 0 ? props.data.map((value) => {
                            return (
                                <>
                                    <li className='project_task_properties__list__element'>
                                        <div className="project_task_properties__list__element__info">
                                            <p>{value.name}</p>
                                            <div className={props.rounded ? 'rounded' : ''}
                                                  style={{backgroundColor: `#${value.color}`}}></div>
                                        </div>
                                        <div className="project_task_properties__list__element__button">
                                            <Button className='light_button' onClick={() => {
                                                setColor(`#${value.color}`)
                                                buttonClick((color) => {
                                                    props.editFunc(value.id, color)
                                                }, 'Изменить', value.name, value.is_means_completeness)
                                            }}>Изменить</Button>
                                            <Button className='red_button' onClick={() => {
                                                props.deleteFunc(value.id)
                                            }}>Удалить</Button>
                                        </div>
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