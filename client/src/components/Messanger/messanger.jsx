import './messanger.css'
import threeDots from "../../assets/images/three dots.svg";
import FilePicker from "../../widgets/FilePicker/filePicker.jsx";
import Textbox from "../../widgets/Textbox/textbox.jsx";
import BackButton from "../../widgets/BackButton/backButton.jsx";
import {Link} from "react-router-dom";
import Modal from "../Modal/modal.jsx";
import Button from "../../widgets/Button/button.jsx";
import {getImage} from "../../utils/data.jsx";
import {useLocation} from "react-router-dom";
import {useEffect, useState} from "react";
import {useSearchParams} from 'react-router-dom';
import axios from "axios";
import {GET} from "../../utils/methods.jsx";
import {checkResponse} from "../../utils/response.jsx";
import userIcon from "../../assets/images/user.svg";
import NoContent from "../NoContent/noContent.jsx";


export default function Messanger(props) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [members, setMembers] = useState([])
    const location = useLocation()
    const socket = props.socketObject

    if (props.socketObject !== null) {
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data)

            if (data.method === 'create') {
                props.setMessages(prevMessages => [data.object, ...prevMessages])
            } else if (data.method === 'update') {
                props.setMessages(prevMessages =>
                    prevMessages.map(msg =>
                        msg.id === data.object.id ? data.object : msg
                    )
                )
            } else if (data.method === 'destroy') {
                props.setMessages(prevMessages =>
                    prevMessages.filter(message => message.id !== data.object.id)
                );
            }
        }
    }

    useEffect(() => {
        const message_id = searchParams.get('message');

        if (message_id) {
            try {
                console.log(searchParams)
                const element = document.getElementById(`message-${message_id}`)
                element.scrollIntoView({behavior: 'smooth', block: 'nearest'})
                setSearchParams({})
            } catch {
                console.log()
            }
        }

        axios(GET(`/api/projects/${props.messanger_id}/members/`)).then(
            (response) => {
                checkResponse(response, setMembers, response.data)
                console.log(members)
            }
        ).catch((error) => {
            checkResponse(error.response)
        })
    }, [location, props.messages]);

    return (
        <>
            <div className='messanger_background'></div>
            <div className='messanger_foreground'></div>
            <div className="messanger">
                <div className="messanger_box">
                    <div className="messanger_box__header">
                        <Link to={props.back_button_url}>
                            <BackButton className='messanger_box__header__back_button'/>
                        </Link>
                        <div className="messanger_box__header__icon">
                            <img src={props.header_icon ? getImage(props.header_icon) : props.default_header_icon}
                                 alt='messanger icon' loading='lazy'/>
                        </div>
                        <div className="messanger_box__header__title">
                            <h3>{props.title}</h3>
                        </div>
                        <button className="messanger_box__header__button" onClick={() => {
                            const modal = document.getElementById('messanger_management_modal')
                            modal.classList.remove('hide_modal')
                            modal.classList.add('show_modal')
                        }}>
                            <img src={threeDots} alt='info' loading='lazy'/>
                        </button>
                    </div>
                    <div className="messanger_box__main">
                        {
                            props.children.length > 0 ? <>
                                <ul className='messanger_box__main__messages'>
                                    {props.children}
                                </ul>
                            </> : <NoContent/>
                        }
                    </div>
                    <div className="messanger_box__footer">
                    {
                            props.uploadedFiles.length ? <>
                                <ul className="messanger_box__footer__files">
                                    {
                                        props.uploadedFiles.map((file, key) => {
                                            return (
                                                <>
                                                    <li className='messanger_box__footer__files__file'>
                                                        <Button className='messanger_box__footer__files__file__button'
                                                                onClick={() => {
                                                                    props.setUploadedFiles(prevItems => prevItems.filter((_, index) => index !== key));
                                                                }}>
                                                            {file.name}
                                                        </Button>
                                                    </li>
                                                </>
                                            )
                                        })
                                    }
                                </ul>
                            </> : ''
                        }
                        <div className="messanger_box__footer__main">
                            <FilePicker className='messanger_box__footer__filepicker' id={props.file_attachment_id}
                                        multiple={true} remove_error={true} onChange={(e) => {
                                props.setUploadedFiles([])
                                for (let i = 0; i < e.target.files.length; i++) {
                                    props.setUploadedFiles(prevFiles => [e.target.files[i], ...prevFiles])
                                }
                            }}/>
                            <Textbox className='messanger_box__footer__textbox' type='textarea' id={props.textbox_id}
                                     placeholder='Ваше сообщение'/>
                            {
                                props.editingMessageId !== null ? <Button onClick={() => {
                                    props.editingMessageIdSetter(null)
                                    props.setUploadedFiles([])

                                    const textbox = document.getElementById(props.textbox_id)
                                    textbox.value = ''
                                }}>
                                    Отменить
                                </Button> : ''
                            }
                            <BackButton className='hoverEffect messanger_box__footer__send_button'
                                        onClick={props.send_func}/>
                        </div>
                    </div>
                </div>
            </div>
            <Modal className='messanger_management' id='messanger_management_modal'
                   contentClassName='messanger_management__content'>
                <div className="messanger_management__header">
                    <div className="messanger_management__header__icon">
                        <img src={props.header_icon ? getImage(props.header_icon) : props.default_header_icon}
                             loading='lazy'/>
                    </div>
                    <div className="messanger_management__header__title">
                        <h3>{props.title}</h3>
                    </div>
                </div>
                <ul className="messanger_management__members">
                    {
                        members.map((member) => {
                            return (
                                <>
                                    {
                                        member.email !== props.currentUser.email ? <>
                                            <li className='messanger_management__members__member'>
                                                <Link to={`/users/${member.id}`}
                                                      className='messanger_management__members__member__info'>
                                                    <div className="messanger_management__members__member__photo">
                                                        <img src={member.photo ? getImage(member.photo) : userIcon}
                                                             loading='lazy' alt='member photo'/>
                                                    </div>
                                                    <p>{member.get_full_name}</p>
                                                </Link>
                                                <Button className='light_button' onClick={() => {
                                                    const textbox = document.getElementById(props.textbox_id)
                                                    textbox.value = `${textbox.value} @${member.email}`
                                                }}>
                                                    Отметить
                                                </Button>
                                            </li>
                                        </> : ''
                                    }
                                </>
                            )
                        })
                    }
                </ul>
            </Modal>
            <Modal className='messanger_image_watcher' contentClassName='messanger_image_watcher__content'
                   id='messanger_image_watcher' extendCloseFunc={() => {
                setTimeout(() => {
                    props.imageSetter(null)
                }, 500)
            }} manageButtons={
                <>
                    {
                        props.imageObject !== null && props.senderIsUser ? <Button onClick={() => {
                            props.deleteWatchingFile(props.imageObjectMessageId, props.imageObject.id)
                        }} className='red_button'>
                            Удалить
                        </Button> : ''
                    }
                    {
                        props.imageObject !== null ?
                            <a className='default_button messanger_image_watcher__download'
                               href={props.downloadFileUrl}>Скачать
                            </a> : ''
                    }
                </>
            }>
                {
                    props.imageObject !== null ? <>
                        <img className='messanger_image_watcher__image' src={getImage(props.imageObject.file)}
                             alt='image' loading='lazy'/>
                    </> : ''
                }
            </Modal>

        </>
    )
}