const leaveService = require("../services/leave.service")
const logger = require('../common/winston');
const multer = require('multer');
const upload = multer();
const { uploadFile } = require('../common/upload')
const {
    validationErrorResponse,
    notFoundResponse,
    unAuthorizedResponse,
} = require('../common/validation-responses')
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
        const result = await leaveService.getAllLeave(pageSize, offset);
        console.log("Result", result);
        return res.status(200).send({
            success: true,
            message: `All leave information fetched successfully`,
            data: result,
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
        const result = await leaveService.getAllLeavesOfUser(id, pageSize, offset);
        console.log("Result", result);
        return res.status(200).send({
            success: true,
            message: `All leave information fetched successfully`,
            data: result,
        })
    },

    // Creates A New User
    createleave: async (req, res) => {
        try {

            const { body, file } = req

            logger.info(`LeaveController: createleave body ${JSON.stringify(body)}`)
            const result = await leaveService.createleave(body);
            if (result) {
                // const filePath = uploadFile("leave", result.dataValues.id, file);
                // const attachment = await requestLeaves.update(
                //     { file: filePath },
                //     { where: { id: result.dataValues.id } }
                // );
            }
            logger.info('Leave Request submitted Successfully!');
            return res.status(201).send({
                success: true,
                message: `Submitted`,
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
            const { body, params } = req
            const { id } = params
            logger.info(
                `LeaveController: updateLeaveRequest id ${id} and body ${JSON.stringify(
                    body,
                )}`,
            )
            const result = await leaveService.updateleave(id, body);
            if (result) {
                logger.info('Leave Request Updated Successfully!');
                return res.status(201).send({
                    success: true,
                    message: `Leave request updated successfully`,
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
            message: `Leave fetched successfully`,
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

