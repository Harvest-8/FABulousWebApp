import React, {Fragment, useState} from 'react'
import Row from "./Row"

const Fabric = ({content, changeTable, addRow, addCol, delRow, delCol}) => {
  const[x, setX] = useState(0)
  const[y, setY] = useState(0)
  const[show, setShow] = useState(false)

  const popUp = (e) =>{
    e.preventDefault()
    setX(e.screenX - window.scrollX + 10)
    setY(e.screenY + window.scrollY - 100)
    setShow(true)
  }

  return (
    <div className='max-w-full overflow-auto '>
        <table className='fabTable m-auto' onClick={()=>setShow(false)} onContextMenu={popUp}>
            <tbody>
                {content.map((row, index)=>(
                <Row data={row} ind={index} key={index} call={changeTable} context={popUp}/>
                ))}
            </tbody>
        </table>
            <ul className={show ? "absolute block rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" : "hidden"} style={{"left":`${x}px`, "top":`${y}px`}}>
              <li className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={()=>{setShow(false); addRow()}}>Push Row</li>
              <li className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={()=>{setShow(false); addCol()}}>Push Column</li>
              <li className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={()=>{setShow(false); delRow()}}>Pop Row</li>
              <li className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={()=>{setShow(false); delCol()}}>Pop Column</li>
            </ul>
    </div>
  )
}

export default Fabric