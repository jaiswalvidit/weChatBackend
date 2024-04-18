const grid = require('gridfs-stream');
const mongoose = require('mongoose');

const url = 'https://wechatbackend-qlpp.onrender.com/api';

let gfs, gridfsBucket;
const conn = mongoose.connection;
conn.once('open', () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'fs'
    });
    gfs = grid(conn.db, mongoose.mongo);
    gfs.collection('fs');
});


exports.uploadImage =async (request, response) => {
console.log(request.file,'phots')
    if (!request.file) 
        return response.status(404).json("File not found");
    
    const imageUrl = `${url}/file/${request.file.filename}`;
    console.log(imageUrl,'pikachu')
    response.status(200).json(imageUrl);    
}

exports.getImage = async (request, response) => {
    try {   
        const file = await gfs.files.findOne({ filename: request.params.filename });
        console.log(file);
        // const file1 = await gfs.photos.findOne({ filename: request.params.filename });
        console.log(file,'data');
        // consolr.log(file1,'photo');
        const readStream = gridfsBucket.openDownloadStream(file._id);
        readStream.pipe(response);
    } catch (error) {
        response.status(500).json({ msg: error.message });
    }
}
