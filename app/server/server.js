const app = require("express")();
const http = require('http')
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const archiver = require('archiver');
const {spawn} = require("child_process");
const bcrypt = require("bcrypt");
const {s3Upload, s3Download,s3Delete, emptyS3Directory, s3GetObject} = require('./s3Service');
const {fileExist, getFiles, userExist, pathExist, addFile, addUser, emailExist, getHash, getUser, deleteFile, deleteUser, getFile} = require('./dbService');
const multer = require('multer');
const PORT = process.env.PORT || 3001;
const server = http.createServer(app);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const upload = multer({
  storage: multer.diskStorage({
    destination:(req, file, callback)=>{
      let path = `./uploads/verilog`
      if(!fs.existsSync(path))fs.mkdirSync(path);
      callback(null, path)
    },
    filename: (req, file, callback)=>{
      callback(null, file.originalname)
    }
  })
})

const zipData = (user, name)=>{
    try {
      fs.unlinkSync(`../../FABulous/${user}/create_basic_files.sh`);
      fs.unlinkSync(`../../FABulous/${user}/fabric_gen.py`);
      fs.unlinkSync(`../../FABulous/${user}/run_fab_flow.sh`);
      fs.unlinkSync(`../../FABulous/${user}/README.md`);
      fs.unlinkSync(`../../FABulous/${user}/run_fab_flow_nextpnr_pair.sh`);
      fs.unlinkSync(`../../FABulous/${user}/run_fab_flow_nextpnr.sh`);
      fs.unlinkSync(`../../FABulous/${user}/run_fab_flow_vpr.sh`);
      fs.rmSync(`../../FABulous/${user}/bitstream_npnr`, { recursive: true });
      fs.rmSync(`../../FABulous/${user}/fabulous_top_wrapper_temp`, { recursive: true });
      
    } catch(err) {
      console.error("error removing files:", err)
    }
    fs.moveSync(`../../FABulous/${user}/csv_output`,`../../FABulous/${user}/${name}/csv_output`);
    fs.moveSync(`../../FABulous/${user}/list_files`,`../../FABulous/${user}/${name}/list_files`);
    fs.moveSync(`../../FABulous/${user}/npnroutput`,`../../FABulous/${user}/${name}/npnroutput`);
    fs.moveSync(`../../FABulous/${user}/verilog_output`,`../../FABulous/${user}/${name}/verilog_output`);
    fs.moveSync(`../../FABulous/${user}/vhdl_output`,`../../FABulous/${user}/${name}/vhdl_output`);
    fs.moveSync(`../../FABulous/${user}/vproutput`,`../../FABulous/${user}/${name}/vproutput`);
    const output = fs.createWriteStream(`../../FABulous/${user}/${name}.zip`);
    const archive = archiver('zip');
  
    output.on('close', async() => {
      if (fs.existsSync(`../../FABulous/${user}/${name}.zip`)) {
        let fullPath = `uploads/${user}/${name}.zip`;
        const size = fs.statSync(`../../FABulous/${user}/${name}.zip`).size;
        await addFile(user, fullPath, `${name}.zip`, size);
        await s3Upload(`../../FABulous/${user}/${name}/npnroutput/bel.txt`, `uploads/${user}/${name}_npnroutput/bel.txt`);
        await s3Upload(`../../FABulous/${user}/${name}/npnroutput/pips.txt`, `uploads/${user}/${name}_npnroutput/pips.txt`);
        await s3Upload(`../../FABulous/${user}/${name}/npnroutput/meta_data.txt`, `uploads/${user}/${name}_npnroutput/meta_data.txt`)
        let done = await s3Upload(`../../FABulous/${user}/${name}.zip`, fullPath);

        if(done.Location !== null){
          fs.rmSync(`../../FABulous/${user}`, { recursive: true });
          fs.rmSync(`./uploads/${user}/data.csv`)
      }
      }
    });
  
    archive.on('error', (err) => {
      throw err;
    });


  
    archive.pipe(output);
    archive.directory(`../../FABulous/${user}/${name}`, false);
  
    archive.finalize();
}

