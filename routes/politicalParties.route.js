const express = require('express');
const router = express.Router();
const politicalParties = require('../controllers/politicalParties.controller');

// Create Politcal Party
/**
 * @swagger
 * /api/politicalParties/create:
 *   post:
 *     summary: Create a new Political Party
 *     tags: [Political Parties]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               partyName:
 *                 type: string
 *               description:
 *                 type: string
 *               shortName:
 *                 type: string    
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/create", politicalParties.createPoliticalParty)

// Get All Political Parties
 /**
 * @swagger
  * /api/politicalParties:
 *   get:
 *     summary: Get All Political Parties with respect to currentPage and pageSize
 *     tags: [Political Parties]
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
router.get("/", politicalParties.getAllPoliticalParties)

// Get Single Political Party
/**
 * @swagger
 * /api/politicalParties/{id}:
 *   get:
 *     summary: Get Single Political Party
 *     tags: [Political Parties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Political Party Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/:id", politicalParties.getSinglePoliticalParty)

// Update Session
/**
 * @swagger
 * /api/politicalParties/update/{id}:
 *   put:
 *     summary: Get Updated Political Party
 *     tags: [Political Parties]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               partyName:
 *                 type: string
 *               description:
 *                 type: string
 *               shortName:
 *                 type: string
 *               status:
 *                 type: string    
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Political Party Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put("/update/:id", politicalParties.updatePoliticalParty)

// Inactive/Delete Session
/**
 * @swagger
 * /api/politicalParties/delete/{id}:
 *   delete:
 *     summary: Delete Political Party
 *     tags: [Political Parties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Political Party Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.delete("/delete/:id", politicalParties.deletePoliticalParty)

module.exports = router;
