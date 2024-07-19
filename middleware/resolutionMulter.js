// multerConfig.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const DIR = 'public/resolution';

// Ensure the directory exists, if not, create it
if (!fs.existsSync(DIR)) {
  fs.mkdirSync(DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    const filename = file.originalname.toLowerCase();
    cb(null, filename);
  }
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
