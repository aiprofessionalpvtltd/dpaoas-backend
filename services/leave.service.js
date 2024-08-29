const db = require("../models");
const requestLeaves = db.requestLeaves;
const leaveComments = db.leaveComments;
const Departments = db.Departments;
const typeLeave = db.leaveTypes;
const employees = db.employees;
const Op = db.Sequelize.Op;
const logger = require('../common/winston');

const leaveService = {
    // Create A New Role
    createleave: async (req) => {
        try {
            let { fkRequestTypeId, fkUserId, requestStartDate, requestEndDate, requestStatus, requestLeaveSubType, requestLeaveReason,
                requestNumberOfDays, requestStationLeave, requestLeaveAttachment,
                requestLeaveSubmittedTo, requestLeaveApplyOnBehalf, requestLeaveForwarder, leave_oneday, web_id } = req;

            const leaveRequest = await requestLeaves.create({
                fkRequestTypeId,
                fkUserId,
                requestStartDate,
                requestEndDate,
                requestStatus,
                requestLeaveSubType,
                requestLeaveReason,
                requestNumberOfDays,
                requestStationLeave,
                requestLeaveAttachment,
                requestLeaveSubmittedTo,
                requestLeaveApplyOnBehalf,
                requestLeaveForwarder,
                leave_oneday,
                web_id
            });

            return leaveRequest;
        } catch (error) {
            console.error('Error creating leave request:', error);
            throw error; // or handle the error in a way that makes sense for your application
        }
    },

    updateleave: async (id, payload) => {
        try {
            let { fkRequestTypeId, fkUserId, requestStartDate, requestEndDate, requestStatus, requestLeaveSubType, requestLeaveReason,
                requestNumberOfDays, requestStationLeave, requestLeaveAttachment,
                requestLeaveSubmittedTo, requestLeaveApplyOnBehalf, requestLeaveForwarder, leaveComment, commentedBy, leave_oneday } = payload;

            const result = await requestLeaves.update(
                {
                    fkRequestTypeId,
                    fkUserId,
                    requestStartDate,
                    requestEndDate,
                    requestStatus,
                    requestLeaveSubType,
                    requestLeaveReason,
                    requestNumberOfDays,
                    requestStationLeave,
                    requestLeaveAttachment,
                    requestLeaveSubmittedTo,
                    requestLeaveApplyOnBehalf,
                    requestLeaveForwarder,
                    leave_oneday
                },
                {
                    where: { id: id } // Add the WHERE condition to filter by id
                }
            );
            if (result > 0) {
                const comment = await leaveComments.create({
                    leaveComment,
                    fkRequestLeaveId: id,
                    commentedBy,
                });
                return comment;
            } else {
                console.log('No rows were updated. Check if the record with the provided ID exists')
            }
        } catch (error) {
            console.error('Error updating leave request:', error.message);
        }
    },
    getAllLeave: async (pageSize, offset) => {
        try {
            // Run the main query
            const result = await db.sequelize.query(`
                WITH leaveData AS (
                    SELECT 
                        "requestLeaves".*,
                        "leaveTypes"."leaveType" AS "leaveTypeName",
                        "employees"."id" AS "employees.id",
                        "employees"."firstName" AS "employees.firstName",
                        "employees"."lastName" AS "employees.lastName",
                        "employees"."phoneNo" AS "employees.phoneNo",
                        "leaveOf"."firstName" AS "leavesubmittedTofirstName",
                        "leaveOf"."lastName" AS "leavesubmittedTolastName",
                        "members"."memberName" AS "memberName"
                    FROM 
                        "requestLeaves"
                    LEFT JOIN 
                        "employees" ON "requestLeaves"."fkUserId" = "employees"."id"
                    LEFT JOIN
                        "employees" AS "leaveOf" ON "requestLeaves"."requestLeaveSubmittedTo"::integer = "leaveOf"."id"
                    LEFT JOIN
                        "leaveTypes" ON "requestLeaves"."fkRequestTypeId" = "leaveTypes"."id"
                    LEFT JOIN 
                        "members" ON "requestLeaves"."web_id" = "members"."id"
                    ORDER BY 
                        "requestLeaves"."createdAt" DESC
                )
                SELECT 
                    (SELECT COUNT(*) FROM leaveData) AS totalCount,
                    leaveData.*
                FROM 
                    leaveData
                LIMIT :limit
                OFFSET :offset
            `, {
                type: db.sequelize.QueryTypes.SELECT,
                replacements: { limit: parseInt(pageSize), offset: offset },
            });
    
            // Extract the total count from the first record
            const totalCount = result.length > 0 ? result[0].totalcount : 0;
    
            // Create a new array excluding the totalCount from each record
            const leaves = result.map(record => {
                const { totalcount, ...leaveData } = record;
                return leaveData;
            });
    
            // Return the total count separately along with the leaves array
            return {
                totalCount: parseInt(totalCount),  // Ensure totalCount is returned as a number
                leaves,
            };
    
        } catch (error) {
            console.error('Error fetching leave request:', error.message);
            throw error;
        }
    },    
    getLeaveById: async (id) => {
        try {
            console.log("herer");
            const result = await db.sequelize.query(`
                    SELECT 
                        "requestLeaves".*,
                        "leaveOf"."firstName" AS "leavesubmittedTofirstName",
                        "leaveOf"."lastName" AS "leavesubmittedTolastName",
                        ARRAY_AGG(
                            json_build_object(
                                'leaveCommentId', "leaveComments"."id",
                                'leaveComment', "leaveComments"."leaveComment",
                                'commentedById', "leaveComments"."commentedBy", -- include the commentedBy ID
                                'commentedByName', "commentingEmployee"."firstName" -- include the commentedBy first name
                            )
                        ) AS "comments",
                        "employees"."id" AS "userId",
                        "employees"."firstName" AS "RequesterNamefirstName",
                        "employees"."lastName" AS "RequesterNamelastName"
                    FROM 
                        "requestLeaves"
                    LEFT JOIN 
                        "leaveComments" ON "requestLeaves"."id" = "leaveComments"."fkRequestLeaveId"
                    LEFT JOIN 
                        "employees" ON "requestLeaves"."fkUserId" = "employees"."id" 
                    LEFT JOIN
                        "employees" AS "leaveOf" ON "requestLeaves"."requestLeaveSubmittedTo"::integer = "leaveOf"."id"
                    LEFT JOIN
                        "employees" AS "commentingEmployee" ON "leaveComments"."commentedBy" = "commentingEmployee"."id" -- new join
                    WHERE 
                        "requestLeaves"."id" = :id
                    GROUP BY
                        "requestLeaves"."id",
                        "employees"."id",
                        "leaveOf"."firstName",
                        "leaveOf"."lastName"
                `, {
                type: db.sequelize.QueryTypes.SELECT,
                replacements: { id: id },
            });

            return result
        } catch (error) {
            console.error('Error Fetching leave request:', error.message);
        }
    },
    findAllLeaveByWebId: async (web_id) => {
        try {
            const result = await db.sequelize.query(`
                SELECT 
                    "requestLeaves".*,
                    "leaveOf"."firstName" AS "leavesubmittedTofirstName",
                    "leaveOf"."lastName" AS "leavesubmittedTolastName",
                    ARRAY_AGG(
                        json_build_object(
                            'leaveCommentId', "leaveComments"."id",
                            'leaveComment', "leaveComments"."leaveComment",
                            'commentedById', "leaveComments"."commentedBy",
                            'commentedByName', "commentingEmployee"."firstName"
                        )
                    ) AS "comments",
                    "employees"."id" AS "userId",
                    "employees"."firstName" AS "RequesterNamefirstName",
                    "employees"."lastName" AS "RequesterNamelastName",
                    "leaveTypes"."leaveType" AS "requestLeaveTypeName"
                FROM 
                    "requestLeaves"
                LEFT JOIN 
                    "leaveComments" ON "requestLeaves"."id" = "leaveComments"."fkRequestLeaveId"
                LEFT JOIN 
                    "employees" ON "requestLeaves"."fkUserId" = "employees"."id" 
                LEFT JOIN
                    "employees" AS "leaveOf" ON "requestLeaves"."requestLeaveSubmittedTo"::integer = "leaveOf"."id"
                LEFT JOIN
                    "employees" AS "commentingEmployee" ON "leaveComments"."commentedBy" = "commentingEmployee"."id"
                LEFT JOIN
                    "leaveTypes" ON "requestLeaves"."fkRequestTypeId" = "leaveTypes"."id"    
                WHERE 
                    "requestLeaves"."web_id" = :web_id
                GROUP BY
                    "requestLeaves"."id",
                    "employees"."id",
                    "leaveOf"."firstName",
                    "leaveOf"."lastName",
                    "leaveTypes"."leaveType"
                ORDER BY
                    "requestLeaves"."createdAt" DESC
            `, {
                type: db.sequelize.QueryTypes.SELECT,
                replacements: { web_id: web_id },
            });

            console.log("result---->>", result)

            return result;
        } catch (error) {
            console.error('Error Fetching leave request:', error.message);
            throw error; // Re-throwing the error to handle it further up the call stack if needed
        }
    },
    getLeaveTypes: async (id) => {
        try {
            const result = await typeLeave.findAll({
                where: {
                    leaveStatus: 'active',
                },
            });
            return result
        } catch (error) {
            console.error('Error Fetching leave Type:', error.message);
        }
    },
    search: async (req) => {
        try {
            const { employeeName, startDate, endDate, departmentName } = req;
            let whereConditions = '';

            if (employeeName) {
                whereConditions += `"employees"."id" = ${employeeName}`;
            }

            if (departmentName) {
                if (whereConditions) {
                    whereConditions += ' AND ';
                }
                whereConditions += `"employees"."fkDepartmentId" = ${departmentName}`;
            }

            if (startDate && endDate) {
                if (whereConditions) {
                    whereConditions += ' AND ';
                }
                const startOfDay = `${startDate}T00:00:00.000Z`;
                const endOfDay = `${endDate}T23:59:59.999Z`;

                whereConditions += `"requestLeaves"."requestStartDate" >= '${startOfDay}' AND "requestLeaves"."requestStartDate" <= '${endOfDay}'`;
            }

            // Use whereConditions in your main query
            const result = await db.sequelize.query(`
                            SELECT 
                                "requestLeaves"."requestStartDate",
                                "requestLeaves"."requestEndDate",
                                "requestLeaves"."requestLeaveReason",
                                "requestLeaves"."requestLeaveSubType",
                                "requestLeaves"."requestStatus",
                                "requestLeaves"."requestLeaveAttachment",
                                "requestLeaves"."requestLeaveSubmittedTo",
                                "leaveOf"."profileImage" AS "leavesubmittedImage",
                                "leaveOf"."firstName" AS "leavesubmittedTofirstName",
                                "leaveOf"."lastName" AS "leavesubmittedTolastName",
                                "employees"."id" AS "userId",
                                "employees"."profileImage" AS "userImage",
                                "employees"."firstName" AS "userfirstName",
                                "employees"."lastName" AS "userlastName",
                                "departments"."id" AS "departmentId",
                                "departments"."departmentName" AS "departmentName"
                            FROM 
                                "requestLeaves"
                            INNER JOIN 
                                "employees" ON "requestLeaves"."fkUserId" = "employees"."id"
                            LEFT JOIN
                                public."employees" AS "leaveOf" ON "requestLeaves"."requestLeaveSubmittedTo"::integer = "leaveOf"."id"
                            LEFT JOIN 
                                "departments" ON "employees"."fkDepartmentId" = "departments"."id"
                                ${whereConditions ? `WHERE ${whereConditions}` : ''}
                            `, {
                type: db.sequelize.QueryTypes.SELECT,
                raw: true,
            });
            return result;
        } catch (error) {
            console.error('Error Fetching leave Type:', error.message);
        }
    },


    getAllLeavesOfUser: async (id, pageSize, offset) => {
        try {
            const query = `
                    SELECT 
                    "leave".*,
                    "employee"."firstName" AS "leavefirstName",
                    "employee"."lastName" AS "leavelastName",
                    "leaveOf"."id" AS "leaveOfId",
                    "leaveOf"."firstName" AS "leavesubmittedTofirstName",
                    "leaveOf"."lastName" AS "leavesubmittedTolastName"
                    FROM 
                    public."requestLeaves" AS "leave"
                    JOIN 
                    public."employees" AS "employee" ON "leave"."fkUserId" = "employee"."id"
                    LEFT JOIN
                    public."employees" AS "leaveOf" ON "leave"."requestLeaveSubmittedTo"::integer = "leaveOf"."id"
                    WHERE 
                    "leave"."fkUserId" = :id OR "employee".supervisor = :id
                        LIMIT :limit
                        OFFSET :offset
                        `;

            const replacements = {
                id: id,
                limit: parseInt(pageSize),
                offset: offset,
            };
            const leaves = await db.sequelize.query(query, {
                replacements: replacements,
                type: db.sequelize.QueryTypes.SELECT,
            });

            return leaves
        } catch (error) {
            console.error('Error Fetching leave request:', error.message);
        }
    },

}

module.exports = leaveService
