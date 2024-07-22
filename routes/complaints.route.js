const express = require('express');
const router = express.Router();
const complaints = require('../controllers/complaints.controller');
const { uploadFile } = require('../common/upload');

// Issue Complaint
/**
 * @swagger
 * /api/complaints/issueComplaint:
 *   post:
 *     summary: Issue new Complaint
 *     tags: [Complaints]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string  
 *               fkComplaineeUserId:
 *                 type: integer
 *               fkComplaintTypeId:
 *                 type: integer
 *               fkComplaintCategoryId:
 *                 type: integer
 *               fkTonerModelId:
 *                 type: integer
 *               tonerQuantity:
 *                 type: integer 
 *               complaintDescription:
 *                  type: string
 *               complaintIssuedDate:
 *                  type: string
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/issueComplaint",complaints.issueComplaint)

// Retrieve Employees as Engineers
/**
 * @swagger
 * /api/complaints/retrieveEmployeesAsEngineers:
 *   get:
 *     summary: Get All Employees as IT Engineers
 *     tags: [Complaints]
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
router.get("/retrieveEmployeesAsEngineers", complaints.retrieveEmployeesAsEngineers)

// Search Complaint
/**
 * @swagger
 * /api/complaints/searchComplaint:
 *   get:
 *     summary: Search Complaints
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: complaineeUser
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userName
 *         schema:
 *           type: string
 *       - in: query
 *         name: resolverUser
 *         schema:
 *           type: integer
 *       - in: query
 *         name: complaintType
 *         schema:
 *           type: integer
 *       - in: query
 *         name: complaintCategory
 *         schema:
 *           type: integer
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *       - in: query
 *         name: complaintIssuedDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: complaintResolvedDate
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/searchComplaint", complaints.searchComplaint)

// Update User Complaint
/**
 * @swagger
 * /api/complaints/updateComplaint/{id}:
 *   put:
 *     summary: Update User Complaint
 *     tags: [Complaints]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fkComplaineeUserId:
 *                 type: integer
 *               userName:
 *                 type: string
 *               fkAssignedResolverId:
 *                 type: integer    
 *               fkComplaintTypeId:
 *                 type: integer
 *               fkComplaintCategoryId: 
 *                 type: integer 
 *               complaintDescription:
 *                  type: string
 *               complaintIssuedDate:
 *                  type: string   
 *               fkTonerModelId:
 *                  type: integer
 *               tonerQuantity:
 *                  type: integer
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Complaint Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put('/updateComplaint/:id', complaints.updateComplaint)

// Resolve Complaint
/**
 * @swagger
 * /api/complaints/resolveComplaint/{id}:
 *   put:
 *     summary: Resolve Complaint
 *     tags: [Complaints]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fkAssignedResolverId:
 *                 type: integer
 *               complaintResolvedDate:
 *                 type: string
 *               complaintRemark:
 *                 type: string    
 *               complaintStatus:
 *                 type: string
 *               fkTonerModelId:
 *                 type: integer
 *               tonerQuantity: 
 *                 type: integer 
 *               complaintAttachmentFromResolver:
 *                  type: string
 *                  format: binary
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Complaint Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put("/resolveComplaint/:id", uploadFile('complaintsFromResolver'),complaints.resolveComplaint)

// Get All Complaint Types
/**
 * @swagger
 * /api/complaints/complaintTypes:
 *   get:
 *     summary: Get All Complaint Types
 *     tags: [Complaints]
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
router.get("/complaintTypes", complaints.findAllComplaintTypes)

// Get All Complaint Categories
/**
 * @swagger
 * /api/complaints/complaintCategories:
 *   get:
 *     summary: Get All Complaint Categories
 *     tags: [Complaints]
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
router.get("/complaintCategories", complaints.findAllComplaintCategories)

// Get All Complaints For Admin Side
/**
 * @swagger
 * /api/complaints/:
 *   get:
 *     summary: Get All Complaints
 *     tags: [Complaints]
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
router.get("/", complaints.findAllComplaints)



// Get All Complaints By Complainee
/**
 * @swagger
 * /api/complaints/ByComplainee/{id}:
 *   get:
 *     summary: Get All Complaints For Complainee
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Complainee Id
 *         schema:
 *           type: integer
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
router.get("/ByComplainee/:id", complaints.findAllComplaintsByComplainee)

// Get All Complaints By Resolver
/**
 * @swagger
 * /api/complaints/ByResolver/{id}:
 *   get:
 *     summary: Get All Complaints For Resolver
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Resolver Id
 *         schema:
 *           type: integer
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
router.get("/ByResolver/:id", complaints.findAllComplaintsByResolver)

// Get Single Complaint
/**
 * @swagger
 * /api/complaints/{id}:
 *   get:
 *     summary: Get Single Complaint
 *     tags: [Complaints]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Complaint Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/:id", complaints.findSingleComplaint)

// Delete Complaint
/**
 * @swagger
 * /api/complaints/delete/{id}:
 *   delete:
 *     summary: Delete Complaint
 *     tags: [Complaints]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Complaint Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.delete("/delete/:id", complaints.deleteComplaint)

// Assign Complaints to Engineers/Resolvers
/**
 * @swagger
 * /api/complaints/assignToResolver/{id}:
 *   post:
 *     summary: Assign Complaints to Engineers/Resolvers
 *     tags: [Complaints]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Complaint Id
 *         schema:
 *           type: integer
 *     security:
 *       - BearerAuth: [] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fkAssignedById:
 *                 type: integer
 *               fkAssignedResolverId:
 *                 type: integer
 *               assignmentRemarks:
 *                 type: string
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/assignToResolver/:id", complaints.assignmentOfComplaints)

// Retrieve Complaints for Assigned Resolvers/Engineer
/**
 * @swagger
 * /api/complaints/getComplaintsForAssigned/{id}:
 *   get:
 *     summary: Retrieve Complaints for Assigned Resolvers/Engineer
 *     tags: [Complaints]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Assigned Resolver Id
 *         schema:
 *           type: integer
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
router.get("/getComplaintsForAssigned/:id", complaints.retrieveAssignedComplaints)


module.exports = router;