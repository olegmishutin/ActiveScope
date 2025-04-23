import './projectMessanger.css'
import {useState, useEffect} from "react";
import {Link, useParams} from "react-router-dom";
import axios from "axios";
import {DELETE, GET, POST} from "../../utils/methods.jsx";
import {checkResponse} from "../../utils/response.jsx";
import Messanger from "../../components/Messanger/messanger.jsx";
import projectIcon from '../../assets/images/project big.svg';
import userIcon from "../../assets/images/user.svg";
import trashIcon from "../../assets/images/trash.svg";
import Button from "../../widgets/Button/button.jsx";
import {checkConfirmation} from "../../utils/request.jsx";
import {getDataByIDs, getWsConnection} from "../../utils/data.jsx";
import {getImage} from "../../utils/data.jsx";

export default function ProjectMessanger() {
    const {id} = useParams()
    const [user, setUser] = useState({})
    const [project, setProject] = useState({})
    const [messages, setMessages] = useState([])
    const [watchingImage, setWatchingImage] = useState(null)
    const [watchingImageMessageId, setWatchingImageMessageId] = useState(null)
    const [watchingImageUrl, setWatchingImageUrl] = useState(null)
    const [senderIsUser, setSenderIsUser] = useState(false)
    const [uploadedFiles, setUploadedFiles] = useState([])
    const [socket, setSocket] = useState(null)

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

        const socket = getWsConnection(
            `/project/${id}/messages/?token=${localStorage.getItem('token')}`
        )
        socket.onopen = () => {
            setSocket(socket)
        }
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

    function deleteMessage(message_id) {
        checkConfirmation(
            'Уверены, что хотите удалить это сообщение?',
            () => {
                axios(DELETE(`/api/projects/${id}/messages/${message_id}/`)).then(
                    (response) => {
                        checkResponse(response)
                    }
                ).catch((error) => {
                    checkResponse(error.response)
                })
            }
        )
    }

    function deleteFile(message_id, file_id) {
        checkConfirmation(
            'Уверены, что хотите удалить этот файл?',
            () => {
                axios(DELETE(`/api/projects/${id}/messages/${message_id}/files/${file_id}/`)).then(
                    (response) => {
                        checkResponse(response, null, null, () => {
                            const modal = document.getElementById('messanger_image_watcher')
                            modal.classList.remove('show_modal')
                            modal.classList.add('hide_modal')

                            setTimeout(() => {
                                setWatchingImage(null)
                            }, 500)
                        })
                    }
                ).catch((error) => {
                    checkResponse(error.response)
                })
            }
        )
    }

    function sendMessage() {
        if (!uploadedFiles.length) {
            const data = getDataByIDs([
                    ['message_textarea', 'message']
                ], false, false
            )

            document.getElementById('message_textarea').value = ''
            socket.send(JSON.stringify({object: data}))
        } else {
            const data = getDataByIDs([
                    ['message_textarea', 'message']
                ], true, false
            )

            for (let i = 0; i < uploadedFiles.length; i++) {
                data.append('uploaded_files', uploadedFiles[i])
            }

            axios(POST(`/api/projects/${id}/messages/`, data)).then(
                (response) => {
                    checkResponse(response, null, null, () => {
                        document.getElementById('message_textarea').value = ''
                        setUploadedFiles([])
                    })
                }
            ).catch((error) => {
                checkResponse(error.response)
            })
        }
    }

    return (
        <>
            <Messanger back_button_url={`/project/${id}/tasks`} header_icon={project.icon}
                       default_header_icon={projectIcon} title={project.name} imageSetter={setWatchingImage}
                       imageObject={watchingImage} downloadFileUrl={watchingImageUrl} senderIsUser={senderIsUser}
                       imageObjectMessageId={watchingImageMessageId} deleteWatchingFile={deleteFile}
                       socketObject={socket} setMessages={setMessages} send_func={sendMessage}
                       textbox_id='message_textarea' uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles}
                       messages={messages}
            >
                {
                    messages.map((message) => {
                        return (
                            <>
                                <li className={`messanger__message_box ${message.sender_profile.email !== user.email ? 'left_message' : 'right_message'}`}
                                    id={`message-${message.id}`}>
                                    {
                                        user.email !== message.sender_profile.email ? <>
                                            <Link to={`/users/${message.sender_profile.id}`}
                                                  className='messanger__message_box__user_href'>
                                                <img className='messanger__message_box__user_icon'
                                                     src={message.sender_profile.photo ? getImage(message.sender_profile.photo) : userIcon}
                                                     alt='user' loading='lazy'/>
                                            </Link>
                                        </> : ''
                                    }
                                    <div className="messanger__message">
                                        {getOnlyImages(message.files).length > 0 && (
                                            <div className="messanger__message__images">
                                                {getOnlyImages(message.files).map((file, key) => (
                                                    <img key={key} src={getImage(file.file)} alt='image' loading='lazy'
                                                         onClick={() => {
                                                             const modal = document.getElementById('messanger_image_watcher')
                                                             modal.classList.add('show_modal')
                                                             modal.classList.remove('hide_modal')

                                                             setWatchingImage(file)
                                                             setWatchingImageMessageId(message.id)
                                                             setSenderIsUser(user.email === message.sender_profile.email)
                                                             setWatchingImageUrl(`/api/projects/${id}/messages/${message.id}/files/${file.id}/`)
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
                                                        {
                                                            user.email === message.sender_profile.email ?
                                                                <Button onClick={() => {
                                                                    deleteFile(message.id, file.id)
                                                                }}
                                                                        className='messanger__message__files__file__button red_button'>Удалить
                                                                </Button> : ''
                                                        }
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="messanger__message__info">
                                            <p className='messanger__message__info__text'>{message.message}</p>
                                            <p className='messanger__message__info__date'>{message.timestamp}</p>
                                        </div>
                                    </div>
                                    <button className='messanger__message_box__trash_button' onClick={() => {
                                        deleteMessage(message.id)
                                    }}>
                                        <img src={trashIcon} alt='trash' loading='lazy'/>
                                    </button>
                                </li>
                            </>
                        )
                    })
                }
            </Messanger>
        </>
    )
}