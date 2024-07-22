const express = require('express');
const router = express.Router();
const tonerInstallation = require('../controllers/tonerInstallation.controller');


// Create Toner Installations
/**
 * @swagger
 * /api/tonerInstallation/create:
 *   post:
 *     summary: Create a new Toner Installation
 *     tags: [Toner Installations]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               requestDate:
 *                 type: string
 *               fkUserRequestId:
 *                 type: integer
 *               fkBranchRequestId:
 *                 type: integer
 *               fkTonerModelId:
 *                 type: integer
 *               quantity:
 *                 type: integer              
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/create", tonerInstallation.createTonerInstallation)

// Get All Toner Installations
/**
 * @swagger
 * /api/tonerInstallation:
 *   get:
 *     summary: Get All Toner Installations
 *     tags: [Toner Installations]
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
router.get("/", tonerInstallation.getAllTonerInstallations)

// Search Toner Installation
/**
 * @swagger
 * /api/tonerInstallation/searchTonerInstallation:
 *   get:
 *     summary: Search Toner Installation
 *     tags: [Toner Installations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: requestUser
 *         schema:
 *           type: integer
 *       - in: query
 *         name: requestBranch
 *         schema:
 *           type: integer
 *       - in: query
 *         name: tonerModel
 *         schema:
 *           type: integer
 *       - in: query
 *         name: requestDate
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/searchTonerInstallation", tonerInstallation.searchTonerInstallation)

// Get Single Toner Installation
/**
 * @swagger
 * /api/tonerInstallation/{id}:
 *   get:
 *     summary: Get Single Toner Installation
 *     tags: [Toner Installations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Toner Installation Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/:id", tonerInstallation.getSingleTonerInstallation)

// Update Toner Model
/**
 * @swagger
 * /api/tonerInstallation/update/{id}:
 *   put:
 *     summary: Update Toner Installation
 *     tags: [Toner Installations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Toner Installation Id
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
 *               requestDate:
 *                 type: string
 *               fkUserRequestId:
 *                 type: integer
 *               fkBranchRequestId:
 *                 type: integer
 *               fkTonerModelId:
 *                 type: integer
 *               quantity:
 *                 type: integer 
 *               status: 
 *                 type: string             
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put("/update/:id",  tonerInstallation.updateTonerInstallation)

// Inactive/Delete Toner Model
/**
 * @swagger
 * /api/tonerInstallation/delete/{id}:
 *   delete:
 *     summary: Delete Toner Installation
 *     tags: [Toner Installations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Toner Installation Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.delete("/delete/:id", tonerInstallation.deleteTonerInstallation)

module.exports = router;