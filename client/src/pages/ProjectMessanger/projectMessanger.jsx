import './projectMessanger.css'
import {useState, useEffect} from "react";
import {useParams} from "react-router-dom";
import axios from "axios";
import {GET} from "../../utils/methods.jsx";
import {checkResponse} from "../../utils/response.jsx";
import Messanger from "../../components/Messanger/messanger.jsx";
import projectIcon from '../../assets/images/project big.svg'
import Button from "../../widgets/Button/button.jsx";

export default function ProjectMessanger() {
    const {id} = useParams()
    const [user, setUser] = useState({})
    const [project, setProject] = useState({})
    const [messages, setMessages] = useState([])
    const [watchingImage, setWatchingImage] = useState(null)

    useEffect(() => {
        axios(GET(`/api/projects/${id}/`)).then(
            (response) => {
                checkResponse(response, setProject, response.data)
            }
        ).catch((error) => {
            checkResponse(error.response, null, null, null, true)
        })
        axios(GET('/api/me/')).then(
            (response) => {
                checkResponse(response, setUser, response.data)
            }
        ).catch((error) => {
            checkResponse(error.response)
        })
        axios(GET(`/api/projects/${id}/messages/`)).then(
            (response) => {
                checkResponse(response, setMessages, response.data)
            }
        ).catch((error) => {
            checkResponse(error.response)
        })
    }, [id]);

    function getFileExtension(filename) {
        const parts = filename.split('.');
        return parts.length > 1 ? parts.pop().toLowerCase() : '';
    }

    function getOnlyImages(files) {
        const images = []
        const imageExtensions = [
            "jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff", "tif", "svg",
            "ico", "heic", "heif", "avif", "psd", "raw", "cr2", "nef", "arw", "dng"
        ]

        files.forEach((file) => {
            if (imageExtensions.includes(getFileExtension(file.file_name))) {
                images.push(file)
            }
        })
        return images
    }

    function getOnlyFiles(files) {
        const retFiles = []
        const imageExtensions = [
            "jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff", "tif", "svg",
            "ico", "heic", "heif", "avif", "psd", "raw", "cr2", "nef", "arw", "dng"
        ]

        files.forEach((file) => {
            if (!imageExtensions.includes(getFileExtension(file.file_name))) {
                retFiles.push(file)
            }
        })
        return retFiles
    }

    return (
        <>
            <Messanger back_button_url={`/project/${id}/tasks`} header_icon={project.icon}
                       default_header_icon={projectIcon} title={project.name} imageSetter={setWatchingImage}
                       imageObject={watchingImage}>
                {
                    messages.map((message) => {
                        return (
                            <>
                                <li className={`messanger__message ${message.sender_profile.email !== user.email ? 'left_message' : 'right_message'}`}>
                                    {getOnlyImages(message.files).length > 0 && (
                                        <div className="messanger__message__images">
                                            {getOnlyImages(message.files).map((file, key) => (
                                                <img key={key} src={file.file} alt='image' loading='lazy' onClick={() => {
                                                    const modal = document.getElementById('messanger_image_watcher')
                                                    modal.classList.add('show_modal')
                                                    modal.classList.remove('hide_modal')
                                                    setWatchingImage(file)
                                                }}/>
                                            ))}
                                        </div>
                                    )}
                                    {getOnlyFiles(message.files).length > 0 && (
                                        <div className="messanger__message__files">
                                            {getOnlyFiles(message.files).map((file, key) => (
                                                <div key={key} className='messanger__message__files__file'>
                                                    <a href={`/api/projects/${id}/messages/${message.id}/files/${file.id}/`}>
                                                        {file.file_name}
                                                    </a>
                                                    <Button
                                                        className='messanger__message__files__file__button red_button'>Удалить</Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <p>{message.message}</p>
                                    <p className='messanger__message__date'>{message.timestamp}</p>
                                </li>
                            </>
                        )
                    })
                }
            </Messanger>
        </>
    )
}