const express = require('express');
const router = express.Router();

const pass = require("../controllers/pass.controller");
const isAuthenticated = require("../middleware/authToken");
// const checkPrivileges = require("../middleware/checkPrivilege")
const paramsValidate = require('../middleware/validate');
const { createPassValidation } = require("../validation/vmsValidation")


// Create new pass
/**
 * @swagger
 * /api/pass/create:
 *   post:
 *     summary: Create a new Pass
 *     tags: [Passes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               passDate:
 *                 type: string
 *               requestedBy:
 *                 type: string
 *               branch:
 *                 type: string
 *               visitPurpose:
 *                 type: string
 *               fromDate:
 *                 type: string
 *               toDate:
 *                 type: string
 *               cardType:
 *                  type: string
 *               companyName:
 *                  type: string
 *               allowOffDays:
 *                  type: array
 *                  items:
 *                   type: string
 *               remarks:
 *                  type: string
 *               passStatus:
 *                  type: string
 *             required:
 *               - passDate
 *               - requestedBy
 *               - visitPurpose
 *               - fromDate
 *               - toDate
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/create", createPassValidation, pass.createPass)

// Get PDF Data
/**
 * @swagger
 * /api/pass/pdfData/{id}:
 *   get:
 *     summary: Get PDF In Return
 *     tags: [Passes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Pas ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/pdfData/:id", pass.getPDFData)

// Search Pass
/**
 * @swagger
 * /api/pass/searchQuery?search=?:
 *   get:
 *     summary: Get Search Pass
 *     tags: [Passes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: The term to search for in designations
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/searchQuery", pass.searchPasses)

// Get Visitors for A Pass
/**
 * @swagger
 * /api/pass/visitors/{id}:
 *   get:
 *     summary: Get Pass's Visitors
 *     tags: [Passes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Pass ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/visitors/:id", pass.getVisitors)

// Duplicate Pass
/**
 * @swagger
 * /api/pass/duplicate/{id}:
 *   get:
 *     summary: Get Duplicate Pass Data
 *     tags: [Passes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Pass ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/duplicate/:id", pass.getDuplicatePass)

// Create Duplicate Pass
/**
 * @swagger
 * /api/pass/createDuplicate:
 *   post:
 *     summary: Create a new pass with visitors
 *     tags: [Passes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pass:
 *                 type: object
 *                 properties:
 *                   passDate:
 *                     type: string
 *                     format: date
 *                   requestedBy:
 *                     type: string
 *                   branch:
 *                     type: string
 *                   visitPurpose:
 *                     type: string
 *                   fromDate:
 *                     type: string
 *                     format: date
 *                   toDate:
 *                     type: string
 *                     format: date
 *                   cardType:
 *                     type: string
 *                   companyName:
 *                     type: string
 *                   allowOffDays:
 *                     type: array
 *                     items:
 *                       type: string
 *                   remarks:
 *                     type: string
 *                   passStatus:
 *                     type: string
 *               visitor:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     cnic:
 *                       type: string
 *                     details:
 *                       type: string
 *             required:
 *               - pass
 *               - visitor
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/createDuplicate", pass.createDuplicatePass)

// Retrieve All Passes
/**
 * @swagger
 * /api/pass?currentPage=?&pageSize=?:
 *   get:
 *     summary: Get All Passes
 *     tags: [Passes]
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
router.get("/", pass.findAllPasses)

// Retrive Single Pass
/**
 * @swagger
 * /api/pass/{id}:
 *   get:
 *     summary: Get Single Pass
 *     tags: [Passes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Pass ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/:id", pass.findSinglePass)

// Update Pass
/**
 * @swagger
 * /api/pass/update/{id}:
 *   put:
 *     summary: Get Updated Pass
 *     tags: [Passes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *             type: object
 *             properties:
 *               passDate:
 *                 type: string
 *               requestedBy:
 *                 type: string
 *               branch:
 *                 type: string
 *               visitPurpose:
 *                 type: string
 *               fromDate:
 *                 type: string
 *               toDate:
 *                 type: string
 *               cardType:
 *                  type: string
 *               companyName:
 *                  type: string
 *               allowOffDays:
 *                  type: array
 *                  items:
 *                   type: string
 *               remarks:
 *                  type: string
 *               passStatus:
 *                  type: string      
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Pass ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put("/update/:id", pass.updatePass)

// Delete Pass
/**
 * @swagger
 * /api/pass/delete/{id}:
 *   delete:
 *     summary: Delete/Suspend Pass
 *     tags: [Passes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Pass ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.delete("/delete/:id", pass.deletePass)

module.exports = router;