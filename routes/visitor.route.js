const express = require('express');
const router = express.Router();

const visitor = require("../controllers/visitor.controller");
const isAuthenticated = require("../middleware/authToken");
// const checkPrivileges = require("../middleware/checkPrivilege")
const paramsValidate = require('../middleware/validate');
const { createVisitorValidation } = require('../validation/vmsValidation')




// Create new visitor
/**
 * @swagger
 * /api/visitor/create/{id}:
 *   post:
 *     summary: Create a new Visitor
 *     tags: [Visitors]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the Visitor
 *               cnic:
 *                 type: string
 *                 description: The cnic of the Visitor    
 *               details:
 *                 type: string
 *                 description: The details of the Visitor
 *               visitorStatus:
 *                 type: string
 *                 description: The visitorStatus of the Visitor 
 *             required:
 *               - name
 *               - cnic
 *               - details
 *     parameters:
 *       - in: path
 *         name: id
 *         description: PASS ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 * 
 */
router.post("/create/:id", createVisitorValidation, visitor.createVisitor)

// Create duplicate visitor
router.post("/duplicateVisitor/:id", visitor.createDuplicateVisitor)

// Retrieve All Visitors
/**
 * @swagger
 * /api/visitor/:
 *   get:
 *     summary: Get All Visitors
 *     tags: [Visitors]
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
router.get("/", visitor.findAllVisitors)

// Retrieve Single Visitor
/**
 * @swagger
 * /api/visitor/{id}:
 *   get:
 *     summary: Get Single Visitor
 *     tags: [Visitors]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Visitor ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/:id", visitor.findSingleVisitor)

// Update Visitor 
/**
 * @swagger
 * /api/visitor/update/{id}:
 *   put:
 *     summary: Get Updated Visitor
 *     tags: [Visitors]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the Visitor
 *               cnic:
 *                 type: string
 *                 description: The cnic of the Visitor    
 *               details:
 *                 type: string
 *                 description: The details of the Visitor
 *               visitorStatus:
 *                 type: string
 *                 description: The visitorStatus of the Visitor 
 *             required:
 *               - name
 *               - cnic
 *               - details      
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Visitor ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put("/update/:id", visitor.updateVisitor)

// Delete Visitor
/**
 * @swagger
 * /api/visitor/delete/{id}:
 *   delete:
 *     summary: Delete/Suspend Role
 *     tags: [Visitors]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Visitor ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.delete("/delete/:id", visitor.deleteVisitor)

module.exports = router;
