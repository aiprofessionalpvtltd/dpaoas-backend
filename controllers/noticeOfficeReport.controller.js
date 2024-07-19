const noticeOfficeReportService = require("../services/noticeOfficeReport.service")
const db = require("../models")
const Sessions = db.sessions
const Motions = db.motions
const Questions = db.questions
const Resolutions = db.resolutions
const logger = require('../common/winston');
const {
    validationErrorResponse,
    notFoundResponse,
    unAuthorizedResponse,
} = require('../common/validation-responses')

const noticeOfficeReportController = {

    // Retrieve Questions, Motions and Resolutions according to Notice Office Diary Date
    getNoticeOfficeReports: async (req, res) => {
        try {
            logger.info(`noticeOfficeReportController: getNoticeOfficeReports query ${JSON.stringify(req.query)}`)
            if (Object.keys(req.query).length !== 0) {
                const searchCriteria = req.query;
                const noticeOfficeResults = await noticeOfficeReportService.getNoticeOfficeReports(searchCriteria);
                const { questions, resolutions, motions } = noticeOfficeResults;
                if (questions.length > 0 || resolutions.length > 0 || motions.length > 0) {
                    logger.info("Notice Office Report Retrieved Successfully!");
                    return res.status(200).send({
                        success: true,
                        message: "Notice Office Report Retrieved Successfully!",
                        data: noticeOfficeResults,
                    });
                } else {
                    logger.info("No Data Found!");
                    return res.status(200).send({
                        success: true,
                        message: "No Data Found!",
                        data: noticeOfficeResults,
                    });
                }
            }
            else {
                logger.info("Please Enter Any Field To Search!");
                return res.status(200).send({
                    success: true,
                    message: "Please Enter Any Field To Search!",
                });
            }
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message,
            });
        }
    },


    // Total And Individual Stats for Questions,Motions and Resoultions
    getNoticeOfficeStats: async (req, res) => {
        try {
            logger.info(`noticeOfficeReportController: getNoticeOfficeStats`)
            const noticeOfficeResults = await noticeOfficeReportService.getNoticeOfficeStats();
            logger.info("Notice Office Stats Retrieved Successfully!");
            return res.status(200).send({
                success: true,
                message: "Notice Office Stats Retrieved Successfully!",
                data: noticeOfficeResults,
            });

        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message,
            });
        }
    },
}


module.exports = noticeOfficeReportController