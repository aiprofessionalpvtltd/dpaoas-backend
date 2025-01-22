const express = require('express');
const router = express.Router();
const legislativeBills = require("../controllers/legislativeBills.controller");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer storage configuration
const billDocumentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const publicDir = `./public`;
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir);
        }
        const dir = `./public/billdocumentlegis`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        const currentDate = new Date();
        const formattedDateTime = currentDate.toISOString().replace(/:/g, '-').replace(/\..+/, '') + '/'; // Format as 'YYYY-MM-DDTHH-MM-SS'

        const subDir = `${dir}/${formattedDateTime}`;
        if (!fs.existsSync(subDir)) {
            fs.mkdirSync(subDir);
        }
        cb(null, subDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${file.originalname}`);
    },
});

const upload = multer({ storage: billDocumentStorage });

// Routes
router.get("/", legislativeBills.findAllLegislativeBillsByWebId);
router.get("/findall", legislativeBills.findAllLegislativeBills);
router.get("/inNotice", legislativeBills.findAllLegislativeBillsInNotice);
router.get('/todaylegislativeBills', legislativeBills.getTodaysLegislativeBills);
router.post("/", upload.single('billdocumentlegis'), legislativeBills.createLegislativeBill);
router.get("/:id", legislativeBills.findSingleLegislativeBill);
router.put("/:id", upload.array('billdocumentlegis', 10), legislativeBills.updateLegislativeBill);
router.put('/sendToLegislation/:id', legislativeBills.sendToLegislation);
router.delete("/:id", legislativeBills.deleteLegislativeBill);
router.get("/diaryNumber/generate", legislativeBills.generateDiaryNumber);

module.exports = router;