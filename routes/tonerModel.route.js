const express = require('express');
const router = express.Router();
const tonerModel = require('../controllers/tonerModel.controller');


// Create Toner Models
/**
 * @swagger
 * /api/tonerModel/create:
 *   post:
 *     summary: Create a new vendor
 *     tags: [Toner Models]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tonerModel:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/create", tonerModel.createTonerModel)

// Get All Toner Models
/**
 * @swagger
 * /api/tonerModel:
 *   get:
 *     summary: Get All Toner Models
 *     tags: [Toner Models]
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
router.get("/", tonerModel.getAllTonerModels)

// Search Toner Model
/**
 * @swagger
 * /api/tonerModel/searchTonerModel:
 *   get:
 *     summary: Search Toner Model
 *     tags: [Toner Models]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tonerModel
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/searchTonerModel", tonerModel.searchTonerModel)

// Get Single Toner Model
/**
 * @swagger
 * /api/tonerModel/{id}:
 *   get:
 *     summary: Get Single Toner Model
 *     tags: [Toner Models]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Toner Model Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/:id", tonerModel.getSingleTonerModel)

// Update Toner Model
/**
 * @swagger
 * /api/tonerModel/update/{id}:
 *   put:
 *     summary: Update Toner Model
 *     tags: [Toner Models]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Toner Model Id
 *         schema:
 *           type: integer
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tonerModel:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
   
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put("/update/:id",  tonerModel.updateTonerModel)

// Inactive/Delete Toner Model
/**
 * @swagger
 * /api/tonerModel/delete/{id}:
 *   delete:
 *     summary: Delete Toner Model
 *     tags: [Toner Models]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Toner Model Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.delete("/delete/:id", tonerModel.deleteTonerModel)

module.exports = router;