const createData = (user, name, width, height) =>{
    const command = spawn("./command.sh",[user, width, height]);
      command.stdout.on("data", data => {
        console.log(`stdout: ${data}`);
      });
      
      command.stderr.on("data", data => {
        console.log(`stderr: ${data}`);
      });
      
      command.on('error', (error) => {
        console.log(`error: ${error.message}`);
      });
      
      command.on("close", async(code) => {
        console.log(`child process exited with code ${code}`);
        if (fs.existsSync(`../../FABulous/${user}`)) {
          zipData(user, name)
        }
      });
}

app.post('/uploadfile', async(req, res) => {
  try{
    const exist = await fileExist(req.body.user, req.body.name);
    if (fs.existsSync(`../../FABulous/${req.body.user}`)) {
      res.status(200).send({error: "You are already generating a fabric"});
    }
    else if(exist === false){
        csv = req.body.csv;
        let width = 0;
        let height = 0;

        csv.every(row => {
          if(row.includes("FabricEnd")){
            return false;
          }
          let localWidth = 0;
          let nonTerm = false;
          row.every(cell=>{
            let spaces = cell.trim()
            if(cell.includes('#')){
              return false;
            }
            if(cell !== "FabricBegin" && cell !=="FabricEnd" && cell !=="NULL" && spaces.length !== 0 && !cell.includes("term") && !cell.includes("IO")){
              localWidth++;
              nonTerm = true;
            }
            return true;
          })
          if(nonTerm === true){
            height++;
          }
          if(localWidth >= width){
            width = localWidth;
          }
          return true;
        });

        console.log(width, height)
        csv = csv.map((item)=>{
            return item.join(",");
        }).join("\n");

        if (!fs.existsSync("./uploads/"+ req.body.user)) {
          fs.mkdirSync("./uploads/"+ req.body.user, {
            recursive: true
          });
        }
    
        var targetPath = path.join(__dirname,"./uploads/"+ req.body.user + "/data.csv");

        fs.writeFile(targetPath, csv, function(err){
            if(err){
                console.log("Write complete!");
            }
        });
        res.status(200).send({message: "generating files..."});
        
        createData(req.body.user, req.body.name, width, height);
    }else{
        res.status(200).send({error: "file already exists"});
    }
  }catch(err){
    console.log("Fabric creation error: ",err)
  }
});

app.post('/listFiles', async (req, res) => {
  try{
      const exist = await userExist(req.body.user);
      if(exist === true){
          try{
              const files = await getFiles(req.body.user);
              res.status(200).send({files: files});
          }catch(error){
              res.status(500).send({error: "something went wrong"})
          }
      }else{
          res.status(200).send({error: "User not found"})
      }
  }catch(err){
    console.log("List Files error: ",err)
  }
});

app.post('/downloadFile', async (req, res) => {
  try{
      const exist = await pathExist(req.body.path);
      if(exist === true){
          const file = await s3Download(req.body.path);
          res.status(200).send({url: file})
      }else{
          res.status(200).send("file does not exist");
      }
    }catch(err){
      console.log("Download file error: ",err)
    }
});

app.post('/deleteFile', async (req, res) => {
  try{
      const exist = await pathExist(req.body.path);
      if(exist === true){
        const name = req.body.name.split('.')[0]
        const data = await deleteFile(req.body.path);
        const file = s3Delete(req.body.path);
        emptyS3Directory(`${req.body.user}/${name}_npnroutput`)
        res.status(200).send({s3: file, db: data})
      }else{
          res.status(200).send("file does not exist");
      }
    }catch(err){
      console.log("Delete file error: ",err)
    }
});

app.post('/deleteUser', async (req, res) => {
  try{
      const exist = await userExist(req.body.user);
      if(exist === true){
          const data = await deleteUser(req.body.user);
          emptyS3Directory(req.body.user);
          res.status(200).send({message: "successfully deleted!"})
      }else{
          res.status(200).send("user does not exist");
      }
    }catch(err){
      console.log("Delete user error: ",err)
    }
});

