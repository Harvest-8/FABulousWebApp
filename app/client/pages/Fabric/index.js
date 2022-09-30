import React, {useState, useEffect} from 'react'
import { useSession} from "next-auth/react"
import axios from 'axios'
import File from '../../components/File'
import Nav from '../../components/Nav'
import Link from 'next/link'


const Home = () => {

  const { data: session } = useSession()
  const [files, setFiles] = useState();
  const [serverError, setServerError] = useState("");
  
  const userList = async(user)=>{
    const res  = await axios.post('http://localhost:3001/listFiles', {user:user})
    if(res.data.files){
      let filtered = res.data.files.filter((str)=>{return str.name.indexOf('.zip') !== -1})
      setFiles(()=>{return filtered})
      setServerError(()=>{return""})
    }
    if(res.data.error){
      setServerError(()=>{return res.data.error})
      setFiles()
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
        <div className="container mx-auto">
          <div className="text-center m-auto my-5">
            <Link href="Fabric/New/"><button className="text-slate-50 bg-indigo-800 border-none px-4 py-2 rounded-md my-2 ease-in-out duration-300 hover:bg-indigo-900 hover:shadow-xl hover:cursor-pointer">Create new fabric</button></Link>
            {serverError ? (
            <p className='text-red-600 '>{serverError}</p>
            ): null}
            {files instanceof Array && files.length === 0 ? (
              <p className='my-2 mx-1 mt-4 text-lg'>You don't have any fabrics 🥲</p>
            ): null}
          </div>
          {files instanceof Array ? (
            <ul className='my-5'>
              {files.map((values, index)=>{
                return(<File values={values} key={index} download={true}/>);
              })}
            </ul>
          ): null}
        </div>
      </div>
    )
 
}

export default Home;