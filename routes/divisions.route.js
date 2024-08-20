const express = require('express');
const router = express.Router();
const divisions = require('../controllers/divisions.controller');

// Create Divisions
/**
 * @swagger
 * /api/divisions/create:
 *   post:
 *     summary: Create a Division
 *     tags: [Divisions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               divisionName:
 *                 type: string
 *               fkMinistryId:
 *                  type: integer    
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/create", divisions.createDivision)

router.get("/group-by-division/:divisionId", divisions.groupByDivision)

// Get All Divisions 
 /**
 * @swagger
  * /api/divisions:
 *   get:
 *     summary: Get All Divisions with respect to currentPage and pageSize
 *     tags: [Divisions]
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
router.get("/", divisions.getAllDivisions)

// Get Single Division
/**
 * @swagger
 * /api/divisions/{id}:
 *   get:
 *     summary: Get Single Division
 *     tags: [Divisions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Division Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/:id", divisions.getSingleDivision)

// Update Division
/**
 * @swagger
 * /api/divisions/update/{id}:
 *   put:
 *     summary: Get Updated Division 
 *     tags: [Divisions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               divisionName:
 *                 type: string
 *               fkMinistryId:
 *                  type: integer
 *               divisionStatus:
 *                 type: string    
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Division Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put("/update/:id", divisions.updateDivision)

// Inactive/Delete Division
/**
 * @swagger
 * /api/divisions/delete/{id}:
 *   delete:
 *     summary: Delete Division
 *     tags: [Divisions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Division Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.delete("/delete/:id", divisions.deleteDivision)

module.exports = router;
