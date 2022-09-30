require('dotenv').config();
const {S3} = require('aws-sdk');
const path = require('path')
const fs = require('fs');

const s3Upload = async (file, path) =>{

    const fileSplit = file.split("/")
    const name = fileSplit[fileSplit.length -1]
    const user = fileSplit[fileSplit.length - 2]

    const s3 = new S3();
    const fileObj = fs.readFileSync(file);
    const fileBuffer = Buffer.from(fileObj)


    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: path,
        Body: fileBuffer
    }

    const result = await s3.upload(params).promise();

    return result;
}


const s3Download = async(file)=>{

    const s3 = new S3();

    const params = {
        Key: file,
        Bucket: process.env.AWS_BUCKET_NAME
    }

    const url = s3.getSignedUrl('getObject', params);
    return url;
}

const s3GetObject = async(path, dir, name)=>{
    const s3 = new S3();

    if(!fs.existsSync(dir))fs.mkdirSync(dir, {recursive: true})

    const file = fs.createWriteStream(`${dir}/${name}`);

    const params = {
        Key: `${path}/${name}`,
        Bucket: process.env.AWS_BUCKET_NAME
    }

    const url = s3.getObject(params).createReadStream().pipe(file)
    return url;
}

const s3Delete = async(file)=>{
    const s3 = new S3();

    const params = {
        Key: file,
        Bucket: process.env.AWS_BUCKET_NAME
    }

    const deleted = s3.deleteObject(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
    });
    return deleted;
}

const emptyS3Directory = async (dir) => {
    dir = `uploads/${dir}`
    while(true){
        const s3 = new S3();

        const listParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Prefix: dir
        };

        const listedObjects = await s3.listObjectsV2(listParams).promise();

        if (listedObjects.Contents.length === 0) return;

        const deleteParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Delete: { Objects: [] }
        };

        listedObjects.Contents.forEach(({ Key }) => {
            deleteParams.Delete.Objects.push({ Key });
        });

        await s3.deleteObjects(deleteParams).promise();
        if(!listedObjects.IsTruncated) { break; }
    }
}
module.exports = {s3Upload, s3Download, s3Delete, emptyS3Directory, s3GetObject};