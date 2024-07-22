const express = require('express');
const router = express.Router();
const inventory = require('../controllers/inventory.controller');

// Create Inventory
/**
 * @swagger
 * /api/inventory/create:
 *   post:
 *     summary: Create a new inventory
 *     tags: [Inventory]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *               fkInventoryBillId:
 *                 type: integer
 *               manufactuer:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               productCategories:
 *                 type: string
 *               serialNo: 
 *                 type: string
 *               barCodeLable:
 *                 type: string
 *               description:
 *                 type: string
 *               purchasedDate: 
 *                 type: string
 *               warrantyExpiredDate:
 *                 type: string
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/create", inventory.createInventory)

// Get All Inventories
 /**
 * @swagger
 * /api/inventory/:
 *   get:
 *     summary: Get All Inventories
 *     tags: [Inventory]
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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/", inventory.geAllInventories)

// Search Inventory
/**
 * @swagger
 * /api/inventory/searchInventory:
 *   get:
 *     summary: Search Inventory
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: productName
 *         schema:
 *           type: string
 *       - in: query
 *         name: serialNo
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/searchInventory", inventory.searchInventory)

// Get Single Inventory
/**
 * @swagger
 * /api/inventory/{id}:
 *   get:
 *     summary: Get Single Inventory
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Inventory Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/:id", inventory.getSingleInventory)

// Update Inventory Bill
/**
 * @swagger
 * /api/inventory/update/{id}:
 *   put:
 *     summary: Update a inventory
 *     tags: [Inventory]
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
 *               productName:
 *                 type: string
 *               fkInventoryBillId:
 *                 type: integer
 *               manufacturer:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               productCategories:
 *                 type: string
 *               serialNo: 
 *                 type: string
 *               barCodeLable:
 *                 type: string
 *               description:
 *                 type: string
 *               purchasedDate: 
 *                 type: string
 *               warrantyExpiredDate:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put("/update/:id", inventory.updateInventory)

// Inactive/Delete Inventory Bill
/**
 * @swagger
 * /api/inventory/delete/{id}:
 *   delete:
 *     summary: Delete Inventory
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Inventory Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.delete("/delete/:id", inventory.deleteInventory)

// Get User's Inventory
// /**
//  * @swagger
//  * /api/inventory/getInventoryOfUser/{id}:
//  *   get:
//  *     summary: Retrive Inventory On User basis
//  *     tags: [Inventory]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         description: User Id
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       '200':
//  *         description: A successful response
//  */
// router.get("/getInventoryOfUser/:id", inventory.getInventoryOfUser)



module.exports = router;