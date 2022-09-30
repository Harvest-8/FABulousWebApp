import React from 'react'
import {useDropzone} from 'react-dropzone';

const Dropzone = ({open, onDrop, text}) => {
    const {getRootProps, getInputProps, isDragActive, acceptedFiles} = useDropzone({onDrop, multiple: false});
    
    const loaded = acceptedFiles.map(file =>(
      <li key={file.path} className='py-1 px-2 mx-1 my-2 block border-solid border border-indigo-900 ease-in-out duration-300 rounded-md'>
        {file.name}  -  {Math.round((file.size / 1024)*100)/100} KB
      </li>
    ))
    
    return (
        <div {...getRootProps({ className: "border-2 border-indigo-800 border-dashed rounded-lg px-5 py-12 w-full" })}>
          <input className="input-zone" {...getInputProps()} />
          <div className="text-center">
          {isDragActive ? (
            <p className="m-2 ">
              Release to drop the files here
            </p>
          ) : (
            <p className="m-2">
              {text}
            </p>
          )}
          <button type="button" onClick={open} className="text-slate-50 bg-indigo-800 border-none px-4 py-2 rounded-md my-2 ease-in-out duration-300 hover:bg-indigo-900 hover:shadow-xl hover:cursor-pointer">
            Click to select files
          </button>
        </div>
        <aside>
          {acceptedFiles ? (
            <ul>
              {loaded}
            </ul>
          ): null}
        </aside>
        </div>
      );
}

export default Dropzone