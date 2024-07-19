const express = require('express');
const router = express.Router();

const permissions = require("../controllers/permissions.controller");
const paramsValidate = require('../middleware/validate');


// Create a New Permission
/**
 * @swagger
 * /api/permissions/create:
 *   post:
 *     summary: Create Permission
 *     tags: [Permissions]
 *     security:
 *        - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               fkModuleId:
 *                 type: integer    
 *             required:
 *               - name
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/create", permissions.createPermission);

// Retrieve All Permissions
/**
 * @swagger
 * /api/permissions/:
 *   get:
 *     summary: Get All Permissions
 *     tags: [Permissions]
 *     security:
 *        - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/", permissions.findAllPermissions);

// Retrieve All Modules Permissions
/**
 * @swagger
 * /api/permissions/modulesPermissions:
 *   get:
 *     summary: Get All Modules Permissions
 *     tags: [Permissions]
 *     security:
 *        - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/modulesPermissions", permissions.findAllModulesPermissions)


module.exports = router

