const express = require('express');
const router = express.Router();
const manageSession = require('../controllers/manageSession.controller');

// Get Prorogued Sessions
/**
 * @swagger
 * /api/manageSession/proroguedSessions:
 *   get:
 *     summary: Get Prorogued Sessions
 *     tags: [Manage Session Days]
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
router.get("/proroguedSessions", manageSession.getProroguedSessions)

// Get Chairman, Deputy Chairman and Presiding Officer
/**
 * @swagger
 * /api/manageSession/getTop3Members:
 *   get:
 *     summary: Get Chairman, Deputy Chairman and Presiding Officer
 *     tags: [Manage Session Days]
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/getTop3Members", manageSession.getTop3Members)

// Mark/Update Session Sitting Attendance To Leave
/**
* @swagger
* /api/manageSession/markAttendanceToLeave:
*   post:
*     summary: Mark/Update Session Sitting Attendance To Leave
*     tags: [Manage Session Days]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: query
*         name: startDay
*         description: Start Day For The Session
*         schema:
*           type: string
*       - in: query
*         name: endDay
*         schema:
*           type: string
*         description: End Day For The Session
*       - in: query
*         name: sessionId
*         description: Session ID
*         schema:
*           type: integer
*       - in: query
*         name: sittingId
*         schema:
*           type: integer
*         description: Sitting ID
*       - in: query
*         name: memberId
*         description: Member ID
*         schema:
*           type: integer
*       - in: query
*         name: attendanceStatus
*         schema:
*           type: string
*         description: Attendance Status
*     responses:
*       '200':
*         description: A successful response
*/
router.post("/markAttendanceToLeave", manageSession.markSessionSittingAttendanceToLeave)


// Get Attendance Record
/**
* @swagger
* /api/manageSession/getAttendance:
*   get:
*     summary: Get Attendance Record
*     tags: [Manage Session Days]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: query
*         name: startDay
*         description: Start Day of the week
*         schema:
*           type: string
*       - in: query
*         name: endDay
*         schema:
*           type: string
*         description: End Day of the week
*       - in: query
*         name: month
*         description: Month
*         schema:
*           type: integer
*       - in: query
*         name: year
*         schema:
*           type: integer
*         description: Year
*       - in: query
*         name: threeYears
*         schema:
*           type: integer
*         description: Upto 3 years
*     responses:
*       '200':
*         description: A successful response
*/
router.get("/getAttendance",manageSession.getAttendanceRecord)


// Get Attendance Record By Session Sittings
/**
* @swagger
* /api/manageSession/getAttendanceBySittings:
*   get:
*     summary: Get Attendance Record By Session Sittings
*     tags: [Manage Session Days]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: query
*         name: sessionId
*         description: Session Id
*         schema:
*           type: integer
*       - in: query
*         name: manageSessionId
*         schema:
*           type: integer
*         description: Session Sitting Id
*       - in: query
*         name: partyName
*         description: Party Name
*         schema:
*           type: integer
*       - in: query
*         name: province
*         schema:
*           type: string
*         description: Province Name
*       - in: query
*         name: memberName
*         schema:
*           type: integer
*         description: Member Name
*     responses:
*       '200':
*         description: A successful response
*/
router.get("/getAttendanceBySittings",manageSession.getAttendanceRecordByMemberName)
// Weekly Attendance Record
// /**
// * @swagger
// * /api/manageSession/getWeeklyAttendanceRecord:
// *   get:
// *     summary: Get Weekly Attendance Record
// *     tags: [Manage Session Days]
// *     security:
// *       - bearerAuth: []
// *     parameters:
// *       - in: query
// *         name: startDay
// *         description: Start Day of the week
// *         schema:
// *           type: string
// *       - in: query
// *         name: endDay
// *         schema:
// *           type: string
// *         description: End Day of the week
// *       - in: query
// *         name: partyName
// *         schema:
// *           type: integer
// *         description: Party Name
// *     responses:
// *       '200':
// *         description: A successful response
// */
// router.get("/getWeeklyAttendanceRecord", manageSession.getWeeklyAttendanceRecord)


