import React, {Fragment, useState} from 'react'
import axios from 'axios'
import {XIcon} from '@heroicons/react/solid'
import { Dialog, Transition } from '@headlessui/react'

const File = ({values, download, click, chosen}) => {
  const[isOpen, setIsOpen] = useState(false);

  const deleteFile = async()=>{
    setIsOpen(false)
    const res = await axios.post('http://localhost:3001/deleteFile', {user: values.user_id, name: values.name, path: values.path})
    console.log(res)
  }

  const getFile = async()=>{
    if(download){
      const res  = await axios.post('http://localhost:3001/downloadFile', {user: values.user_id, name: values.name, path: values.path})
      const link = document.createElement('a');
      link.href = res.data.url;
      link.setAttribute(
      'download',
      `FileName.pdf`,
      );

      // Append to html link element page
      document.body.appendChild(link);

      // Start download
      link.click();

      // Clean up and remove the link
      link.parentNode.removeChild(link);
    }
  }

  return (
    <>
      <div className={chosen === values.id? 'py-1 px-2 mx-1 my-2 block border-solid border border-indigo-900 ease-in-out duration-300 rounded-none hover:cursor-pointer hover:rounded-md hover:shadow-md hover:-translate-y-1 bg-indigo-300':'py-1 px-2 mx-1 my-2 block border-solid border border-indigo-900 ease-in-out duration-300 rounded-none hover:cursor-pointer hover:rounded-md hover:shadow-md hover:-translate-y-1'}>
        <li className='inline-block w-11/12' onClick={download? getFile: click}>{values.name}  -  {Math.round((values.size / (1024*1024))*100)/100}MB</li>
        {download ? (
          <XIcon className="h6 w-6 text-black hover:text-red-600 inline-block float-right" onClick={() => setIsOpen(true)}/>
        ): null}
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={()=>setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Delete {values.name}?
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to permanently delete {values.name}? This action cannot be undone.
                    </p>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-800 px-4 py-2 mx-2 text-sm font-medium text-slate-50 hover:bg-indigo-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={deleteFile}
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-800 px-4 py-2 mx-2 text-sm font-medium text-slate-50 hover:bg-indigo-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={()=>setIsOpen(false)}
                    >
                      Cancel
                    </button>
                    
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default File