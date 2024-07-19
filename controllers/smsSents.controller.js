const smsSentService = require('../services/smsSents.service');
const logger = require('../common/winston');
const db = require("../models");
const ContactLists = db.contactLists;
const SmsSents = db.smsSents;
const smsSentController = {

    // SMS message sent to the user
    createSmsSent: async (req, res) => {
        try {
            console.log("controller route", req.body)
            const { msgText, RecieverNo, fkUserId, fkListId, isSent } = req.body;
            const smsSent = await smsSentService.createSmsSent(msgText, RecieverNo, fkUserId, fkListId, isSent);
            logger.info("SMS Sent Successfully!");
            return res.status(200).send({
                success: true,
                message: "SMS Sent Successfully!",
                data: smsSent,
            })
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Retrieves All sms messages
    findAllSmsSent: async (req, res) => {
        try {
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            console.log("req", currentPage, pageSize);
            const { count, totalPages, smsRecord } = await smsSentService.findAllSmsSent(currentPage, pageSize);

            console.log("sms--->>", smsRecord)

            if (smsRecord.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: false,
                    message: 'No data found on this page!'
                });
            }
            else {
                logger.info("All sms Fetched Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "All sms Fetched Successfully!",
                    data: { smsRecord, totalPages, count }
                })
            }

        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message,

            })
        }
    },
}

module.exports = smsSentController;