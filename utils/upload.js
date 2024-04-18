const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const storage = new GridFsStorage({
    url: process.env.mongoURL,
    options: { useNewUrlParser: true },
    file: (request, file) => {
    
        // file._id = new mongoose.Types.ObjectId();

        console.log("File:", file); // Log the file object to check its structure and values

        const match = ["image/png", "image/jpeg"]; // Corrected the file types
        console.log(match.indexOf(file.mimetype));

        if(match.indexOf(file.mimetype) === -1) {
            console.log("Invalid file type:", file.mimetype); // Log the invalid file type
            console.log(`${Date.now()}-blog-${file.originalname}`);
            return `${Date.now()}-blog-${file.originalname}`;
        }

        console.log("Valid file type:", file.mimetype); // Log the valid file type

        return {
           
            filename: `${Date.now()}-blog-${file.originalname}`
        }
    }
});

module.exports = multer({ storage });
