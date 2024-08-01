const express = require('express');
const router = express.Router();
const freshReceipts = require('../controllers/freshReceipt.controller');
const { uploadFile } = require('../common/upload');
const { uploadMultipleFiles } = require('../common/upload');


router.post('/createExternal', freshReceipts.createExternalMinistry)

// Retrieve External Ministry
router.get('/getExternal',freshReceipts.getAllExternalMinistries)


// Create a new FR
/**
 * @swagger
 * /api/freshReceipt/createFR/{id}:
 *   post:
 *     summary: Create a new Fresh Receipt (FR)
 *     tags: [Fresh Receipts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User Id
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fkUserBranchId:
 *                 type: integer
 *               diaryType:
 *                 type: string
 *               diaryNumber:
 *                 type: string
 *               diaryDate:
 *                 type: string
 *               diaryTime:
 *                 type: string
 *               fkExternalMinistryId:
 *                 type: integer
 *               frType:
 *                 type: string
 *               frSubType:
 *                 type: string
 *               fkBranchId:
 *                 type: integer
 *               fkMinistryId:
 *                 type: integer
 *               frSubject: 
 *                 type: string 
 *               referenceNumber:
 *                 type: string    
 *               frDate: 
 *                 type: string    
 *               shortDescription:
 *                 type: string
 *               freshReceipt:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Attachments   
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/createFR/:id", uploadFile('freshReceipt'), freshReceipts.createFR);

// Upload Multiple FRs
/**
 * @swagger
 * /api/freshReceipt/uploadMultipleFRs/{id}:
 *   post:
 *     summary: Upload Multiple Fresh Receipts (FR)
 *     tags: [Fresh Receipts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Fresh Receipt Id
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               freshReceipt:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Attachments   
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post('/uploadMultipleFRs/:id', uploadFile('freshReceipt') ,freshReceipts.uploadMultipleFRs)

// Get All FRs On User Basis
/**
 * @swagger
 * /api/freshReceipt/{id}:
 *   get:
 *     summary: Retrieve All FRs
 *     tags: [Fresh Receipts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User Id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: currentPage
 *         required: true
 *         description: currentPage
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         required: true
 *         description: pageSize
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get('/:id', freshReceipts.getAllFRs)



// Get All FRs on Branch Basis
/**
 * @swagger
 * /api/freshReceipt/ByBranch/{id}:
 *   get:
 *     summary: Retrieve All FRs On Branch Basis
 *     tags: [Fresh Receipts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Branch Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get('/ByBranch/:id', freshReceipts.getAllFRsByBranch)


// Get All FRs
/**
 * @swagger
 * /api/freshReceipt/frsHistory/{branchId}:
 *   get:
 *     summary: Retrieve FRs History
 *     tags: [Fresh Receipts]
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         description: Branch Id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: currentPage
 *         required: true
 *         description: currentPage
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         required: true
 *         description: pageSize
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get('/frsHistory/:branchId/:userId', freshReceipts.getFRsHistory)



// Get Single FR
/**
 * @swagger
 * /api/freshReceipt/getFR/{id}:
 *   get:
 *     summary: Retrieve Single FR
 *     tags: [Fresh Receipts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Fresh Receipt Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get('/getFR/:id', freshReceipts.getSingleFR)


// Update FR
/**
 * @swagger
 * /api/freshReceipt/updateFR/{id}:
 *   put:
 *     summary: Update  Fresh Receipt (FR)
 *     tags: [Fresh Receipts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Fresh Receipt Id
 *         schema:
 *           type: integer
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               diaryType:
 *                 type: string
 *               diaryNumber:
 *                 type: string
 *               diaryDate:
 *                 type: string
 *               diaryTime:
 *                 type: string
 *               frType:
 *                 type: string
 *               fkBranchId:
 *                 type: integer
 *               fkMinistryId:
 *                 type: integer
 *               frSubject: 
 *                 type: string 
 *               referenceNumber:
 *                 type: string    
 *               frDate: 
 *                 type: string    
 *               shortDescription:
 *                 type: string
 *               freshReceipt:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Attachments   
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put('/updateFR/:id', uploadFile('freshReceipt'), freshReceipts.updateFR)

// Assign FR
/**
 * @swagger
 * /api/freshReceipt/assignFR/{id}:
 *   post:
 *     summary: Assign Fresh Receipt (FR)
 *     tags: [Fresh Receipts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Fresh Receipt Id
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
 *               submittedBy:
 *                 type: integer
 *               assignedTo:
 *                 type: integer
 *               CommentStatus:
 *                 type: string
 *               comment:
 *                 type: string
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post('/assignFR/:id', freshReceipts.assignFR)

// Delete FR
/**
 * @swagger
 * /api/freshReceipt/deleteFR/{id}:
 *   delete:
 *     summary: Delete Fresh Receipt (FR)
 *     tags: [Fresh Receipts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Fresh Receipt Id
 *         schema:
 *           type: integer
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.delete('/deleteFR/:id', freshReceipts.deleteFR)

// Delete FR Attachment
/**
 * @swagger
 * /api/freshReceipt/deleteAttachment/{id}:
 *   delete:
 *     summary: Delete Fresh Receipt (FR)'s Attachment
 *     tags: [Fresh Receipts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Fresh Receipt Attachment Id
 *         schema:
 *           type: integer
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.delete('/deleteAttachment/:id', freshReceipts.deleteFreshReceiptAttachment)





module.exports = router