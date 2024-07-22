const express = require('express');
const router = express.Router();
const vendors = require('../controllers/vendor.controller');


// Create Vendors
/**
 * @swagger
 * /api/vendors/create:
 *   post:
 *     summary: Create a new vendor
 *     tags: [Vendors]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vendorName:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: integer
 
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/create", vendors.createVendor)

// Get All Vendors
/**
 * @swagger
 * /api/vendors:
 *   get:
 *     summary: Get All Vendors
 *     tags: [Vendors]
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
router.get("/", vendors.getAllVendors)

// Search Vendor
/**
 * @swagger
 * /api/vendors/searchVendor:
 *   get:
 *     summary: Search Vendor
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vendorName
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/searchVendor", vendors.searchVendor)

// Get Single Vendor
/**
 * @swagger
 * /api/vendors/{id}:
 *   get:
 *     summary: Get Single Vendor
 *     tags: [Vendors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Vendor Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/:id", vendors.getSingleVendor)

// Update Vendor
/**
 * @swagger
 * /api/vendors/update/{id}:
 *   put:
 *     summary: Update Vendor
 *     tags: [Vendors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Vendor Id
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
 *               vendorName:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
   
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put("/update/:id",  vendors.updateVendor)

// Inactive/Delete Vendor
/**
 * @swagger
 * /api/vendors/delete/{id}:
 *   delete:
 *     summary: Delete Vendor
 *     tags: [Vendors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Vendor Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.delete("/delete/:id", vendors.deleteVendor)

module.exports = router;