app.post('/register', async (req, res)=>{
  const{name, email, password} = req.body;
  try{
    const exist = await emailExist(email);
    if(exist == true){
      return res.status(400).json({error: "Email already there, No need to register again.",});
    }else{
      bcrypt.hash(password, 10, async (err, hash) => {
        if (err){
          res.status(err).json({error: "Server error",});
        }

        const user = await addUser(name, email, hash);
        if(err){
          console.log(err)
          return res.status(500).json({error: "Database error"})
        }else{
          res.status(200).json({message: "User added to the database"})
        }
      });
    }
  }catch(err){
    console.log("registration error: ",err);
    res.status(500).json({error: "Database error while registring user!"});
  }
});

app.post('/login', async (req, res)=>{
  const{email, password} = req.body;
  try{
    const exist = await emailExist(email);
    if(exist == false){
      res.status(400).json({error: "User is not registered, Sign Up first",});
    }else{
      const hash = await getHash(email);
      bcrypt.compare(password, hash, async (err, result)=>{
        if(err){
          res.status(500).json({error: "Server error"})
        }else if(result === true){
          const user = await getUser(email);
          res.status(200).send({user: user})
        }else{
          if(result != true){
            res.status(400).json({error: "Wrong Credentials"});
          }
        }
      });
    }
  }catch{
    console.log("Login error: ",err);
    res.status(500).json({error: "Database error while signing in user!"});
  }
});

app.post('/YosysComp', upload.single('file') ,async(req, res)=>{
  let name = req.file.originalname.split(".")
  const exist = await pathExist(`uploads/${req.body.user}/${name[0]}.json`)
  if(!exist){
    fs.rename(`./uploads/verilog/${req.file.originalname}`, `./uploads/${req.body.user}/${req.file.originalname}`, function(err){
      if(err)throw err
    })

    const command = spawn("./yosys.sh",[req.body.module, req.file.originalname, req.body.user]);
    command.stdout.on("data", data => {
      console.log(`stdout: ${data}`);
    });
    
    command.stderr.on("data", data => {
      console.log(`stderr: ${data}`);
    });
    
    command.on('error', (error) => {
      console.log(`error: ${error.message}`);
    });
    
    command.on("close", async (code) => {
      console.log(`child process exited with code ${code}`);
      try{
        name = req.file.originalname.split(".")
        let size = fs.statSync(`./uploads/${req.body.user}/${name[0]}.json`).size;
        let path = `uploads/${req.body.user}/${name[0]}.json`
        await addFile(req.body.user, path, `${name[0]}.json`, size)
        await s3Upload(path, path)
      }catch(err){
        console.log(err)
      }
    });
    res.status(200).send();
  }else{
    res.status(200).send({error: "File already exists"});
  }
})

app.post('/createFasm', async(req, res)=>{
  const json = await getFile(req.body.json)
  const fabric = await getFile(req.body.fabric)
  const dir = `../../FABulous/nextpnr/fabulous/${req.body.user}/`;
  if(!fs.existsSync(dir))fs.mkdirSync(dir,{recursive:true})
  fs.copySync('../../FABulous/nextpnr/fabulous/fab_arch', dir)
  const npnrPath = `uploads/${req.body.user}/${fabric.name.split('.')[0]}_npnroutput`
  await s3GetObject(`${npnrPath}`,dir, 'bel.txt')
  await s3GetObject(`${npnrPath}`,dir, 'pips.txt')
  await s3GetObject(`${npnrPath}`,dir, 'meta_data.txt')
  await s3GetObject(`uploads/${req.body.user}`,dir, json.name)
  const command = spawn("./nextpnr.sh",[req.body.user, `${dir}/${json.name}`]);
  command.stdout.on("data", data => {
    console.log(`stdout: ${data}`);
  });
  
  command.stderr.on("data", data => {
    console.log(`stderr: ${data}`);
  });
  
  command.on('error', (error) => {
    console.log(`error: ${error.message}`);
  });
  
  command.on("close", async (code) => {
    console.log(`child process exited with code ${code}`);
    try{
      console.log('nice')
    }catch(err){
      console.log(err)
    }
  });
  res.status(200).send()
})

server.listen(PORT, err=> {
    if(err) console.log(err);
    console.log('Server running on Port ', PORT);
});