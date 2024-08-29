const leaveService = require("../services/leave.service")
const logger = require('../common/winston');
const { uploadFile } = require('../common/upload')
const db = require("../models");
const requestLeaves = db.requestLeaves;
const {
    validationErrorResponse,
    notFoundResponse,
    unAuthorizedResponse,
} = require('../common/validation-responses');
const { Console } = require("winston/lib/winston/transports");
const { log } = require("winston");
const leaveController = {
    // Leave Listing
    getAllLeaves: async (req, res) => {
        // const page = req.query.page;
        // const pageSize = req.query.pageSize;
        const { query } = req
        const { page, pageSize } = query
        const offset = page * pageSize;
        logger.info(`LeaveController: getAllLeaves query ${JSON.stringify(query)}`)
        let sort = req.query.sort;
        let orderType = req.query.order;
        if (orderType == "ascend") {
            orderType = "ASC";
        }
        else {
            orderType = "DESC";
        }
        const { totalCount, leaves } = await leaveService.getAllLeave(pageSize, offset);
        // console.log("Result", result);
        return res.status(200).send({
            success: true,
            message: `All Leave Information fetched successfully`,
            data: leaves,
            totalCount,
        })
    },
    getAllLeavesOfUser: async (req, res) => {
        // const page = req.query.page;
        // const pageSize = req.query.pageSize;
        const { query } = req
        const { page, pageSize } = query
        const { id } = req.params;
        const offset = page * pageSize;
        logger.info(`LeaveController: getAllLeavesOfUser query ${JSON.stringify(query)}`)
        let sort = req.query.sort;
        let orderType = req.query.order;
        if (orderType == "ascend") {
            orderType = "ASC";
        }
        else {
            orderType = "DESC";
        }
        const count = await requestLeaves.findAll();
        console.log("count", count.length)
        const counts = count.length;
        const result = await leaveService.getAllLeavesOfUser(id, pageSize, offset);
        return res.status(200).send({
            success: true,
            message: `All Leave Information fetched successfully`,
            data: { result, counts },
        })
    },
  // Retrieve all All Leave by web_id
    findAllLeaveByWebId: async (req, res) => {
        try {
            logger.info(`req.query.web_id--- ${req.query.web_id}`);
            const webId = req.query.web_id;
            const result = await leaveService.findAllLeaveByWebId(webId);
            logger.info("All Leave Information Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "All Leave Information Fetched Successfully!",
                data: { result },
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Creates A New User
    createleave: async (req, res) => {
        try {
            const { body, file } = req
            logger.info(`LeaveController: createleave body ${JSON.stringify(body)}`)
            const result = await leaveService.createleave(body);
            if (result && file) {
                const path = file.destination.replace('./public/', '/public/')
                try {
                    // Your code to update the database
                    await requestLeaves.update(
                        {
                            file: `${path}/${file.originalname}`,
                        },
                        {
                            where: { id: result.dataValues.id }
                        }
                    );
                } catch (error) {
                    console.error("Error updating attachment:", error);
                }
            }
            logger.info('Leave Request submitted Successfully!');
            return res.status(201).send({
                success: true,
                message: `Leave Request submitted successfully`,
                data: result.dataValues,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message,

            })
        }
    },
// Update User
    updateleave: async (req, res) => {
        try {
            const { body, params, file } = req
            const { id } = params
            logger.info(
                `LeaveController: updateLeaveRequest id ${id} and body ${JSON.stringify(
                    body,
                )}`,
            )
            const result = await leaveService.updateleave(id, body);
            if (result) {
                if (file) {
                    const path = file.destination.replace('./public/', '/public/')
                    try {
                        // Your code to update the database
                        await requestLeaves.update(
                            {
                                file: `${path}/${file.originalname}`,
                            },
                            {
                                where: { id: id }
                            }
                        );
                    } catch (error) {
                        console.error("Error updating attachment:", error);
                    }
                }
                logger.info('Leave Request Updated Successfully!');
                return res.status(201).send({
                    success: true,
                    message: `Leave Request Updated successfully`,
                    data: { ...body },
                })
            } else {
                return res.status(400).send({
                    success: false,
                    message: 'No rows were updated. Check if the record with the provided ID exists',
                });
            }
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message,
            })
        }
    },

    getLeaveById: async (req, res) => {
        const { params } = req
        const { id } = params
        logger.info(`LeaveController: getLeaveById ${id}`)
        const leaveRecord = await leaveService.getLeaveById(id)
        const transformedResult = leaveRecord.map(row => {
            return {
                ...row,
                comments: row.comments[0].leaveCommentId === null ? [] : row.comments,
            };
        });

        return res.status(200).send({
            success: true,
            message: `Leave fetched successfully for id ${id}`,
            data: transformedResult,
        })
    },
//Get Leave Types
    getLeaveTypes: async (req, res) => {
        logger.info(`LeaveControllers: getLeaveTypes`);
        const result = await leaveService.getLeaveTypes();
        return res.status(200).send({
            success: true,
            message: 'Leave types fetched successfully',
            data: result,
        });
    },
    //Get Leave Types
    search: async (req, res) => {
        const { query } = req

        logger.info(`LeaveControllers: search`);
        const result = await leaveService.search(query);
        return res.status(200).send({
            success: true,
            message: 'Leave types fetched successfully',
            data: result,
        });
    },
}
module.exports = leaveController;