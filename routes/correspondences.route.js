const express = require('express');
const router = express.Router();
const correspondence = require('../controllers/correspondences.controller');
const { uploadFile } = require('../common/upload');


// Create Correspondence
/**
 * @swagger
 * /api/correspondence/createCorrespondence/:
 *   post:
 *     summary: Create Correspondence
 *     tags: [Correspondence]
 *     security:
 *       - BearerAuth: []
 *     
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               fkBranchId:
 *                 type: integer 
 *               fkFileId:
 *                 type: integer 
 *               file:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Attachments   
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/createCorrespondence", uploadFile('correspondence'), correspondence.createCorrespondence);

// Get All Correspondence
router.get('/getAllCorrespondences', correspondence.getAllCorrespondences)

// Get Single Correspondence
router.get('/getSingleCorrespondence/:id', correspondence.getSingleCorrespondence)

// Update Correspondence
router.put('/updateCorrespondence/:id', uploadFile('correspondence'), correspondence.updateCorrespondence)

// Delete Correspondence
router.delete('/deleteCorrespondence/:id', correspondence.deleteCorrespondence)

// Remove Files
router.delete('/deleteAttachment/:id', correspondence.deleteCorrespondenceAttachment)

module.exports = router