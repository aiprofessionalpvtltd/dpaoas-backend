const express = require('express');
const router = express.Router();
const userInventory = require('../controllers/userInventory.controller');

// Issue Product to User/Branch
/**
 * @swagger
 * /api/userInventory/issueProduct/{id}:
 *   post:
 *     summary: Issue Product to User/Branch
 *     tags: [User Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Inventory Id
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
 *               fkAssignedToUserId:
 *                 type: integer
 *               fkAssignedToBranchId:
 *                 type: integer
 *               issuedDate:
 *                 type: string
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/issueProduct/:id", userInventory.issueProductToUser)

// Return Product From User/Branch
/**
 * @swagger
 * /api/userInventory/returnProduct/{id}:
 *   put:
 *     summary: Return Product From User/Branch
 *     tags: [User Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Inventory Id
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
 *               returnDate:
 *                 type: string
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put("/returnProduct/:id", userInventory.returnProductFromUser)

// Get Inventory Of User
/**
 * @swagger
 * /api/userInventory/inventoryOfUser/{id}:
 *   get:
 *     summary: Get Inventory Of User
 *     tags: [User Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User Id
 *         schema:
 *           type: integer
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/inventoryOfUser/:id", userInventory.getInventoryOfUser)

// Search User Inventory
/**
 * @swagger
 * /api/userInventory/searchInventory:
 *   get:
 *     summary: Search Inventory
 *     tags: [User Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: serialNo
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/searchInventory", userInventory.searchUserInventory)

// Retrieve Data
/**
* @swagger
* /api/userInventory/:
*   get:
*     summary: Get All User Inventory
*     tags: [User Inventory]
*     security:
*       - bearerAuth: []
*     responses:
*       '200':
*         description: A successful response
*/
router.get("/", userInventory.retrieveUserInventory)



module.exports = router;