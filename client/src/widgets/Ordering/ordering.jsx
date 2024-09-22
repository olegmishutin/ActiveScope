import './ordering.css'
import '../../assets/styles/widgetsEffects.css'
import orderingIcon from '../../assets/images/order.svg'

export default function Ordering(props) {
    return (
        <>
            <div className="widget ordering hoverEffect">
                <label className='ordering__label' htmlFor={props.id}>
                    <img src={orderingIcon} alt='ordering icon' id={`${props.id}_icon`}/>
                    <p className='ordering__name'>{props.children}</p>
                </label>
                <input type='checkbox' className='ordering__checkbox' id={props.id} onChange={(e) => {
                    const icon = document.getElementById(`${props.id}_icon`)
                    if (e.target.checked) {
                        icon.classList.add('ascending')
                    } else {
                        icon.classList.remove('ascending')
                    }

                    if (props.onChange) {
                        props.onChange()
                    }
                }}/>
            </div>
        </>
    )
}