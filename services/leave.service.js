const db = require("../models");
const requestLeaves = db.requestLeaves;
const leaveComments = db.leaveComments;
const Users = db.users;
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
            console.log("fkRequestTypeId", payload)
            let { fkRequestTypeId, fkUserId, requestStartDate, requestEndDate, requestStatus, requestLeaveSubType, requestLeaveReason,
                requestNumberOfDays, requestStationLeave, requestLeaveAttachment,
                requestLeaveSubmittedTo, requestLeaveApplyOnBehalf, requestLeaveForwarder, leaveComment, commentedBy } = payload;

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
                    requestLeaveForwarder
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
            const leaves = await requestLeaves.findAll({
                raw: true,
                include: [
                    {
                        model: Users,
                        as: 'users',
                        attributes: ['id', ['name', 'name'], 'phoneNo', 'email'],
                        // attributes: ['id', 'name', 'phoneNo', 'email'],
                    },
                ],
                limit: parseInt(pageSize),
                offset: offset,
            });

            return leaves
        } catch (error) {
            console.error('Error Fetching leave request:', error.message);
        }
    },
    getLeaveById: async (id) => {
        try {
            const result = await requestLeaves.findOne({
                raw: false,
                where: {
                  id: id,
                },
                include: [
                  {
                    model: db.leaveComments,
                    as: 'leaveComments',
                    include: [
                      {
                        model: db.users,
                        as: 'users',
                      },
                    ],
                  },
                ],
              });
            return result
        } catch (error) {
            console.error('Error Fetching leave request:', error.message);
        }
    },




}

module.exports = leaveService