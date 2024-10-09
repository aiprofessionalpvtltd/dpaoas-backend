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
        const transaction = await db.sequelize.transaction();
        try {
            let { fkRequestTypeId, fkUserId, fkMemberId, fkSessionId, applicationDate, subject, requestStartDate, requestEndDate, requestStatus, requestLeaveSubType, requestLeaveReason,
                requestNumberOfDays, requestStationLeave, requestLeaveAttachment,
                requestLeaveSubmittedTo, requestLeaveApplyOnBehalf, requestLeaveForwarder, leave_oneday, web_id, leaveComment, device } = req;

            const leaveRequest = await requestLeaves.create({
                fkRequestTypeId,
                fkUserId,
                fkMemberId, 
                fkSessionId, 
                applicationDate, 
                subject,
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
                web_id,
                device
            }, { transaction });

              // If leaveComment is provided, create an entry in the leaveComments table
        if (leaveComment) {
            await leaveComments.create({
                leaveComment,  
                fkRequestLeaveId: leaveRequest.id, // Reference to the newly created leave request
                commentedBy: fkUserId 
            }, { transaction });
        }

        await transaction.commit(); // Commit transaction if everything is successful
        return leaveRequest;

        } catch (error) {
            await transaction.rollback();
            console.error('Error creating leave request:', error);
            throw error; // or handle the error in a way that makes sense for your application
        }
    },

    updateleave: async (id, payload) => {
        const transaction = await db.sequelize.transaction(); // Start a transaction
        try {
            let {
                fkRequestTypeId, fkUserId, fkMemberId, fkSessionId, applicationDate, subject,
                requestStartDate, requestEndDate, requestStatus, requestLeaveSubType,
                requestLeaveReason, requestNumberOfDays, requestStationLeave, requestLeaveAttachment,
                requestLeaveSubmittedTo, requestLeaveApplyOnBehalf, requestLeaveForwarder, leaveComment, commentedBy, leave_oneday
            } = payload;
    
            // Check if both requestStartDate and requestEndDate are provided, and leave_oneday has a value
            if (requestStartDate && requestEndDate && leave_oneday !== null) {
                // Clear leave_oneday if both start and end dates are being provided
                leave_oneday = null;
            }
    
            // Check if leave_oneday is provided and both requestStartDate and requestEndDate have values
            if (leave_oneday && (requestStartDate !== null || requestEndDate !== null)) {
                // Clear requestStartDate and requestEndDate if leave_oneday is being provided
                requestStartDate = null;
                requestEndDate = null;
            }
    
            const result = await requestLeaves.update(
                {
                    fkRequestTypeId,
                    fkUserId,
                    fkMemberId,
                    fkSessionId,
                    applicationDate,
                    subject,
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
                },
                { transaction }
            );
    
            // Check if the leave request update was successful
            if (result > 0) {
                // If a comment is provided, handle it
                if (leaveComment) {
                    // Check if a comment already exists for this leave request
                    const existingComment = await leaveComments.findOne({
                        where: { fkRequestLeaveId: id }, // Check for comments related to the leave request
                    });
    
                    if (existingComment) {
                        // Update the comment if it exists
                        await leaveComments.update(
                            {
                                leaveComment,
                                commentedBy // Update who commented it
                            },
                            {
                                where: { fkRequestLeaveId: id },
                            },
                            { transaction }
                        );
                    } else {
                        // Create a new comment if none exists
                        await leaveComments.create({
                            leaveComment,
                            fkRequestLeaveId: id, // Link to the leave request
                            commentedBy // Store the user who made the comment
                        }, { transaction });
                    }
                }
    
                await transaction.commit(); // Commit the transaction if everything is successful
                return { message: 'Leave request and comment updated successfully' };
            } else {
                console.log('No rows were updated. Check if the record with the provided ID exists');
                await transaction.rollback(); // Rollback the transaction if no update occurred
                return { message: 'No leave request found for the provided ID' };
            }
        } catch (error) {
            await transaction.rollback(); // Rollback transaction in case of error
            console.error('Error updating leave request:', error.message);
            throw error;
        }
    },
    
    
    getAllLeave: async (pageSize, offset) => {
        try {
            const result = await db.sequelize.query(`
                WITH leaveData AS (
                    SELECT 
                        rl.*,
                        lt."leaveType" AS "leaveTypeName",
                        emp."id" AS "employees.id",
                        emp."firstName" AS "employees.firstName",
                        emp."lastName" AS "employees.lastName",
                        emp."phoneNo" AS "employees.phoneNo",
                        lof."firstName" AS "leavesubmittedTofirstName",
                        lof."lastName" AS "leavesubmittedTolastName",
                        mem."memberName" AS "memberName", 
                        ses."sessionName" AS "sessionName",
                        lc."leaveComment" AS "leaveComment" -- Corrected column name
                    FROM 
                        "requestLeaves" rl
                    LEFT JOIN 
                        "employees" emp ON rl."fkUserId" = emp."id"
                    LEFT JOIN
                        "employees" lof ON rl."requestLeaveSubmittedTo"::integer = lof."id"
                    LEFT JOIN
                        "leaveTypes" lt ON rl."fkRequestTypeId" = lt."id"
                    LEFT JOIN 
                        "members" mem ON rl."fkMemberId" = mem."id"
                    LEFT JOIN 
                        "sessions" ses ON rl."fkSessionId" = ses."id"
                    LEFT JOIN
                        "leaveComments" lc ON lc."fkRequestLeaveId" = rl."id"
                    ORDER BY 
                        rl."createdAt" DESC
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
    
            const totalCount = result.length > 0 ? result[0].totalcount : 0;
    
            const leaves = result.map(record => {
                const { totalcount, ...leaveData } = record;
                return leaveData;
            });
    
            return {
                totalCount: parseInt(totalCount),
                leaves,
            };
    
        } catch (error) {
            console.error('Error fetching leave request:', error.message);
            throw error;
        }
    },
    
        
    getLeaveById: async (id) => {
        try {
            const result = await db.sequelize.query(`
                SELECT 
                    "requestLeaves".id,
                    json_build_object(
                        'id', "requestLeaves"."fkMemberId",
                        'name', "members"."memberName"
                    ) AS "member",
                    json_build_object(
                        'id', "requestLeaves"."fkSessionId",
                        'name', "sessions"."sessionName"
                    ) AS "session",
                    "requestLeaves"."applicationDate",
                    "requestLeaves"."subject",
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
                    "requestLeaves"."requestStartDate",        
                    "requestLeaves"."requestEndDate",          
                    "requestLeaves"."requestLeaveReason",      
                    "requestLeaves"."leave_oneday",            
                    "requestLeaves"."web_id",                  
                    "requestLeaves"."device",   
                    "requestLeaves"."requestStatus",               
                    "requestLeaves"."file"         
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
                    "members" ON "requestLeaves"."fkMemberId" = "members"."id"
                LEFT JOIN 
                    "sessions" ON "requestLeaves"."fkSessionId" = "sessions"."id"
                WHERE 
                    "requestLeaves"."id" = :id
                GROUP BY
                    "requestLeaves"."id",
                    "employees"."id",
                    "leaveOf"."firstName",
                    "leaveOf"."lastName",
                    "members"."memberName",
                    "sessions"."sessionName"
            `, {
                type: db.sequelize.QueryTypes.SELECT,
                replacements: { id: id },
            });
    
            return result;
        } catch (error) {
            console.error('Error Fetching leave request:', error.message);
            throw error;
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
