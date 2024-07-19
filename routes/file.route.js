const express = require('express');
const router = express.Router();
const files = require('../controllers/file.controller');
const { uploadFile } = require('../common/upload');
const { uploadMultipleFiles } = require('../common/upload');

// Create a new File
/**
 * @swagger
 * /api/files/createFile/{id}:
 *   post:
 *     summary: Create a new file
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: id
 *         description: File Register Id
 *         schema:
 *           type: integer
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fkBranchId:
 *                 type: integer
 *               fkMainHeadingId:
 *                 type: integer
 *               year:
 *                 type: string
 *               serialNumber:
 *                 type: string
 *               fileNumber:
 *                 type: string
 *               fileSubject:
 *                 type: string
 *               fileCategory:
 *                 type: string
 *               fileType: 
 *                 type: string 
 *               fileClassification:
 *                 type: string    
 *               fileMovement: 
 *                 type: string                
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/createFile/:id", files.createFile);

// Retrieve Files On File Register Id
/**
 * @swagger
 * /api/files/byFileRegister/{id}:
 *   get:
 *     summary: Retrieve Files On File Register Id And Main Heading Number
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: File Register  Id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: mainHeadingNumber
 *         description: Main Heading Number
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/byFileRegister/:id", files.findFilesByRegisterId)


// Retrieve All Formatted years
/**
 * @swagger
 * /api/files/years/:
 *   get:
 *     summary: Retrieve All Formatted years
 *     tags: [Files]
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get('/years',files.retrieveFormattedYears)

// Retrieve all File
router.get("/", files.findAllFiles);


router.put("/corresponding/:fileNumber/:fileId", uploadFile('file'), files.updateCorrespondingFile);


// Single File
router.delete("/delete/:id", files.deleteCorrespondingFile);


router.get("/:id", files.findSingleFile);


// Update File
router.put("/update/:id", files.updateFile);

// Suspend/Delete File
router.put("/delete/:id", files.suspendFile);

module.exports = router;
