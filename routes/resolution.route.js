const express = require('express');
const router = express.Router();
const resolution = require("../controllers/resolution.controller");
const upload = require("../middleware/resolutionMulter")
const { createResolutionValidation } = require('../validation/resolutionValidation')
const { uploadFile } = require('../common/upload');

router.get('/getSingleResolutionData/:id', resolution.getSingleResolutionData);
/**
 * @swagger
 * /api/resolution/create:
 *   post:
 *     summary: Create Resolution
 *     tags: [Resolution]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fkSessionNo:
 *                 type: integer
 *                 description: fkSession No
 *               noticeOfficeDiaryNo:
 *                 type: integer
 *                 description: Notice Office Diary No
 *               noticeOfficeDiaryDate:
 *                 type: string
 *                 description: Notice Office Diary Date
 *               noticeOfficeDiaryTime:
 *                 type: string
 *                 description: Notice Office Diary Time
 *               resolutionType:
 *                 type: string
 *                 description: Resolution Type
 *               englishText:
 *                 type: string
 *                 description: English Text   
 *               urduText:
 *                 type: string
 *                 description: Urdu Text
 *               fkResolutionStatus:
 *                 type: string
 *                 description: fk Resolution Status always 1 for create
 *               device:
 *                 type: string
 *                 description: web/mobile
 *               description:
 *                 type: string
 *                 description: description
 *               web_id:
 *                 type: string
 *                 description: web_id
 *               attachment:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: The file to be attached
 *               resolutionMovers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     fkMemberId:
 *                       type: integer
 *                       description: Member ID
 *     responses:
 *       '200':
 *         description: A successful response
 */

router.post("/create", uploadFile("resolution"), resolution.createResolution);

/**
 * @swagger
 * /api/resolution:
 *   get:
 *     summary: Get Resolutions by web_id
 *     tags: [Resolution]
 *     parameters:
 *       - in: query
 *         name: web_id
 *         required: true
 *         description: Web ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/", resolution.findAllResolutionsByWebId);

router.get("/summary", resolution.findAllResolutionsSummary);

router.post("/resolution-lists", resolution.createResolutionListAndAssociateResolutions);
router.post("/generateResolutionListData", resolution.generateResolutionListData);

router.put('/updateResolutionListAndAssociations', resolution.updateResolutionListAndAssociations);
router.get('/resolutionLists', resolution.getAllResolutionLists);
router.delete('/resolutionlists/:id', resolution.deleteResolutionList);
// router.get("/resolutionsBySessionRange", resolution.findAllResolutionsBySessionRange);


// Search Resolution
/**
 * @swagger
 * /api/resolution/searchQuery:
 *   get:
 *     summary: Get Search Resolution
 *     tags: [Resolution]
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
 *       - in: query
 *         name: fkSessionNoFrom
 *         schema:
 *           type: integer
 *         description: Session No From
 *       - in: query
 *         name: fkSessionNoTo
 *         schema:
 *           type: integer
 *         description: Session No To
 *       - in: query
 *         name: resolutionType
 *         schema:
 *           type: string
 *         description: resolution Type
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: keyword
 *       - in: query
 *         name: resolutionId
 *         schema:
 *           type: integer
 *         description: resolution Id
 *       - in: query
 *         name: resolutionDiaryNo
 *         schema:
 *           type: integer
 *         description: Resolution Diary No
 *       - in: query
 *         name: fkResolutionStatus
 *         schema:
 *           type: integer
 *         description: Resolution Status Id
 *       - in: query
 *         name: noticeOfficeDiaryNo
 *         schema:
 *           type: integer
 *         description: Notice OfficeDiary No
 *       - in: query
 *         name: colourResNo
 *         schema:
 *           type: string
 *         description: colourRes No
 *       - in: query
 *         name: noticeOfficeDiaryDateFrom
 *         schema:
 *           type: String
 *         description: NoticeOfficeDiary Date From
 *       - in: query
 *         name: noticeOfficeDiaryDateTo
 *         schema:
 *           type: String
 *         description: Notice OfficeDiary To
 *       - in: query
 *         name: resolutionMovers
 *         schema:
 *           type: integer
 *         description: Member Id
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/searchQuery", resolution.searchResolution);
router.post("/selectColumnsResolution", resolution.selectColumnsResolution);

router.get("/searchQuery/annual-report", resolution.searchResolutionAnnualReport);

router.get("/searchInactiveResoultion", resolution.searchInactiveResolution);

// Retrieve all Resolutions
/**
 * @swagger
 * /api/resolution/:
 *   get:
 *     summary: Get All Resolution
 *     tags: [Resolution]
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
router.get("/all", resolution.findAllResolution);

router.get("/findAllBalloting", resolution.findAllBallotingResolutions);
router.put("/resolutionsBalloting/status", resolution.updateResolutionsStatus);


router.post("/pdfResolutionList", resolution.pdfResolutionList);

router.get("/resolutionsByStatus", resolution.getResolutionsByStatus);

// Retrieve all Resolutions
/**
 * @swagger
 * /api/resolution/inNotice:
 *   get:
 *     summary: Get All Resolution In Notice
 *     tags: [Resolution]
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
router.get("/inNotice", resolution.findAllResolutionInNotice);

// Get All Resolution Statuses
/**
* @swagger
* /api/resolution/resolutionStatuses:
*   get:
*     summary: Get All Resolution Statuses
*     tags: [Resolution]
*     security:
*       - bearerAuth: []
*     responses:
*       '200':
*         description: A successful response
*/
router.get("/resolutionStatuses", resolution.getResolutionStatuses)

