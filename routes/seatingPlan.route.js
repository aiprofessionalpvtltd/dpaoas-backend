const express = require('express');
const router = express.Router();
const seatingPlan = require('../controllers/seatingPlan.controller');

// Assign/UnAssign Seat 
/**
 * @swagger
 * /api/seatingPlan/seatAssignment/{number}:
 *   put:
 *     summary: Assign/UnAssign Member Seat
 *     tags: [Seating Plan]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fkMemberId:
 *                 type: integer
 *               rowNumber:
 *                 type: string
 *               assignStatus:
 *                 type: boolean
 *                 description: true or false
 *     parameters:
 *       - in: path
 *         name: number
 *         required: true
 *         description: Seat Number
 *         schema:
 *           type: integer     
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put("/seatAssignment/:id", seatingPlan.updateSeatAssignment )

// Retrieve All Seats Details
/**
 * @swagger
 * /api/seatingPlan/allSeats:
 *   get:
 *     summary: Get All Seats Details
 *     tags: [Seating Plan]
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/allSeats", seatingPlan.getAllSeatDetails)

// Retrieve Seat Details
/**
 * @swagger
 * /api/seatingPlan/getSeat/{number}:
 *   get:
 *     summary: Get Single Seat Details
 *     tags: [Seating Plan]
 *     parameters:
 *       - in: path
 *         name: number
 *         required: true
 *         description: Seat Number
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/getSeat/:id", seatingPlan.getSingleSeatDetails )


module.exports = router;