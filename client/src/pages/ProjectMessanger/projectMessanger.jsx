import './projectMessanger.css'
import {useState, useEffect} from "react";
import {useParams} from "react-router-dom";
import axios from "axios";
import {GET} from "../../utils/methods.jsx";
import {checkResponse} from "../../utils/response.jsx";
import Messanger from "../../components/Messanger/messanger.jsx";
import projectIcon from '../../assets/images/project big.svg'

export default function ProjectMessanger() {
    const {id} = useParams()
    const [project, setProject] = useState({})

    useEffect(() => {
        axios(GET(`/api/projects/${id}/`)).then(
            (response) => {
                checkResponse(response, setProject, response.data)
            }
        ).catch((error) => {
            checkResponse(error.response, null, null, null, true)
        })
    }, [id]);

    return (
        <>
            <Messanger back_button_url={`/project/${id}/tasks`} header_icon={project.icon}
                       default_header_icon={projectIcon} title={project.name}>
                <li className='messanger__message right_message'>
                    <p>Привет, ты как?</p>
                    <p className='messanger__message__date'>15.04.2025</p>
                </li>
                <li className='messanger__message left_message'>
                    <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
                        the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley
                        of type and scrambled it to make a type specimen book. It has survived not only five centuries,
                        but also the leap into electronic typesetting, remaining essentially unchanged.</p>
                    <p className='messanger__message__date'>15.04.2025</p>
                </li>
                <li className='messanger__message right_message'>
                    <p>пиздец</p>
                    <p className='messanger__message__date'>15.04.2025</p>
                </li>
                <li className='messanger__message right_message'>
                    <p>ИДИ НАХУУУЙЙЙЙЙЙ</p>
                    <p className='messanger__message__date'>15.04.2025</p>
                </li>
                <li className='messanger__message left_message'>
                    <p>ИДИ НАХУУУЙЙЙЙЙЙ</p>
                    <p className='messanger__message__date'>15.04.2025</p>
                </li>
            </Messanger>
        </>
    )
}