const express = require('express');
const router = express.Router();
const groups = require('../controllers/groups.controller');
const { route } = require('./sessions.route');

// Create Group
/**
 * @swagger
 * /api/groups/create:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupNameStarred:
 *                 type: string
 *               groupNameUnstarred:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/create", groups.createGroup)

// Get All Groups 
/**
* @swagger
 * /api/groups:
*   get:
*     summary: Get All Groups
*     tags: [Groups]
*     security:
*       - bearerAuth: []
*     responses:
*       '200':
*         description: A successful response
*/
router.get("/", groups.getAllGroups)

// Manage Divisions In Groups
/**
 * @swagger
 * /api/groups/manageDivisionInGroup/{id}:
 *   post:
 *     summary: Update Group Divisions
 *     tags: [Groups]
 *     parameters: 
 *       - in: path
 *         name: id
 *         required: true
 *         description: Session Id
 *         schema:
 *           type: integer
 *     requestBody:
 *       description: The request body for updating group divisions
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groups:
 *                 type: object
 *                 patternProperties:
 *                   "^group[0-9]+$":
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       divisions:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *               availableDivisions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *     responses:
 *       '200':
 *         description: Successful response
 *       '400':
 *         description: Bad request
 */

router.post('/manageDivisionInGroup/:id', groups.manageDivisionInGroup)

// Retrieve Divisions From Groups
/**
 * @swagger
 * /api/groups/retrieveDivisionForGroup/{id}:
 *   get:
 *     summary: Get Divisions For Groups
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Session Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/retrieveDivisionForGroup/:id", groups.retrieveDivisionsForGroups)

module.exports = router;
