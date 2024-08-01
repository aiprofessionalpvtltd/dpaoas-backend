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


// Update Register
router.put("/update/:id", fileRegisters.updateFileRegister);


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

// Retrieve Single File Register
/**
 * @swagger
 * /api/fileRegisters/singleRegister/{id}:
 *   get:
 *     summary: Retrieve Single File Register
 *     tags: [File Registers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Register Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/singleRegister/:id", fileRegisters.findSingleFileRegister)


// Define route for deleting a file register
router.delete("/delete/:id", fileRegisters.deleteFileRegister);


module.exports = router;