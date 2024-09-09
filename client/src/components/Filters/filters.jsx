import './filters.css'

import Button from "../../widgets/Button/button.jsx"

export default function Filters(props) {
    return (
        <>
            <div className="filters">
                {props.children}
                <Button>Фильтровать</Button>
                <Button className='red_button'>Сбросить</Button>
            </div>
        </>
    )
}