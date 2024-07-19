const express = require('express');
const router = express.Router();

const designations = require("../controllers/designations.controller");
const { createDesignationValidation } = require('../validation/departDesigValidation')



// Create a new Designation
/**
 * @swagger
 * /api/designations/create:
 *   post:
 *     summary: Create a new Designation
 *     tags: [Designations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               designationName:
 *                 type: string
 *                 description: The name of the designation
 *               description:
 *                 type: string
 *                 description: The description of the designation     
 *             required:
 *               - designationName
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/create", createDesignationValidation, designations.createDesignation);

// Retrieve all Designation
/**
 * @swagger
 * /api/designations/:
 *   get:
 *     summary: Get All Designations
 *     tags: [Designations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: currentPage
 *         schema:
 *           type: integer
 *         description: Current page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/", designations.findAllDesignations);

// Search Designation
/**
 * @swagger
 * /api/designations/searchQuery:
 *   get:
 *     summary: Get Search Designation
 *     tags: [Designations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: The term to search for in designations
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/searchQuery", designations.searchDesignations)

// Retrive Single Designation
/**
 * @swagger
 * /api/designations/{id}:
 *   get:
 *     summary: Get Single Designation
 *     tags: [Designations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Designation ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/:id", designations.findSingleDesignation);

// Updating Designation
/**
 * @swagger
 * /api/designations/update/{id}:
 *   put:
 *     summary: Get Updated Designation
 *     tags: [Designations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               designationName:
 *                 type: string
 *                 description: The name of the designation
 *               description:
 *                 type: string
 *                 description: The description of the designation
 *               designationStatus:
 *                 type: string
 *                 description: The description of the status      
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Designation ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put("/update/:id", designations.updateDesignation);

 // Suspend/Delete Designation
/**
 * @swagger
 * /api/designations/delete/{id}:
 *   delete:
 *     summary: Delete/Suspend Designation
 *     tags: [Designations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Designation ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
 router.delete("/delete/:id", designations.deleteDesignation);

module.exports = router;
