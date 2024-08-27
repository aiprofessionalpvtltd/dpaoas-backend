const express = require('express');
const router = express.Router();
const membersController = require('../controllers/members.controller');
const {
    memberRequestValidation, memberupdateValidation
} = require('../validation/membersValidation')

/**
 * @swagger
 * /api/members/create:
 *   post:
 *     summary: Create a Member
 *     tags: [Members]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               memberName:
 *                 type: string
 *               fkTenureId:
 *                  type: integer
 *               memberStatus:
 *                  type: string  
 *               politicalParty:
 *                  type: integer
 *               electionType:
 *                  type: string
 *               gender:
 *                  type: string
 *               isMinister:
 *                  type: boolean
 *               phoneNo:
 *                  type: string
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post('/create', membersController.createMember);
// router.get('/tenures', membersController.getTenures);
// router.get('/parties', membersController.getParties);
// router.get('/search', membersController.search);

/**
 * @swagger
 * /api/members/{id}:
 *   put:
 *     summary: Get Updated Member 
 *     tags: [Members]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               memberName:
 *                 type: string
 *               fkTenureId:
 *                  type: integer
 *               memberStatus:
 *                  type: string
 *               politicalParty:
 *                 type: integer    
 *               electionType:
 *                  type: string
 *               gender:
 *                  type: string
 *               isMinister:
 *                  type: boolean
 *               phoneNo:
 *                  type: string              
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Member Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put('/:id', memberRequestValidation, membersController.updateMember);

 /**
 * @swagger
  * /api/members/all:
 *   get:
 *     summary: Get All Members with respect to currentPage and pageSize
 *     tags: [Members]
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
router.get('/all', membersController.getAllMembers);

/**
 * @swagger
 * /api/members/{id}:
 *   get:
 *     summary: Get Single Member
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Member Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get('/:id', membersController.getMemberById);

/**
 * @swagger
 * /api/members/delete/{id}:
 *   delete:
 *     summary: Delete Memer
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Member Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.delete('/delete/:id', membersController.deleteMember)

router.put('/promote/:memberID', membersController.promoteMembers)

router.get('/parliamentaryYears/:id', membersController.getMemberByParliamentaryYearID);


module.exports = router;
