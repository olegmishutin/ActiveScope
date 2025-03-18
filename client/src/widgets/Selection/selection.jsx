import './selection.css'

export default function Selection(props) {
    return (
        <>
            <label className={`default_selection ${props.className}`} htmlFor={props.id}>
                {props.children}:
                {
                    props.data.length > 0 ? <>
                        <select className='default_selection__select' id={props.id} onChange={(e) => {
                            if (props.onChange) {
                                props.onChange(e)
                            }
                        }}>
                            {
                                props.data.map((value) => {
                                    return (
                                        <>
                                            {
                                                props.flat ? <option value={value[0]}>{value[1]}</option> :
                                                    <option
                                                        style={props.colorAttr ? {backgroundColor: `#${value[props.colorAttr]}`} : {}}
                                                        value={value.id}>{value.name}</option>
                                            }
                                        </>
                                    )
                                })
                            }
                        </select>
                    </> : ''
                }
            </label>
        </>
    )
}