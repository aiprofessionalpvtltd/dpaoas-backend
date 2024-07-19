const express = require('express');
const router = express.Router();

const departments = require("../controllers/departments.controller");
const { createDepartmentValidation } = require('../validation/departDesigValidation')
//var router = require("express").Router();

// Create a new Department
/**
 * @swagger
 * /api/departments/create:
 *   post:
 *     summary: Create a new Department
 *     tags: [Departments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               departmentName:
 *                 type: string
 *                 description: The name of the department
 *               description:
 *                 type: string
 *                 description: The description of the department    
 *             required:
 *               - departmentName
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/create", createDepartmentValidation, departments.createDepartment);

// Retrieve all Departments
/**
 * @swagger
 * /api/departments/:
 *   get:
 *     summary: Get All Departments
 *     tags: [Departments]
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
router.get("/", departments.findAllDepartments);

// Search Departments
/**
 * @swagger
 * /api/departments/searchQuery:
 *   get:
 *     summary: Get Search Departments
 *     tags: [Departments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: The term to search for in departments 
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/searchQuery", departments.searchDepartments)

// Single Department
/**
 * @swagger
 * /api/departments/{id}:
 *   get:
 *     summary: Get Single Department
 *     tags: [Departments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Department ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/:id", departments.findSingleDepartment);

// Update Department
/**
 * @swagger
 * /api/departments/update/{id}:
 *   put:
 *     summary: Get Updated Department
 *     tags: [Departments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               departmentName:
 *                 type: string
 *                 description: The name of the department
 *               description:
 *                 type: string
 *                 description: The description of the department
 *               departmentStatus:
 *                 type: string
 *                 description: The description of the status      
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Department ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put("/update/:id", departments.updateDepartment)

// Suspend/Delete Department
/**
 * @swagger
 * /api/departments/delete/{id}:
 *   delete:
 *     summary: Delete/Suspend Department
 *     tags: [Departments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Department ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.delete("/delete/:id", departments.deleteDepartment);

module.exports = router;