// Update Resolution
/**
 * @swagger
 * /api/resolution/update/{id}:
 *   put:
 *     summary: Get Updated Resolution
 *     tags: [Resolution]
 *     requestBody:
 *       required: true
 *       content:
 *          multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               resolutionType:
 *                 type: string
 *                 description: Resolution Type
 *               englishText:
 *                 type: string
 *                 description: english Text
 *               colourResNo:
 *                 type: string
 *                 description: colourRes No
 *               urduText:
 *                 type: string
 *                 description: urdu Text
 *               resolutionDiaryNo:
 *                 type: integer
 *               fkResolutionStatus:
 *                 type: string
 *                 description: fkResolution Status
 *               noticeOfficeDiaryDate:
 *                 type: string
 *                 description: Notice Office Diary Date    
 *               noticeOfficeDiaryTime:
 *                 type: string
 *                 description: Notice Office Diary Time
 *               dateOfMovingHouse:
 *                 type: string
 *                 description: Date Of Moving House
 *               dateOfDiscussion:
 *                 type: string
 *                 description: Date Of Discussion
 *               dateOfPassing:
 *                 type: string
 *                 description: Date Of Passing
 *               attachment:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: The file to be attached
 *               resolutionMovers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     fkMemberId:
 *                       type: integer
 *                       description: Member ID 
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Resolution ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put("/update/:id", uploadFile("resolution"), resolution.updateResolution);

//Get Single Resolution
/**
 * @swagger
 * /api/resolution/{id}:
 *   get:
 *     summary: Get Single Resolution
 *     tags: [Resolution]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Resolution ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/:id", resolution.findSingleResolution);



//Sent To Transaltion Branch From Resolution Branch
/**
 * @swagger
 * /api/resolution/sendTranslation/{id}:
 *   put:
 *     summary: Sent To Transaltion Branch From Resolution Branch
 *     tags: [Resolution]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Resolution ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put("/sendTranslation/:id", resolution.sendTranslation);

//Sent To Resolution Branch From Notice Branch
/**
 * @swagger
 * /api/resolution/sendToResolution/{id}:
 *   put:
 *     summary: Send To Resolution Branch From Notice Branch
 *     tags: [Resolution]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Resolution ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resolutionSentDate:
 *                 type: string 
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put("/sendToResolution/:id", resolution.sendToResolution);

//Delete Resolution
/**
 * @swagger
 * /api/resolution/delete/{id}:
 *   delete:
 *     summary: Delete Resolution
 *     tags: [Resolution]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Resolution ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put("/delete/:id", resolution.deleteResolution);


router.delete("/reActive/:id", resolution.reActiveResolution);

module.exports = router