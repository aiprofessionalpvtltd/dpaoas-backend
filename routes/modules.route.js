const express = require('express');
const router = express.Router();

const modules = require("../controllers/module.controller");


// Create a New Module
/**
 * @swagger
 * /api/modules/create:
 *   post:
 *     summary: Create Module
 *     tags: [Modules]
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
 *               moduleStatus:
 *                 type: string  
 *             required:
 *               - name
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/create", modules.createModule);

// Retrieve All Modules
/**
 * @swagger
 * /api/modules/:
 *   get:
 *     summary: Get All Modules
 *     tags: [Modules]
 *     security:
 *        - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/", modules.findAllModules);

module.exports = router;
