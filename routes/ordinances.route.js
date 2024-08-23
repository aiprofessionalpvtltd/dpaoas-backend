const express = require('express');
const router = express.Router();
const ordinances = require("../controllers/ordinances.controller");
const multer = require('multer');
const upload = multer();
const { uploadFile } = require('../common/upload');

// Create a new Ordinance
router.post("/", upload.none(), ordinances.createOrdinance);

// Retrieve all Ordinance
router.get("/", ordinances.findAllOrdinances);

// Retrieve all Ordinance
router.get("/search", ordinances.searchAllOrdinance);

// Retrieve Single Ordinance by its ID
router.get("/:id", ordinances.findSingleOrdinance);

// Update Ordinance
router.put("/update/:id", uploadFile("ordinanceDocument"), ordinances.updateOrdinance)

// Suspend/Delete Ordinance
router.delete("/delete/:id", ordinances.deleteOrdinance);

router.put('/:id/file', ordinances.deleteFile);

module.exports = router

