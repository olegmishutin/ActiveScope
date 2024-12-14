import './header.css'
import {getImage} from "../../utils/data.jsx";

export default function Header(props) {
    return (
        <>
            <header className='header'>
                <div className="header__background">
                    {
                        props.header_image ?
                            <img src={getImage(props.header_image)} alt={'header image'} loading='lazy'/> : ''
                    }
                </div>
                <div className="header__content">
                    <div className={`header__content__image
                     ${props.round_image ? 'round_header_image' : ''} ${!props.image ? 'empty_header_image' : ''}`}>
                        {
                            props.image ? <img src={getImage(props.image)} alt='image' loading='lazy'/> : ''
                        }
                    </div>
                    <div className="header__content__main">
                        <div className={`header__content__main__top ${props.header_image ? 'header_blur' : ''}`}>
                            {props.top_content}
                        </div>
                        <div className="header__content__main__bottom">
                            {props.bottom_content}
                        </div>
                    </div>
                </div>
            </header>
        </>
    )
}