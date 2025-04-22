import './messanger.css'
import threeDots from "../../assets/images/three dots.svg";
import FilePicker from "../../widgets/FilePicker/filePicker.jsx";
import Textbox from "../../widgets/Textbox/textbox.jsx";
import BackButton from "../../widgets/BackButton/backButton.jsx";
import {Link} from "react-router-dom";
import Modal from "../Modal/modal.jsx";
import Button from "../../widgets/Button/button.jsx";


export default function Messanger(props) {
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
                            <img src={props.header_icon ? props.header_icon : props.default_header_icon}
                                 alt='messanger icon' loading='lazy'/>
                        </div>
                        <div className="messanger_box__header__title">
                            <h3>{props.title}</h3>
                        </div>
                        <button className="messanger_box__header__button" onClick={props.header_button_event}>
                            <img src={threeDots} alt='info' loading='lazy'/>
                        </button>
                    </div>
                    <div className="messanger_box__main">
                        <ul className='messanger_box__main__messages'>
                            {props.children}
                        </ul>
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
                            <BackButton className='hoverEffect messanger_box__footer__send_button'
                                        onClick={props.send_func}/>
                        </div>
                    </div>
                </div>
            </div>
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
                        <img className='messanger_image_watcher__image' src={props.imageObject.file} alt='image'
                             loading='lazy'/>
                    </> : ''
                }
            </Modal>
        </>
    )
}