// Weekly Attendance Record
/**
* @swagger
* /api/manageSession/getPartyWise/{id}:
*   get:
*     summary: Get Party Wise Attendance Record
*     tags: [Manage Session Days]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: integer
*         description: Session Sitting Id
*       - in: query
*         name: partyName
*         schema:
*           type: integer
*         description: Party Name
*     responses:
*       '200':
*         description: A successful response
*/
router.get("/getPartyWise/:id", manageSession.getSessionSittingAttendanceBySingleParty)
// Monthly Attendance Record
// /**
// * @swagger
// * /api/manageSession/getMonthlyAttendanceRecord:
// *   get:
// *     summary: Get Monthly Attendance Record
// *     tags: [Manage Session Days]
// *     security:
// *       - bearerAuth: []
// *     parameters:
// *       - in: query
// *         name: month
// *         description: Month
// *         schema:
// *           type: integer
// *       - in: query
// *         name: year
// *         schema:
// *           type: integer
// *         description: Year
// *       - in: query
// *         name: partyName
// *         schema:
// *           type: integer
// *         description: Party Name
// *     responses:
// *       '200':
// *         description: A successful response
// */
// router.get("/getMonthlyAttendanceRecord", manageSession.getMonthlyAttendanceRecord)

// Yearly Attendance Record
/**
* @swagger
* /api/manageSession/getYearlyAttendanceRecord:
*   get:
*     summary: Get Yearly Attendance Record
*     tags: [Manage Session Days]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: query
*         name: year
*         schema:
*           type: integer
*         description: Year
*       - in: query
*         name: partyName
*         schema:
*           type: integer
*         description: Party Name
*     responses:
*       '200':
*         description: A successful response
*/
router.get("/getYearlyAttendanceRecord", manageSession.getYearlyAttendanceRecord)

// Upto 3 Years Attendance Record
/**
* @swagger
* /api/manageSession/getUpto3YearsAttendanceRecord:
*   get:
*     summary: Get Upto 3 Years Attendance Record
*     tags: [Manage Session Days]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: query
*         name: year
*         schema:
*           type: integer
*         description: Year
*       - in: query
*         name: partyName
*         schema:
*           type: integer
*         description: Party Name
*     responses:
*       '200':
*         description: A successful response
*/
router.get("/getUpto3YearsAttendanceRecord", manageSession.getUpto3YearsAttendanceRecord)

// Create Session Sitting
/**
 * @swagger
 * /api/manageSession/create:
 *   post:
 *     summary: Create a new Session Sitting
 *     tags: [Manage Session Days]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fkSessionId:
 *                 type: integer
 *                 description: The Session Number
 *               sessionAdjourned:
 *                 type: boolean
 *                 description: Is Session Adjourned? True or False
 *               sittingDate:
 *                 type: string
 *                 description: The session sitting date  
 *               sittingStartTime:
 *                 type: string
 *                 description: The session sitting start time
 *               sittingEndTime:
 *                 type: string
 *                 description: The session sitting end time  
 *               committeeWhole: 
 *                 type: boolean
 *               committeeStartTime:
 *                 type: string
 *               committeeEndTime:
 *                 type: string
 *               sessionProrogued:
 *                 type: boolean
 *               privateMemberDay:
 *                 type: boolean 
 *               sessionMembers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     fkMemberId:
 *                       type: integer
 *                     startTime:
 *                       type: string
 *                     endTime: 
 *                       type: string 
 *               sessionBreaks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     breakStartTime:
 *                       type: string
 *                     breakEndTime: 
 *                       type: string    
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/create", manageSession.createSessionSitting)

// Get All Session Sittings
/**
* @swagger
* /api/manageSession/all:
*   get:
*     summary: Get All Session Sittings
*     tags: [Manage Session Days]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: query
*         name: year
*         schema:
*           type: integer
*         description: Year
*     responses:
*       '200':
*         description: A successful response
*/
router.get("/all", manageSession.getAllSessionSittings)

