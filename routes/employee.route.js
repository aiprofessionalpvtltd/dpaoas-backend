const express = require('express');
const router = express.Router();
const employee = require("../controllers/employee.controller");
const { createEmployeeValidation } = require('../validation/employeeValidation')


// Create a new Employee
/**
 * @swagger
 * /api/employee/create:
 *   post:
 *     summary: Create a new Employee
 *     tags: [Employees]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: The name of the Employee
 *               lastName:
 *                 type: string
 *                 description: The lastName of the Employee
 *               userName:
 *                 type: string
 *                 description: The userName of the Employee 
 *               phoneNo:
 *                 type: string
 *                 description: The phoneNo of the Employee
 *               gender:
 *                 type: string
 *                 description: The gender of the Employee
 *               email:
 *                 type: string
 *                 description: The email of the Employee 
 *               password:
 *                 type: string
 *                 description: The password of the Employee
 *               fileNumber:
 *                 type: number
 *                 description: The fileNumber of the Employee
 *               supervisor:
 *                 type: number
 *                 description: The supervisor of the Employee 
 *               fkRoleId:
 *                 type: number
 *                 description: The fkRoleId of the Employee
 *               fkDepartmentId:
 *                 type: number
 *                 description: The fkDepartmentId of the Employee
 *               fkDesignationId:
 *                 type: number
 *                 description: The fkDesignationId of the Employee     
 *             required:
 *               - firstName
 *               - lastName
 *               - userName
 *               - phoneNo
 *               - gender
 *               - email
 *               - password
 *               - fileNumber
 *               - fkRoleId
 *               - fkDepartmentId
 *               - fkDesignationId
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/create", employee.createEmployee);

// Retrieve All Employees
/**
 * @swagger
 * /api/employee/:
 *   get:
 *     summary: Get All Employees
 *     tags: [Employees]
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
router.get("/", employee.findAllEmployees)

// Retrieve Single Employee
/**
 * @swagger
 * /api/employee/{id}:
 *   get:
 *     summary: Get Single Employee
 *     tags: [Employees]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Employee ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/:id", employee.findSingleEmployee)

// Update Employee
/**
 * @swagger
 * /api/employee/update/{id}:
 *   put:
 *     summary: Get Updated Employee
 *     tags: [Employees]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: The name of the Employee
 *               lastName:
 *                 type: string
 *                 description: The lastName of the Employee
 *               userName:
 *                 type: string
 *                 description: The userName of the Employee 
 *               phoneNo:
 *                 type: string
 *                 description: The phoneNo of the Employee
 *               gender:
 *                 type: string
 *                 description: The gender of the Employee
 *               email:
 *                 type: string
 *                 description: The email of the Employee 
 *               password:
 *                 type: string
 *                 description: The password of the Employee
 *               fileNumber:
 *                 type: number
 *                 description: The fileNumber of the Employee
 *               supervisor:
 *                 type: number
 *                 description: The supervisor of the Employee 
 *               fkRoleId:
 *                 type: number
 *                 description: The fkRoleId of the Employee
 *               fkDepartmentId:
 *                 type: number
 *                 description: The fkDepartmentId of the Employee
 *               fkDesignationId:
 *                 type: number
 *                 description: The fkDesignationId of the Employee     
 *             required:
 *               - firstName
 *               - lastName
 *               - userName
 *               - phoneNo
 *               - gender
 *               - email
 *               - password
 *               - fileNumber
 *               - fkRoleId
 *               - fkDepartmentId
 *               - fkDesignationId      
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Role ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put("/update/:id", employee.updateEmployee)

// Delete Employee
/**
 * @swagger
 * /api/employee/delete/{id}:
 *   delete:
 *     summary: Delete/Suspend Employee
 *     tags: [Employees]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Employee ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.delete("/delete/:id", employee.deleteEmployee)

module.exports = router
