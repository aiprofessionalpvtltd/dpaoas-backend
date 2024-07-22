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
                requestLeaveSubmittedTo, requestLeaveApplyOnBehalf, requestLeaveForwarder } = req;

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
                requestLeaveForwarder
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
                requestLeaveSubmittedTo, requestLeaveApplyOnBehalf, requestLeaveForwarder, leaveComment, commentedBy, file } = payload;

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
                    requestLeaveForwarder, file
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
            const leaves = await db.sequelize.query(`
                        SELECT 
                            "requestLeaves".*,
                            "employees"."id" AS "employees.id",
                            "employees"."firstName" AS "employees.firstName",
                            "employees"."lastName" AS "employees.lastName",
                            "employees"."phoneNo" AS "employees.phoneNo",
                            "leaveOf"."firstName" AS "leavesubmittedTofirstName",
                            "leaveOf"."lastName" AS "leavesubmittedTolastName"
                        FROM 
                            "requestLeaves"
                        LEFT JOIN 
                            "employees" ON "requestLeaves"."fkUserId" = "employees"."id"
                            LEFT JOIN
                            "employees" AS "leaveOf" ON "requestLeaves"."requestLeaveSubmittedTo"::integer = "leaveOf"."id"
                        LIMIT :limit
                        OFFSET :offset
                    `, {
                type: db.sequelize.QueryTypes.SELECT,
                replacements: { limit: parseInt(pageSize), offset: offset },
            });
            return leaves
        } catch (error) {
            console.error('Error Fetching leave request:', error.message);
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
            const { employeeName, startDate, endDate, departmentName } = req
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
                whereConditions += `"requestLeaves"."createdAt" BETWEEN '${startDate}' AND '${endDate}'`;
            }

            // Use whereConditions in your main query
            const result = await db.sequelize.query(`
                    SELECT 
                        "requestLeaves"."requestStartDate",
                        "requestLeaves"."requestEndDate",
                        "requestLeaves"."requestLeaveReason",
                        "requestLeaves"."requestLeaveSubmittedTo",
                        "leaveOf"."firstName" AS "leavesubmittedTofirstName",
                        "leaveOf"."lastName" AS "leavesubmittedTolastName",
                        "employees"."id" AS "userId",
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