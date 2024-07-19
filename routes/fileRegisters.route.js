const express = require('express');
const router = express.Router();
const fileRegisters = require('../controllers/fileRegisters.controller');

// Create File Register
/**
 * @swagger
 * /api/fileRegisters/create:
 *   post:
 *     summary: Create file register
 *     tags: [File Registers]
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
 *               registerSubject:
 *                 type: string
 *               registerNumber:
 *                 type: string    
 *               year:
 *                 type: string 
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/create", fileRegisters.createFileRegister)

// Retrieve All File Registers
/**
 * @swagger
 * /api/fileRegisters/{id}:
 *   get:
 *     summary: Retrieve All File Registers
 *     tags: [File Registers]
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         description: Branch Id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: currentPage
 *         description: Current Page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         description: Page Size
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/:branchId", fileRegisters.findAllFileRegisters)


// Retrieve Main Heading On the basis of Branch
// /**
//  * @swagger
//  * /api/mainHeading/byBranch/{id}:
//  *   get:
//  *     summary: Retrieve Main Heading On the basis of Branch
//  *     tags: [Main Heading For Files]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         description: Branch  Id
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       '200':
//  *         description: A successful response
//  */
// router.get("/byBranch/:id", mainHeadingFile.findMainHeadingsByBranchId)



// // Get All Session Sittings
//  /**
//  * @swagger
//  * /api/manageSession/all:
//  *   get:
//  *     summary: Get All Session Sittings
//  *     tags: [Manage Session Days]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: currentPage
//  *         schema:
//  *           type: integer
//  *         description: Current page number
//  *       - in: query
//  *         name: pageSize
//  *         schema:
//  *           type: integer
//  *         description: Number of items per page
//  *     responses:
//  *       '200':
//  *         description: A successful response
//  */
// router.get("/all", manageSession.getAllSessionSittings)



// Update Session Sitting
// /**
//  * @swagger
//  * /api/manageSession/update/{id}:
//  *   put:
//  *     summary: Update Session Sitting 
//  *     tags: [Manage Session Days]
//  *     security:
//  *       - BearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               fkSessionId:
//  *                 type: integer
//  *               sessionAdjourned:
//  *                 type: boolean
//  *               sittingDate:
//  *                 type: string
//  *               startTime:
//  *                  type: string
//  *               endTime: 
//  *                  type: string   
//  *               status:
//  *                  type: string              
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         description: Session Sitting Id
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       '200':
//  *         description: A successful response
//  */
// router.put("/update/:id", manageSession.updateSessionSitting)

// Delete Session Sitting
// /**
//  * @swagger
//  * /api/manageSession/delete/{id}:
//  *   delete:
//  *     summary: Delete Session Sitting 
//  *     tags: [Manage Session Days]
//  *     security:
//  *       - BearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         description: Session Sitting Id
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       '200':
//  *         description: A successful response
//  */
// router.delete("/delete/:id", manageSession.deleteSessionSitting)



module.exports = router;