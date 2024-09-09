import './ordering.css'
import '../../assets/styles/widgetsEffects.css'
import orderingIcon from '../../assets/images/order.svg'

export default function Ordering(props) {
    return (
        <>
            <div className="ordering hoverEffect">
                <label className='ordering__label' htmlFor={props.id}>
                    <img src={orderingIcon} alt='ordering icon' id='ordering_icon'/>
                    <p className='ordering__name'>{props.children}</p>
                </label>
                <input type='checkbox' className='ordering__checkbox' id={props.id} onChange={(e) => {
                    const icon = document.getElementById('ordering_icon')
                    if (e.target.checked) {
                        icon.classList.add('ascending')
                    } else {
                        icon.classList.remove('ascending')
                    }
                }}/>
            </div>
        </>
    )
}