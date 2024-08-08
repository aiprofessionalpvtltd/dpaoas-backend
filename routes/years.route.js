const express = require('express');
const router = express.Router();
const years = require('../controllers/years.controller');

// Create Years
/**
 * @swagger
 * /api/years/create:
 *   post:
 *     summary: Create a Year
 *     tags: [Years]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               yearName:
 *                 type: string
 *               fromDate:
 *                  type: string
 *               toDate:
 *                  type: string  
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/create", years.createYear)

// Get All Years 
 /**
 * @swagger
  * /api/years:
 *   get:
 *     summary: Get All Years with respect to currentPage and pageSize
 *     tags: [Years]
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
router.get("/", years.getAllYears)

// Get Single Year
/**
 * @swagger
 * /api/years/{id}:
 *   get:
 *     summary: Get Single Year
 *     tags: [Years]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Year Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/:id", years.getSingleYear)

// Update Year
/**
 * @swagger
 * /api/years/update/{id}:
 *   put:
 *     summary: Get Updated Year 
 *     tags: [Years]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               yearName:
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
 *         description: Year Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put("/update/:id", years.updateYear)

// Inactive/Delete Year
/**
 * @swagger
 * /api/years/delete/{id}:
 *   delete:
 *     summary: Delete Year
 *     tags: [Years]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Year Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.delete("/delete/:id", years.deleteYear)

module.exports = router;
