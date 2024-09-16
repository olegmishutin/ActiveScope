import './selection.css'

export default function Selection(props) {
    return (
        <>
            <label className={`default_selection ${props.className}`} htmlFor={props.id}>
                Выберите группу:
                {
                    props.data.length > 0 ? <>
                        <select className='default_selection__select' id={props.id}>
                            {
                                props.data.map((value) => {
                                    return (
                                        <>
                                            <option value={value.id}>{value.name}</option>
                                        </>
                                    )
                                })
                            }
                        </select>
                    </> : ' у вас нет груп'
                }
            </label>
        </>
    )
}