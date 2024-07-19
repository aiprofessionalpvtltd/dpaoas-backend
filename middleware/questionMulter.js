// multerConfig.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

//const DIR = 'public/questions';

// Ensure the directory exists, if not, create it
// if (!fs.existsSync(DIR)) {
//   fs.mkdirSync(DIR, { recursive: true });
// }

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const publicDir = `./public`;
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir);
    }
    const dir = `./public/question`;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    // Get current date and time
    const currentDate = new Date();
    const formattedDateTime = currentDate.toISOString().replace(/:/g, '-').replace(/\..+/, ''); // Format as 'YYYY-MM-DDTHH-MM-SS'

    const subDir = `./public/question/${formattedDateTime}`;
    if (formattedDateTime) {
        const attendeeDir = `./public/question/${formattedDateTime}`;
        if (!fs.existsSync(attendeeDir)) {
            fs.mkdirSync(attendeeDir);
        }
        cb(null, attendeeDir);
    } else {
        cb(null, subDir);
    }
},
filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
},
});

var upload =multer({
    storage: storage,
    fileFilter: (req,file,cb) => {
        if(file.mimetype === "image/png" ||  file.mimetype ==="application/pdf" || file.mimetype ==="image/jpg" || file.mimetype == "image/jpeg")
        {
            cb(null,true);
        }
        else
        {
            cb(null,false);
            return cb(new Error('Only .pdf .png .jpg and .jpeg format allowed!'));
        }
    }
});

module.exports = upload;
