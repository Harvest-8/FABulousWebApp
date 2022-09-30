import React from 'react'

const Cell = ({value, onChange, id, context}) => {
    
    return (
        <td onContextMenu={context}>
            <input className="border-none p-1 text-sm" type="text" id={id} value={value} onChange={onChange}/>
        </td>
    )
}

export default Cell