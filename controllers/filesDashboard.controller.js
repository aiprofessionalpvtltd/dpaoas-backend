const filesDashboardService = require("../services/filesDashboard.service")
const db = require("../models")
const Sessions = db.sessions
const Motions = db.motions
const Questions = db.questions
const Resolutions = db.resolutions
const Files = db.newFiles
const logger = require('../common/winston');
const {
    validationErrorResponse,
    notFoundResponse,
    unAuthorizedResponse,
} = require('../common/validation-responses')

const filesDashboardController = {

    // Stats for File In and File Out Stats
    getFilesStats: async (req, res) => {
        try {
            logger.info(`filesDashboardController: getFilesStats`)
            const filesStats = await filesDashboardService.getFilesStats();
            logger.info("File Stats Retrieved Successfully!");
            return res.status(200).send({
                success: true,
                message: "Files Stats Retrieved Successfully!",
                data: filesStats,
            });

        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message,
            });
        }
    },

    // Stats For Sent And Received
    getFileSentAndReceivedStats: async (req,res) => {
        try {
            logger.info(`filesDashboardController: getFileSentAndReceivedStats`)
            const userId = req.params.id
            const filesStats = await filesDashboardService.getFileSentAndReceivedStats(userId);
            logger.info("File Sent and Received Stats Retrieved Successfully!");
            return res.status(200).send({
                success: true,
                message: "Files Sent and Received Stats Retrieved Successfully!",
                data: filesStats,
            });

        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message,
            });
        }
    },

    // Stats For File Approved and Disapproved
    getFileApprovalStats: async(req,res) => {
        try {
            logger.info(`filesDashboardController: getFileApprovalStats`)
            const userId = req.params.id
            const filesStats = await filesDashboardService.getFileApprovalStats(userId);
            logger.info("File Approval Stats Retrieved Successfully!");
            return res.status(200).send({
                success: true,
                message: "Files Approval Stats Retrieved Successfully!",
                data: filesStats,
            });

        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message,
            });
        }
    },

    // Files Pending For Assigned To User
    getFilesPendingCount: async(req,res) => {
        try {
            logger.info(`filesDashboardController: getFilesPendingCount`)
            const userId = req.params.id
            const filesStats = await filesDashboardService.getFilesPendingCount(userId);
            logger.info("File Pending Count Retrieved Successfully!");
            return res.status(200).send({
                success: true,
                message: "Files Pending Count Retrieved Successfully!",
                data: filesStats,
            });

        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message,
            });
        }
    }
}


module.exports = filesDashboardController
