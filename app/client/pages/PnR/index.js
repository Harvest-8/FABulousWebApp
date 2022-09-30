import React, {useState, useEffect, useCallback} from 'react'
import { useSession} from "next-auth/react"
import axios from 'axios'
import Nav from '../../components/Nav'
import Dropzone from '../../components/Dropzone'
import File from '../../components/File'

const Home = () => {

  const { data: session } = useSession()
  const [json, setJson] = useState();
  const [fabrics, setFabrics] = useState();
  const [verilog, setVerilog] = useState();
  const [modules, setModules] = useState();
  const [chosenMod, setChosenMod] = useState();
  const [chosenFab, setChosenFab] = useState();
  const [chosenJson, setChosenJson] = useState();
  const [serverError, setServerError] = useState("");

  const onDrop = useCallback((data)=>{
    setChosenMod(null)

    data.map((file)=>{
      const modules = []
      const reader = new FileReader();
      reader.onload = (e)=>{
        const modArr = e.target.result.split('module ')
        for(let i = 0; i < modArr.length; i++){
          if(modArr[i].trim() === '') continue;
          let mod = modArr[i].split(' ')[0]
          modules.push(mod)
        }
        if(modules.length === 1){
          setChosenMod(modules[0])
        }
        setModules(modules)
      }

      reader.readAsText(file);

      setVerilog(file)
    })
  })

  const uploadVerilog = async() =>{
    const data = new FormData()
    data.append('file', verilog)
    data.append('user', session.user.user_id)
    data.append('module', chosenMod)
    const res = await axios.post('http://localhost:3001/YosysComp', data, {
      headers: {
        'content-type': 'multipart/form-data'
      }
    })
    if(res.data.error){
      setServerError(()=>{return res.data.error})
    }
    setModules(()=>{return null})
    setChosenMod(()=>{return null})
    setVerilog(()=>{return null})
  }

  const createFASM = async()=>{
    const res = await axios.post('http://localhost:3001/createFasm', {json: chosenJson, fabric: chosenFab, user: session.user.user_id})
  }
  
  const userList = async(user)=>{
    const res  = await axios.post('http://localhost:3001/listFiles', {user:user})
    if(res.data.files){
      let filteredJson = res.data.files.filter((str)=>{return str.name.indexOf('.json') !== -1})
      setJson(()=>{return filteredJson});
      let filteredFabric = res.data.files.filter((str)=>{return str.name.indexOf('.zip') !== -1})
      setFabrics(()=>{return filteredFabric});
      setServerError(()=>{return""});
    }
    if(res.data.error){
      setServerError(()=>{return res.data.error})
      setJson()
      setFabrics()
    }
  }

  useEffect(()=>{
    if(session){
      userList(session.user.user_id);
    }
  },[session])

    return (
      <div>
        <Nav />
        <div className="container mx-auto flex justify-center">
          <div className="my-5 w-3/4 mx-auto">
            {serverError ? (
            <p className='text-red-600 '>{serverError}</p>
            ): null}
            <div className='my-4'>
              <h2 className='text-2xl my-2'>Yosys Compilation</h2>
              <Dropzone onDrop={onDrop} text={"Upload Verilog files for Yosys compilation"}/>
              {modules && modules.length > 1 ? (
                <div>
                  <h4 className='text-lg mt-6 mb-2'>Modules Found:</h4>
                  <ul>
                    {modules.map((module,id)=>(
                      <li key={id}><button onClick={()=>setChosenMod(module)} className={chosenMod == module? 'border-2 border-indigo-900 bg-indigo-100 ease-in-out duration-300 p-1 m-1 rounded-lg':'border border-indigo-600 p-1 m-1 rounded-lg ease-in-out duration-300 hover:border-2 hover:shadow-xl hover:cursor-pointer'}>{module}</button></li>
                    ))}
                  </ul>
                </div>
              ): null
              }
              {verilog && chosenMod? (
                <button type="button" onClick={uploadVerilog} className="text-slate-50 bg-indigo-800 border-none px-4 py-2 rounded-md my-4 ease-in-out duration-300 hover:bg-indigo-900 hover:shadow-xl hover:cursor-pointer">Upload</button>
              ): null
              }
            </div>
            <div className='my-8'>
              <h2 className='text-2xl my-2'>Nextpnr Compilation</h2>
              {json instanceof Array ? (
                <div>
                  <h3 className='m-4 text-lg'>Choose Json:</h3>
                  <ul className='m-4'>
                    {json.map((values, index)=>{
                      return(<File values={values} key={index} download={false} click={()=>{return setChosenJson(values.id)}} chosen={chosenJson}/>);
                    })}
                  </ul>
                </div>
              ): null}
              {fabrics instanceof Array ? (
                <div>
                  <h3 className='m-4 text-lg'>Choose Fabric:</h3>
                  <ul className='m-4'>
                    {fabrics.map((values, index)=>{
                      return(<File values={values} key={index} download={false} click={()=>{return setChosenFab(values.id)}} chosen={chosenFab}/>);
                    })}
                  </ul>
                </div>
              ): null}
              {chosenFab && chosenJson?(
                <button type="button" onClick={createFASM} className="text-slate-50 bg-indigo-800 border-none px-4 py-2 rounded-md my-4 ease-in-out duration-300 hover:bg-indigo-900 hover:shadow-xl hover:cursor-pointer">Create FASM</button>
              ): null}
            </div>
          </div>
        </div>
      </div>
    )
 
}

export default Home;