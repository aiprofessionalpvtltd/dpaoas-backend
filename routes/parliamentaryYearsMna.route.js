const express = require('express');
const router = express.Router();
const parliamentaryYearsMna = require('../controllers/parliamentaryYearsMna.controller');

// Create Parliamentary Years
/**
 * @swagger
 * /api/parliamentaryYearsMna/create:
 *   post:
 *     summary: Create a new Parliamentary Year
 *     tags: [Parliamentary Years Mna]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               parliamentaryTenure:
 *                 type: string
 *               fkTenureId:
 *                  type: integer
 *               fromDate:
 *                 type: string
 *               toDate:
 *                 type: string  
 *               description:
 *                  type: string  
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/create", parliamentaryYearsMna.createParliamentaryYear)

// Get All Parliamentary Years
 /**
 * @swagger
  * /api/parliamentaryYearsMna:
 *   get:
 *     summary: Get All Parliamentary Years with respect to currentPage and pageSize
 *     tags: [Parliamentary Years Mna]
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
router.get("/", parliamentaryYearsMna.getAllParliamentaryYears)

// Get Single Parliamentary Year
/**
 * @swagger
 * /api/parliamentaryYearsMna/{id}:
 *   get:
 *     summary: Get Single Parliamentary Year
 *     tags: [Parliamentary Years Mna]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Parliamentary Year Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/:id", parliamentaryYearsMna.getSingleParliamentaryYear)

// Update Session
/**
 * @swagger
 * /api/parliamentaryYearsMna/update/{id}:
 *   put:
 *     summary: Get Updated Parliamentary Year
 *     tags: [Parliamentary Years Mna]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               parliamentaryTenure:
 *                 type: string
 *               fkTenureId:
 *                  type: integer
 *               fromDate:
 *                 type: string
 *               toDate:
 *                 type: string
 *               description:
 *                  type: string
 *               status:
 *                 type: string    
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Parliamentary Year Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put("/update/:id", parliamentaryYearsMna.updateParliamentaryYear)

// Inactive/Delete Parliamentary Year
/**
 * @swagger
 * /api/parliamentaryYearsMna/delete/{id}:
 *   delete:
 *     summary: Delete Parliamentary Years
 *     tags: [Parliamentary Years Mna]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Parliamentary Year Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.delete("/delete/:id", parliamentaryYearsMna.deleteParliamentaryYear)

// Retrieve Records by Tenure ID
router.get("/:id/tenureMinister", parliamentaryYearsMna.getRecordsByTenureId)

router.get("/:id/term", parliamentaryYearsMna.getRecordsByTermId)

module.exports = router;
