import React from 'react'
import Cell from './Cell'

const Row = ({data, ind ,call, cell, context}) => {
  const tester = (e)=>{
    call(Number(e.target.id), ind, e.target.value)
  }

  return (
    <tr>
        {data.map((item, index)=>(
            <Cell key={index} id={index} value={item} onChange={tester} width={cell} context={context}/>
        ))}
    </tr>
  )
}

export default Row