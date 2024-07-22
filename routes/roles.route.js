const express = require('express');
const router = express.Router();

const roles = require("../controllers/roles.controller");
const paramsValidate = require('../middleware/validate');
const { createRoleValidation } = require('../validation/rbacValidation')



// Create a new Role
/**
 * @swagger
 * /api/roles/create:
 *   post:
 *     summary: Create a new Role
 *     tags: [Roles]
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
 *                 description: The name of the Role
 *               description:
 *                 type: string
 *                 description: The description of the Role     
 *             required:
 *               - name
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/create", createRoleValidation, roles.createRole);

// Retrieve all Roles
/**
 * @swagger
 * /api/roles/:
 *   get:
 *     summary: Get All Roles
 *     tags: [Roles]
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
router.get("/", roles.findAllRoles);

// Retreive Single Role
/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Get Single Role
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
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
router.get("/:id", roles.findSingleRole)

// Assign a permssion to a role
/**
 * @swagger
 * /api/roles/updateRole/{id}:
 *   put:
 *     summary: Get Updated Role
 *     tags: [Roles]
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
 *                 description: The name of the Role
 *               description:
 *                 type: string
 *                 description: The description of the Role
 *               roleStatus:
 *                 type: string
 *                 description: The roleStatus of the Role  
 *               permissionsToUpdate: 
 *                  type: array
 *                  items:     
 *                     type: integer
 *                  description: Ids of Permissions to Add/Remove
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
router.put("/updateRole/:id", roles.updateRole);

// Delete  Role
/**
 * @swagger
 * /api/roles/delete/{id}:
 *   delete:
 *     summary: Delete/Suspend Role
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
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
router.delete("/delete/:id", roles.deleteRole)


module.exports = router;
