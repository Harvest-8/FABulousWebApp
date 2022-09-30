import React, { useState, useRef, useCallback, useEffect} from 'react';
import { useSession} from "next-auth/react";
import { Tab } from '@headlessui/react'
import Papa from 'papaparse';
import axios from 'axios';
import Nav from '../../components/Nav'
import Table from '../../components/Table'
import {fabricData, paramData, tileData, superTileData} from './data'


function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const New = () => {
    const { data: session } = useSession()

    const inputFile = useRef(null);
    const [fabric, setFabric] = useState(fabricData)
    const [params, setParams] = useState(paramData)
    const [tiles, setTiles] = useState(tileData)
    const [superTiles, setSuperTiles] = useState(superTileData)
    const [fabName, setFabName] = useState("")
    const [fabError, setFabError] = useState("")

    const removeBlank = (arr) =>{
      for(let i = arr.length -1; i >= 0; i--){
        if(arr[i] !== null && arr[i] !== ""){
          break;
        }
        arr.pop()
      }

      return arr
    }

    const alterRow = (arr, col, value) =>{
      arr = arr.map((item, index)=>{
        return col !== index ? item : value
      })
      return arr
    }

    const changeFab = useCallback((col, row, value)=>{
      setFabric((prev)=>{
        return prev.map((items, rows)=>{
          return row !== rows ? items : alterRow(items, col, value)
        })
      })
    }, [])

    const addRowFab = useCallback(()=>{
      let row = []
      for(let i = 0; i++, i < fabric[0].length;){
        row.push('')
      }
      setFabric((prev)=>{
        return [...prev, row]
      })
    }, [fabric])

    const addColFab = useCallback(()=>{
      setFabric((prev)=>{
        return prev.map((items, rows)=>{
          return [...items, '']
        })
      })
    }, [fabric])

    const delRowFab = useCallback(()=>{
      let array = [...fabric]
      if(array.length > 0){
        array.splice(array.length -1, 1)
      }
      setFabric(()=>{
        return array
      })
    }, [fabric])

    const delColFab = useCallback(()=>{
      let array = [...fabric]
      array = array.map((items)=>{
        let row = [...items]
        if(row.length > 0){
          row.splice(row.length -1, 1)
        }
        return row
      })
      setFabric(()=>{
        return array
      })
    }, [fabric])

    const changeParams = useCallback((col, row, value)=>{
      setParams((prev)=>{
        return prev.map((items, rows)=>{
          return row !== rows ? items : alterRow(items, col, value)
        })
      })
    }, [])

    const addRowParams = useCallback(()=>{
      let row = []
      for(let i = 0; i++, i < params[0].length;){
        row.push('')
      }
      setParams((prev)=>{
        return [...prev, row]
      })
    }, [params])

    const addColParams = useCallback(()=>{
      setParams((prev)=>{
        return prev.map((items, rows)=>{
          return [...items, '']
        })
      })
    }, [params])

    const delRowParams = useCallback(()=>{
      let array = [...params]
      if(array.length > 0){
        array.splice(array.length -1, 1)
      }
      setParams(()=>{
        return array
      })
    }, [params])

    const delColParams = useCallback(()=>{
      let array = [...params]
      array = array.map((items)=>{
        let row = [...items]
        if(row.length > 0){
          row.splice(row.length -1, 1)
        }
        return row
      })
      setParams(()=>{
        return array
      })
    }, [params])

    const changeTiles = useCallback((col, row, value)=>{
      setTiles((prev)=>{
        return prev.map((items, rows)=>{
          return row !== rows ? items : alterRow(items, col, value)
        })
      })
    }, [])

    const addRowTiles = useCallback(()=>{
      let row = []
      for(let i = 0; i++, i < tiles[0].length;){
        row.push('')
      }
      setTiles((prev)=>{
        return [...prev, row]
      })
    }, [tiles])

    const addColTiles = useCallback(()=>{
      setTiles((prev)=>{
        return prev.map((items, rows)=>{
          return [...items, '']
        })
      })
    }, [tiles])

    const delRowTiles = useCallback(()=>{
      let array = [...tiles]
      if(array.length > 0){
        array.splice(array.length -1, 1)
      }
      setTiles(()=>{
        return array
      })
    }, [tiles])

    const delColTiles = useCallback(()=>{
      let array = [...tiles]
      array = array.map((items)=>{
        let row = [...items]
        if(row.length > 0){
          row.splice(row.length -1, 1)
        }
        return row
      })
      setTiles(()=>{
        return array
      })
    }, [tiles])

    const changeSuperTiles = useCallback((col, row, value)=>{
      setSuperTiles((prev)=>{
        return prev.map((items, rows)=>{
          return row !== rows ? items : alterRow(items, col, value)
        })
      })
    }, [])

    const addRowSuperTiles = useCallback(()=>{
      let row = []
      for(let i = 0; i++, i < superTiles[0].length;){
        row.push('')
      }
      setSuperTiles((prev)=>{
        return [...prev, row]
      })
    }, [superTiles])

    const addColSuperTiles = useCallback(()=>{
      setSuperTiles((prev)=>{
        return prev.map((items, rows)=>{
          return [...items, '']
        })
      })
    }, [superTiles])

    const delRowSuperTiles = useCallback(()=>{
      let array = [...superTiles]
      if(array.length > 0){
        array.splice(array.length -1, 1)
      }
      setSuperTiles(()=>{
        return array
      })
    }, [superTiles])

    const delColSuperTiles = useCallback(()=>{
      let array = [...superTiles]
      array = array.map((items)=>{
        let row = [...items]
        if(row.length > 0){
          row.splice(row.length -1, 1)
        }
        return row
      })
      setSuperTiles(()=>{
        return array
      })
    }, [superTiles])

    const openFile = (e) =>{
      console.log('opening files')
        inputFile.current.click();
    }

    const generateFile = async(e) =>{
      if(fabName === ""){
        setFabError("Please name the file")
        return true
      }
      console.log("generating verilog..")
      let data = [];
      fabric.forEach((row)=>{
        data.push(row)
      })
      params.forEach((row)=>{
        data.push(row)
      })
      tiles.forEach((row)=>{
        data.push(row)
      })
      superTiles.forEach((row)=>{
        data.push(row)
      })

      try{
        const res  = await axios.post('http://localhost:3001/uploadfile', {csv: data, user: session.user.user_id, name: fabName})
        console.log(res)
        if(res.data.message){
          setFabName(()=>{return""})
          setFabError(()=>{return""})
          setFabric(fabricData)
          setParams(paramData)
          setSuperTiles(superTileData)
          setTiles(tileData)
        }
        if(res.data.error){
          setFabError(()=>{return res.data.error})
        }
      }catch(err){
        console.log(err)
      }
    }
    
    const handleFileChange = (e) =>{
        const fileObj = e.target.files && e.target.files[0]
        if(!fileObj){
            return
        }

        e.target.value = null;
        Papa.parse(fileObj,{
            worker: true,
            complete: results =>{
                setFabric([])
                setParams([])
                setTiles([])
                setSuperTiles([])
                let maxfab = 0
                let maxpara = 0
                let maxtile = 0
                let maxsupertile = 0
                let tempfab = []
                let temppara = []
                let temptile = []
                let tempsupertile = []
                let fab = false;
                let para = false;
                let tile = false;
                let supertile = false;
                results.data.forEach((row)=>{
                  row = removeBlank(row)
                  if(row.includes('FabricBegin')){
                    fab = true;
                  }else if(row.includes('FabricEnd')){
                    fab = false;
                    tempfab.push(row)
                  }else if(row.includes('ParametersBegin')){
                    para = true;
                  }else if(row.includes('ParametersEnd')){
                    para = false;
                    temppara.push(row)
                  }else if(row.includes('TILE')){
                    tile = true;
                  }else if(row.includes('EndTILE')){
                    tile = false;
                    temptile.push(row)
                  }else if(row.includes('SuperTILE')){
                    supertile = true;
                  }else if(row.includes('EndSuperTILE')){
                    supertile = false;
                    tempsupertile.push(row)
                  }
                  if(fab){
                    tempfab.push(row)
                    if(row.length > maxfab){
                      maxfab = row.length;
                    }
                  }
                  if(para){
                    temppara.push(row)
                    if(row.length > maxpara){
                      maxpara = row.length;
                    }
                  }
                  if(tile){
                    temptile.push(row)
                    if(row.length > maxtile){
                      maxtile = row.length;
                    }
                  }
                  if(supertile){
                    tempsupertile.push(row)
                    if(row.length > maxsupertile){
                      maxsupertile = row.length;
                    }
                  }
                })
                tempfab.forEach((row)=>{
                  let dif = maxfab - row.length
                  for(let i =0; i < dif; i++){
                    row.push("")
                  }
                  setFabric((prev)=>{
                    return [...prev, row]
                  })
                })
                temppara.forEach((row)=>{
                  let dif = maxpara - row.length
                  for(let i =0; i < dif; i++){
                    row.push("")
                  }
                  setParams((prev)=>{
                    return [...prev, row]
                  })
                })
                temptile.forEach((row)=>{
                  let dif = maxtile - row.length
                  for(let i =0; i < dif; i++){
                    row.push("")
                  }
                  setTiles((prev)=>{
                    return [...prev, row]
                  })
                })
                tempsupertile.forEach((row)=>{
                  let dif = maxsupertile - row.length
                  for(let i =0; i < dif; i++){
                    row.push("")
                  }
                  setSuperTiles((prev)=>{
                    return [...prev, row]
                  })
                })
            }
        })

    }


        return (
            <div>
                <Nav/>
                <div className="container mx-auto">
                <div>
                  <input
                      type="file"
                      id="file"
                      ref={inputFile}
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                  />
                  <button className="text-slate-50 bg-indigo-800 border-none px-4 py-2 rounded-md my-2 ease-in-out duration-300 hover:bg-indigo-900 hover:shadow-xl hover:cursor-pointer" onClick={openFile}>Upload CSV</button>
                </div>
                {fabric && params && tiles && superTiles ? (
                    <div>
                      <Tab.Group>
                        <Tab.List className="flex space-x-1 rounded-xl bg-indigo-900/20 p-1">
                          <Tab className={({ selected }) =>
                            classNames(
                              'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-indigo-800',
                              'ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-800 focus:outline-none focus:ring-2',
                              selected
                                ? 'bg-white shadow'
                                : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                            )
                          }
                          >
                            Fabric
                          </Tab>
                          <Tab className={({ selected }) =>
                            classNames(
                              'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-indigo-800',
                              'ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-800 focus:outline-none focus:ring-2',
                              selected
                                ? 'bg-white shadow'
                                : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                            )
                          }
                          >
                            Parameters
                          </Tab>
                          <Tab className={({ selected }) =>
                            classNames(
                              'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-indigo-800',
                              'ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-800 focus:outline-none focus:ring-2',
                              selected
                                ? 'bg-white shadow'
                                : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                            )
                          }
                          >
                            Tiles
                          </Tab>
                          <Tab className={({ selected }) =>
                            classNames(
                              'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-indigo-800',
                              'ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-800 focus:outline-none focus:ring-2',
                              selected
                                ? 'bg-white shadow'
                                : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                            )
                          }
                          >
                            Super Tiles
                          </Tab>
                        </Tab.List>
                        <Tab.Panels className="mt-2">
                          <Tab.Panel className={classNames(
                            'rounded-xl bg-white p-3',
                            'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                          )}>
                            <Table content={fabric} changeTable={changeFab} addRow={addRowFab} addCol={addColFab} delRow={delRowFab} delCol={delColFab} />
                          </Tab.Panel>
                          <Tab.Panel className={classNames(
                            'rounded-xl bg-white p-3',
                            'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                          )}>
                            <Table content={params} changeTable={changeParams} addRow={addRowParams} addCol={addColParams} delRow={delRowParams} delCol={delColParams}/>
                          </Tab.Panel>
                          <Tab.Panel className={classNames(
                            'rounded-xl bg-white p-3',
                            'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                          )}>
                            <Table content={tiles} changeTable={changeTiles} addRow={addRowTiles} addCol={addColTiles} delRow={delRowTiles} delCol={delColTiles}/>
                          </Tab.Panel>
                          <Tab.Panel className={classNames(
                            'rounded-xl bg-white p-3',
                            'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                          )}>
                            <Table content={superTiles} changeTable={changeSuperTiles} addRow={addRowSuperTiles} addCol={addColSuperTiles} delRow={delRowSuperTiles} delCol={delColSuperTiles}/>
                          </Tab.Panel>
                        </Tab.Panels>
                      </Tab.Group>
                      {fabError ? (
                      <p className='text-red-600 '>{fabError}</p>
                      ): null}
                      <input className="p-1 rounded-md border-solid border border-indigo-900" type="text" value={fabName} onChange={(e)=>setFabName(e.target.value)} placeholder="Filename"/>
                      <button className="text-slate-50 bg-indigo-800 border-none px-4 py-2 rounded-md my-2 ease-in-out duration-300 hover:bg-indigo-900 hover:shadow-xl hover:cursor-pointer" onClick={generateFile}>Generate Verilog</button>
                    </div>): null} 
                </div>
            </div>
                );
    
            
}


export default New;

