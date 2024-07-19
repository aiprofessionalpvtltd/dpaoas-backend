const express = require('express');
const router = express.Router();
const cases = require('../controllers/cases.controller');
const { uploadFile } = require('../common/upload');
const { uploadMultipleFiles } = require('../common/upload');

// Create Case
router.post("/createCase/:fileId/:createdBy/:fkFreshReceiptId", uploadFile('case'), cases.createCase)

/**
 * @swagger
 * /api/cases/getCasesByFileId/{fileId}/{userId}:
 *   get:
 *     summary: Get Cases on the basis of file id
 *     tags: [Cases]
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         description: File Id
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userId
 *         required: true
 *         description: User Id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: currentPage
 *         required: true
 *         description: Current Page
 *         schema:
 *           type: integer
*       - in: query
 *         name: pageSize
 *         required: true
 *         description: Page Size
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/getCasesByFileId/:fileId/:userId", cases.getCasesByFileId)

/**
 * @swagger
 * /api/cases/getCasesHistory/{fileId}/{branchId}:
 *   get:
 *     summary: getCasesHistory
 *     tags: [Cases]
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         description: File Id
 *         schema:
 *           type: integer
 *       - in: path
 *         name: branchId
 *         required: true
 *         description: Branch Id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: currentPage
 *         required: true
 *         description: Current Page
 *         schema:
 *           type: integer
*       - in: query
 *         name: pageSize
 *         required: true
 *         description: Page Size
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/getCasesHistory/:fileId/:branchId", cases.getCasesHistory)



// Get Single Case
/**
 * @swagger
 * /api/cases/getCase/{fileId}/{caseId}:
 *   get:
 *     summary: Retrieve Single Case
 *     tags: [Cases]
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         description: File Id
 *         schema:
 *           type: integer
 *       - in: path
 *         name: caseId
 *         required: true
 *         description: Case Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/getCase/:fileId/:caseId", cases.getSingleCase)

// Handle Assign and Update Case
router.put("/handleAssignAndUpdate/:fileId/:caseId", uploadFile('case'), cases.handleCaseAssignmentAndUpdate)

// Assign Case
// /**
//  * @swagger
//  * /api/cases/assignCase/{fileId}/{caseId}:
//  *   post:
//  *     summary: Assign Case 
//  *     tags: [Cases]
//  *     parameters:
//  *       - in: path
//  *         name: fileId
//  *         required: true
//  *         description: File Id
//  *         schema:
//  *           type: integer
//  *       - in: path
//  *         name: caseId
//  *         required: true
//  *         description: Case Id
//  *         schema:
//  *           type: integer
//  *     security:
//  *       - BearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               submittedBy:
//  *                 type: integer
//  *               assignedTo:
//  *                 type: integer
//  *               comment: 
//  *                 type: string 
//  *               commentStatus:
//  *                 type: string               
//  *     responses:
//  *       '200':
//  *         description: A successful response
//  */
// router.post("/assignCase/:fileId/:caseId", cases.assignCase);

// Get Single Case Details
/**
 * @swagger
 * /api/cases/getCaseDetails/{fileId}/{caseId}:
 *   get:
 *     summary: Retrieve Single Case Details
 *     tags: [Cases]
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         description: File Id
 *         schema:
 *           type: integer
 *       - in: path
 *         name: caseId
 *         required: true
 *         description: Case Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/getCaseDetails/:fileId/:caseId", cases.getSingleCaseDetails)

// Update Case
// router.put("/updateCase/:fileId/:caseId", uploadFile('case'), cases.updateCase);

// Delete Case Attachment For Id
/**
 * @swagger
 * /api/cases/deleteAttachment/{id}:
 *   delete:
 *     summary: Delete Case's Attachment
 *     tags: [Cases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Case Attachment Id
 *         schema:
 *           type: integer
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.delete('/deleteAttachment/:id', cases.deleteCaseAttachment)

// Get Employees on Level Level By User's Login
/**
 * @swagger
 * /api/cases/getLLEmployee/{id}:
 *   get:
 *     summary:  Get Employees on Level Level By User's Login
 *     tags: [Cases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/getLLEmployee/:id", cases.getLowerLevelDesignations)

// Get Employees on Higher Level By User's Login
/**
 * @swagger
 * /api/cases/getHLEmployees/{id}:
 *   get:
 *     summary:  Get Employees on Higher Level By User's Login
 *     tags: [Cases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/getHLEmployees/:id", cases.getHigherLevelDesignations)

// Get Branches By User's Login
/**
 * @swagger
 * /api/cases/getBranch/{id}:
 *   get:
 *     summary: Get Branches By User's Login
 *     tags: [Cases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/getBranch/:id", cases.getBranchesByUserLogin)



module.exports = router