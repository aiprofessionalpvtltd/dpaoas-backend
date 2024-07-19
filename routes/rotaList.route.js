const express = require('express');
const router = express.Router();
const rota = require('../controllers/rotaList.controller');



// Create Rota List
/**
 * @swagger
 * /api/rota/create:
 *   post:
 *     summary: Create a new Rota List
 *     tags: [ROTA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fkSessionId:
 *                 type: integer
 *               fkGroupId:
 *                 type: integer
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string    
 *               allotmentType:
 *                 type: string  
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/create", rota.createRotaList)

// Create Rota List For Further Allotment Of Days
/**
 * @swagger
 * /api/rota/createFurtherAllotment:
 *   post:
 *     summary: Create a new Rota List For Further Allotment Of Days
 *     tags: [ROTA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fkSessionId:
 *                 type: integer
 *               fkGroupId:
 *                 type: integer
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string    
 *               allotmentType:
 *                 type: string  
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/createFurtherAllotment", rota.createFurtherAllotment)

module.exports = router;