const express = require('express');
const router = express.Router();
const inventoryBills = require('../controllers/inventoryBills.controller');
const { uploadFile } = require('../common/upload');


// Create Inventory Bills
/**
 * @swagger
 * /api/inventoryBills/create:
 *   post:
 *     summary: Create a new inventory bill
 *     tags: [Inventory Bills]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               invoiceNumber:
 *                 type: string
 *               fkVendorId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               description:
 *                 type: string
 *               invoiceAttachment:
 *                 type: string
 *                 format: binary
 *               invoiceDate:
 *                 type: string     
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/create", uploadFile('invoiceBill') ,inventoryBills.createInventoryBill)

// Get All Inventory Bill
/**
 * @swagger
 * /api/inventoryBills:
 *   get:
 *     summary: Get All Inventory Bills
 *     tags: [Inventory Bills]
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
router.get("/", inventoryBills.getAllInventoryBills)

// Search Inventory Bill
/**
 * @swagger
 * /api/inventoryBills/searchBill:
 *   get:
 *     summary: Search Inventory Bill
 *     tags: [Inventory Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: invoiceNumber
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/searchBill", inventoryBills.searchInventoryBill)

// Get Single Inventory Bill
/**
 * @swagger
 * /api/inventoryBills/{id}:
 *   get:
 *     summary: Get Single Inventory Bill
 *     tags: [Inventory Bills]
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
router.get("/:id", inventoryBills.getSingleInventoryBill)

// Update Inventory Bill
/**
 * @swagger
 * /api/inventoryBills/update/{id}:
 *   put:
 *     summary: Update  inventory bill
 *     tags: [Inventory Bills]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               invoiceNumber:
 *                 type: string
 *               fkVendorId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               description:
 *                 type: string
 *               invoiceAttachment:
 *                 type: string
 *                 format: binary
 *               invoiceDate:
 *                 type: string    
 *               status:
 *                 type: string 
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put("/update/:id", uploadFile('invoiceBill'), inventoryBills.updateInventoryBill)

// Inactive/Delete Inventory Bill
/**
 * @swagger
 * /api/inventoryBills/delete/{id}:
 *   delete:
 *     summary: Delete Inventory Bill
 *     tags: [Inventory Bills]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Inventory Bill Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.delete("/delete/:id", inventoryBills.deleteInventoryBill)

module.exports = router;