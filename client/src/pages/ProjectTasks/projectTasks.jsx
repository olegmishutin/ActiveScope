import './projectTasks.css'
import {useParams} from "react-router-dom";
import ProjectBase from "../../components/ProjectBase/projectBase.jsx";
import {useEffect, useState} from "react";
import axios from "axios";
import {GET} from "../../utils/methods.jsx";
import {checkResponse} from "../../utils/response.jsx";
import Button from "../../widgets/Button/button.jsx";
import Filters from "../../components/Filters/filters.jsx";
import Textbox from "../../widgets/Textbox/textbox.jsx";
import Dropdown from "../../widgets/Dropdown/dropdown.jsx";
import Checkbox from "../../widgets/Checkbox/checkbox.jsx";

export default function ProjectTasks(){
    let {id} = useParams()
    const [project, setProject] = useState({})

    useEffect(() => {
        axios(GET(`/api/projects/${id}/`)).then(
            (response) => {
                checkResponse(response, setProject, response.data)
            }
        ).catch((error) => {
            checkResponse(error.response)
        })
    }, [id]);

    return (
        <>
            <ProjectBase project={project}/>
            <div className="window_main_content">
                <div className="project_task_manage_buttons">
                    <Button>Создать задачу</Button>
                    <Button>Сатусы</Button>
                    <Button>Приоритеты</Button>
                </div>
                <Filters>
                    <Textbox id='start_date' type='date' label='Дата начала'/>
                    <Textbox id='end_date' type='date' label='Дата окончания'/>
                    <Dropdown name='Исполнитель' style={{zIndex: 5}}>
                        <Checkbox splash={true}>Мишутин Олег</Checkbox>
                        <Checkbox splash={true}>Чижиков Алексей</Checkbox>
                    </Dropdown>
                    <Dropdown name='Статус' style={{zIndex: 4}}>
                        <Checkbox splash={true} background_color='#6CBB50'>Новая</Checkbox>
                        <Checkbox splash={true} background_color='#EC625F'>Закончена</Checkbox>
                    </Dropdown>
                    <Dropdown name='Приоритет' style={{zIndex: 3}}>
                        <Checkbox splash={true} background_color='#EC625F'>Высокий</Checkbox>
                        <Checkbox splash={true} background_color='#6CBB50'>Маленький</Checkbox>
                    </Dropdown>
                </Filters>
            </div>
        </>
    )
}