import './notFound.css'
import notFoundImage from '../../assets/images/404-error.png'

export default function NotFound() {
    return (
        <>
            <div className="not_found__box">
                <img className='not_found__box__icon' src={notFoundImage} alt='not found'/>
                <h1 className='not_found__box__header'>Страница не найдена</h1>
            </div>
        </>
    )
}