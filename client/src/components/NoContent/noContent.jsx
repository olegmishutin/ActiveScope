import './noContent.css'
import emptyPageImage from '../../assets/images/emptyPage.webp'

export default function NoContent(props) {
    return (
        <>
            <div className="no_content">
                {
                    props.light ? <>
                        <p>Пока что тут пусто</p>
                    </> : <>
                        <img src={emptyPageImage} alt='empty page'/>
                        <h2>Пока что тут пусто</h2>
                    </>
                }
            </div>
        </>
    )
}