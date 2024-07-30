const express = require('express');
const router = express.Router();
const flagController = require('../controllers/flagController');

// Create a new Flag
/**
 * @swagger
 * /api/flags/create:
 *   post:
 *     summary: Create a new Flag
 *     tags: [Flags]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               flag:
 *                 type: string
 *                 description: The flag description
 *               fkBranchId:
 *                 type: number
 *                 description: The foreign key of the branch
 *             required:
 *               - flag
 *               - fkBranchId
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/create", flagController.createFlag);

// Retrieve All Flags
/**
 * @swagger
 * /api/flags/:
 *   get:
 *     summary: Get All Flags
 *     tags: [Flags]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/", flagController.findAllFlags);

// Retrieve Single Flag
/**
 * @swagger
 * /api/flags/{id}:
 *   get:
 *     summary: Get Single Flag
 *     tags: [Flags]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Flag ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/:id", flagController.findFlagById);

// Update Flag
/**
 * @swagger
 * /api/flags/update/{id}:
 *   put:
 *     summary: Update Flag
 *     tags: [Flags]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               flag:
 *                 type: string
 *                 description: The flag description
 *               fkBranchId:
 *                 type: number
 *                 description: The foreign key of the branch
 *             required:
 *               - flag
 *               - fkBranchId
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Flag ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put("/update/:id", flagController.updateFlag);

// Delete Flag
/**
 * @swagger
 * /api/flags/delete/{id}:
 *   delete:
 *     summary: Delete Flag
 *     tags: [Flags]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Flag ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.delete("/delete/:id", flagController.deleteFlag);

// Define the route for retrieving flags by branchId
router.get('/flags/branch/:branchId', flagController.getFlagsByBranchId);


module.exports = router;
