const express = require('express');
const router = express.Router();
const terms = require('../controllers/terms.controller');

// Create Terms
/**
 * @swagger
 * /api/terms/create:
 *   post:
 *     summary: Create a Term
 *     tags: [Terms]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               termName:
 *                 type: string
 *               fkTenureId:
 *                  type: integer  
 *               fromDate:
 *                  type: string
 *               toDate:
 *                  type: string  
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/create", terms.createTerm)

// Get All Terms 
 /**
 * @swagger
  * /api/terms:
 *   get:
 *     summary: Get All Terms with respect to currentPage and pageSize
 *     tags: [Terms]
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
router.get("/", terms.getAllTerms)

// Get Single Term
/**
 * @swagger
 * /api/terms/{id}:
 *   get:
 *     summary: Get Single Term
 *     tags: [Terms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Term Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/:id", terms.getSingleTerm)

// Update Term
/**
 * @swagger
 * /api/terms/update/{id}:
 *   put:
 *     summary: Get Updated Term 
 *     tags: [Terms]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               termName:
 *                 type: string
 *               fkTenureId:
 *                  type: integer
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
 *         description: Term Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put("/update/:id", terms.updateTerm)

// Inactive/Delete Term
/**
 * @swagger
 * /api/terms/delete/{id}:
 *   delete:
 *     summary: Delete Term
 *     tags: [Terms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Term Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.delete("/delete/:id", terms.deleteTerm)

module.exports = router;
