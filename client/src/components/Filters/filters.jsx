import './filters.css'

import {useEffect} from "react"
import {useLocation} from "react-router-dom"
import Button from "../../widgets/Button/button.jsx"

export default function Filters(props) {
    const location = useLocation()

    function changePanel(removeClass, addClass) {
        const filters = document.getElementById('filters')
        filters.classList.remove(removeClass)
        filters.classList.add(addClass)
    }

    function filter() {
        if (window.innerWidth <= 425) {
            changePanel('show_filters', 'hide_filters')
        }
        props.filterEvent()
    }

    function resetFilters() {
        props.children.forEach((element) => {
            if (element.props.id.includes('ordering_')) {
                document.getElementById(element.props.id).checked = false
                document.getElementById(`${element.props.id}_icon`).classList.remove('ascending')
            } else if (element.props.id.includes('dropdown_')) {
                element.props.children.forEach((child) => {
                    document.getElementById(child.props.children.props.id).checked = false
                    document.getElementById(`${child.props.children.props.id}_indicator`).classList.remove('default_checkbox__checked')
                })
            } else {
                document.getElementById(element.props.id).value = ''
            }
        })
        filter()
    }

    useEffect(() => {
        resetFilters()
    }, [location]);

    return (
        <>
            <Button className='open_filters' onClick={() => {
                changePanel('hide_filters', 'show_filters')
            }}>Открыть фильтры</Button>
            <div className="filters" id='filters'>
                <Button className='red_button close_filters' onClick={() => {
                    changePanel('show_filters', 'hide_filters')
                }}>Закрыть</Button>
                <div className="filters__content">
                    {props.children}
                    <Button onClick={filter}>Фильтровать</Button>
                    <Button className='red_button' onClick={resetFilters}>Сбросить</Button>
                </div>
            </div>
        </>
    )
}