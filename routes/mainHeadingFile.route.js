const express = require('express');
const router = express.Router();
const mainHeadingFile = require('../controllers/mainHeadingFile.controller');
 
// Create Main Heading For A File
/**
 * @swagger
 * /api/mainHeading/create:
 *   post:
 *     summary: Create a new main heading for a file
 *     tags: [Main Heading For Files]
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
 *               mainHeading:
 *                 type: string
 *               mainHeadingNumber:
 *                 type: string     
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/create", mainHeadingFile.createMainHeading)

// Retrieve All Main headings
/**
 * @swagger
 * /api/mainHeading/getAllHeadings/{branchId}:
 *   get:
 *     summary: Retrieve All Main Headings
 *     tags: [Main Heading For Files]
 *     parameters:
 *       - in: path
 *         name: branchId
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
router.get("/getAllHeadings/:branchId", mainHeadingFile.findAllMainHeadings)

// Get Single Main Heading
 /**
 * @swagger
 * /api/mainHeading/{id}:
 *   get:
 *     summary: Get Single Main Heading
 *     tags: [Main Heading For Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         description: Main Heading Id
 *     responses:
 *       '200':
 *         description: A successful response
 */
 router.get("/:id", mainHeadingFile.findSingleMainHeading)

// Retrieve Main Heading On the basis of Branch
/**
 * @swagger
 * /api/mainHeading/byBranch/{id}:
 *   get:
 *     summary: Retrieve Main Heading On the basis of Branch
 *     tags: [Main Heading For Files]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Branch  Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/byBranch/:id", mainHeadingFile.findMainHeadingsByBranchId)

// Retrieve Main Heading Number On the basis of Main Heading Id
/**
 * @swagger
 * /api/mainHeading/byHeading/{id}:
 *   get:
 *     summary: Retrieve Main Heading Number On the basis of Main Heading Id
 *     tags: [Main Heading For Files]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Heading  Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/byHeading/:id", mainHeadingFile.findHeadingNumberByHeadingId)


// Update Main Heading
/**
 * @swagger
 * /api/mainHeading/update/{id}:
 *   put:
 *     summary: Update Main Heading
 *     tags: [Main Heading For Files] 
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         description: Main Heading Id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fkBranchId:
 *                 type: integer
 *               mainHeading:
 *                 type: string
 *               mainHeadingNumber:
 *                 type: string     
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put("/update/:id", mainHeadingFile.updateMainHeading)

// Delete Session Sitting
/**
 * @swagger
 * /api/mainHeading/delete/{id}:
 *   delete:
 *     summary: Delete Main Heaing 
 *     tags: [Main Heading For Files]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Main Heading Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.delete("/delete/:id", mainHeadingFile.deleteMainHeading)



module.exports = router;