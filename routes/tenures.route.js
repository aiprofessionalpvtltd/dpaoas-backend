const express = require('express');
const router = express.Router();
const tenures = require('../controllers/tenures.controller');

// Create Tenures
/**
 * @swagger
 * /api/tenures/create:
 *   post:
 *     summary: Create a Tenure
 *     tags: [Tenures]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tenureName:
 *                 type: string
 *               fromDate:
 *                  type: string
 *               toDate:
 *                  type: string  
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/create", tenures.createTenure)

// Get All Tenures 
 /**
 * @swagger
  * /api/tenures:
 *   get:
 *     summary: Get All Tenures with respect to currentPage and pageSize
 *     tags: [Tenures]
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
router.get("/", tenures.getAllTenures)

// Get Single Tenure
/**
 * @swagger
 * /api/tenures/{id}:
 *   get:
 *     summary: Get Single Tenure
 *     tags: [Tenures]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Tenure Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/:id", tenures.getSingleTenure)

// Update Tenure
/**
 * @swagger
 * /api/tenures/update/{id}:
 *   put:
 *     summary: Get Updated Tenure 
 *     tags: [Tenures]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tenureName:
 *                 type: string
 *               fromDate:
 *                  type: string
 *               toDate:
 *                  type: string
 *               status:
 *                 type: string    
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Tenure Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put("/update/:id", tenures.updateTenure)

// Inactive/Delete Tenure
/**
 * @swagger
 * /api/tenures/delete/{id}:
 *   delete:
 *     summary: Delete Tenure
 *     tags: [Tenures]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Tenure Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.delete("/delete/:id", tenures.deleteTenure)

module.exports = router;