// Get All Session Sittings upto 3 years
/**
* @swagger
* /api/manageSession/upto3Years:
*   get:
*     summary: Get All Session Sittings upto 3 years
*     tags: [Manage Session Days]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: query
*         name: year
*         schema:
*           type: integer
*         description: Year
*     responses:
*       '200':
*         description: A successful response
*/
router.get("/upto3Years", manageSession.getUpto3YearsSessionSittings)


// Get Single Session Sitting
/**
 * @swagger
 * /api/manageSession/{id}:
 *   get:
 *     summary: Get Single Session Sitting
 *     tags: [Manage Session Days]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Session Sitting Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/:id", manageSession.getSingleSessionSitting)

// Update Session Sitting
/**
 * @swagger
 * /api/manageSession/update/{id}:
 *   put:
 *     summary: Update Session Sitting
 *     tags: [Manage Session Days]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fkSessionId:
 *                 type: integer
 *                 description: The Session Number
 *               sessionAdjourned:
 *                 type: boolean
 *                 description: Is Session Adjourned? True or False
 *               sittingDate:
 *                 type: string
 *                 description: The session sitting date  
 *               sittingStartTime:
 *                 type: string
 *                 description: The session sitting start time
 *               sittingEndTime:
 *                 type: string
 *                 description: The session sitting end time  
 *               committeeWhole: 
 *                 type: boolean
 *               committeeStartTime:
 *                 type: string
 *               committeeEndTime:
 *                 type: string
 *               sessionMembers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     fkMemberId:
 *                       type: integer
 *                     startTime:
 *                       type: string
 *                     endTime: 
 *                       type: string  
 *               sessionBreaks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     breakStartTime:
 *                       type: string
 *                     breakEndTime: 
 *                       type: string 
 *     parameters:
 *       - in : path
 *         name: id
 *         required: true
 *         schema: 
 *           type: integer  
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put("/update/:id", manageSession.updateSessionSitting)

// Delete Session Sitting
/**
 * @swagger
 * /api/manageSession/delete/{id}:
 *   delete:
 *     summary: Delete Session Sitting 
 *     tags: [Manage Session Days]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Session Sitting Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.delete("/delete/:id", manageSession.deleteSessionSitting)

// Get Session Sittings By Session Id
/**
 * @swagger
 * /api/manageSession/sessionSittings/{id}:
 *   get:
 *     summary: Get Session Sittings By Session Id
 *     tags: [Manage Session Days]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Session Id
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
router.get("/sessionSittings/:id", manageSession.getSessionSittingsBySessionId)



// Mark/Update Session Sitting Attendance
/**
 * @swagger
 * /api/manageSession/markAttendance/{id}:
 *   post:
 *     summary: Mark/Update Session Sitting Attendance
 *     tags: 
 *       - Manage Session Days
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 fkMemberId:
 *                   type: integer
 *                 attendanceStatus:
 *                   type: string
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Session Sitting Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/markAttendance/:id", manageSession.markSessionSittingAttendance)



// Retrieve Session Sitting Attendance
/**
 * @swagger
 * /api/manageSession/getAttendance/{id}:
 *   get:
 *     summary: Get Single Session Sitting Attendance
 *     tags: [Manage Session Days]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Session Sitting Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/getAttendance/:id", manageSession.getSessionSittingAttendance)

// Retrieve Session Sitting Attendance Province Wise
/**
 * @swagger
 * /api/manageSession/getAttendanceByProvince/{id}:
 *   get:
 *     summary: Get Single Session Sitting Attendance Province Wise
 *     tags: [Manage Session Days]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Session Sitting Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/getAttendanceByProvince/:id", manageSession.getSessionSittingAttendanceByProvince)



// Get Single Session Sitting Attendance By Single Province Wise
/**
* @swagger
* /api/manageSession/getAttendanceBySingleProvince/{id}:
*   get:
*     summary: Get Single Session Sitting Attendance By Single Province Wise
*     tags: [Manage Session Days]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: id
*         required: true
*         description: Session Sitting Id
*         schema:
*           type: integer
*       - in: query
*         name: province
*         schema:
*           type: string
*         description: Province
*     responses:
*       '200':
*         description: A successful response
*/
router.get("/getAttendanceBySingleProvince/:id", manageSession.getSessionSittingAttendanceBySingleProvince)


//

module.exports = router;