const express = require('express');
const router = express.Router();
const parliamentaryYears = require('../controllers/parliamentaryYears.controller');

// Create Parliamentary Years
/**
 * @swagger
 * /api/parliamentaryYears/create:
 *   post:
 *     summary: Create a new Parliamentary Year
 *     tags: [Parliamentary Years]
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
router.post("/create", parliamentaryYears.createParliamentaryYear)

// Get All Parliamentary Years
 /**
 * @swagger
  * /api/parliamentaryYears:
 *   get:
 *     summary: Get All Parliamentary Years with respect to currentPage and pageSize
 *     tags: [Parliamentary Years]
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
router.get("/", parliamentaryYears.getAllParliamentaryYears)

// Get Single Parliamentary Year
/**
 * @swagger
 * /api/parliamentaryYears/{id}:
 *   get:
 *     summary: Get Single Parliamentary Year
 *     tags: [Parliamentary Years]
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
router.get("/:id", parliamentaryYears.getSingleParliamentaryYear)

// Update Session
/**
 * @swagger
 * /api/parliamentaryYears/update/{id}:
 *   put:
 *     summary: Get Updated Parliamentary Year
 *     tags: [Parliamentary Years]
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
router.put("/update/:id", parliamentaryYears.updateParliamentaryYear)

// Inactive/Delete Parliamentary Year
/**
 * @swagger
 * /api/parliamentaryYears/delete/{id}:
 *   delete:
 *     summary: Delete Parliamentary Years
 *     tags: [Parliamentary Years]
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
router.delete("/delete/:id", parliamentaryYears.deleteParliamentaryYear)

module.exports = router;
