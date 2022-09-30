const { Client } = require("pg");
const dotenv = require("dotenv");
dotenv.config();
 
const getFiles = async (user) => {
    try {
        const client = new Client({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD,
            port: process.env.PGPORT
        })
 
        await client.connect()
        const res = await client.query(`SELECT id, path, name, size, user_id FROM files WHERE user_id='${user}'`)
        await client.end()
        return res.rows;
    } catch (error) {
        console.log(error)
    }
}

const addFile = async (user, path, name, size) => {
    try {
        const client = new Client({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD,
            port: process.env.PGPORT
        })
 
        await client.connect()
        const res = await client.query(`INSERT INTO files(user_id, path, name, size) VALUES('${user}', '${path}', '${name}', ${size})`)
        await client.end()
        return res;
    } catch (error) {
        console.log(error)
    }
}

const addUser = async (name, email, password) =>{
    try {
        const client = new Client({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD,
            port: process.env.PGPORT
        })
 
        await client.connect()
        const res = await client.query(`INSERT INTO users(name, email, password) VALUES('${name}', '${email}', '${password}')`)
        await client.end()
        return res;
    } catch (error) {
        console.log(error)
    }
}

const deleteFile = async (path) => {
    try {
        const client = new Client({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD,
            port: process.env.PGPORT
        })
 
        console.log(path)
        await client.connect()
        const res = await client.query(`DELETE FROM files WHERE path='${path}' `)
        console.log(res)
        await client.end()
        return res;
    } catch (error) {
        console.log(error)
    }
}

const deleteUser = async (id) => {
    try {
        const client = new Client({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD,
            port: process.env.PGPORT
        })
 
        await client.connect()
        const filesDel = await client.query(`DELETE FROM files WHERE user_id='${id}'`)
        const userDel = await client.query(`DELETE FROM users WHERE id='${id}' `)
        const res = {files: filesDel, user: userDel}
        console.log(res)
        await client.end()
        return res;
    } catch (error) {
        console.log(error)
    }
}

const fileExist = async (user, name) => {
    try {
        const client = new Client({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD,
            port: process.env.PGPORT
        })
 
        await client.connect()
        const res = await client.query(`SELECT EXISTS(SELECT id FROM files WHERE user_id='${user}' AND name='${name}')`)
        await client.end()
        return res.rows[0].exists;
    } catch (error) {
        console.log("error:",error)
    }
}

const pathExist = async (path) => {
    try {
        const client = new Client({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD,
            port: process.env.PGPORT
        })
 
        await client.connect()
        const res = await client.query(`SELECT EXISTS(SELECT id FROM files WHERE path='${path}')`)
        await client.end()
        return res.rows[0].exists;
    } catch (error) {
        console.log("error:",error)
    }
}

const getFile = async(id)=>{
    try{
        const client = new Client({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD,
            port: process.env.PGPORT
        })
 
        await client.connect()
        const res = await client.query(`SELECT name, path FROM files WHERE id='${id}'`)
        await client.end()
        return res.rows[0];
    }catch(err){
        console.log('error: ',err)
    }
}

const userExist = async (user) => {
    try {
        const client = new Client({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD,
            port: process.env.PGPORT
        })
 
        await client.connect()
        const res = await client.query(`SELECT EXISTS(SELECT id FROM users WHERE id='${user}')`)
        await client.end()
        return res.rows[0].exists;
    } catch (error) {
        console.log("error:",error)
    }
}

const emailExist = async (email) => {
    try {
        const client = new Client({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD,
            port: process.env.PGPORT
        })
        await client.connect()
        const res = await client.query(`SELECT EXISTS(SELECT id FROM users WHERE email='${email}')`)
        await client.end()
        return res.rows[0].exists;
    } catch (error) {
        console.log("error:",error)
    }
}

const getHash = async (email) => {
    try {
        const client = new Client({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD,
            port: process.env.PGPORT
        })
        await client.connect()
        const res = await client.query(`SELECT password FROM users WHERE email='${email}'`)
        await client.end()
        return res.rows[0].password;
    } catch (error) {
        console.log("error:",error)
    }
}

const getUser = async (email) => {
    try {
        const client = new Client({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD,
            port: process.env.PGPORT
        })
        await client.connect()
        const res = await client.query(`SELECT id, name, email FROM users WHERE email='${email}'`)
        await client.end()
        return res.rows[0];
    } catch (error) {
        console.log("error:",error)
    }
}


module.exports = {getFiles, addFile, deleteFile, fileExist, userExist, pathExist, addUser, emailExist, getHash, getUser, deleteUser, getFile};