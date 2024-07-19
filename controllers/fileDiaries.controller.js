const fileDiariesService = require('../services/fileDiaries.service');
const logger = require('../common/winston');
const { uploadFile } = require('../common/upload');
const db = require("../models");
const File = db.files;
const newFiles = db.newFiles
const FreshReceipts = db.freshReceipts
const FreshReceiptAttachments = db.freshReceiptsAttachments
const FileDiaries = db.fileDiaries
const Op = db.Sequelize.Op;

const fileDiariesController = {

// Retrieve File Diaries Regarding to Incoming and Outgoing
retrieveFileDiaries: async (req, res) => {
    try {
        logger.info(`fileDiariesController: retrieveFileDiaries query ${JSON.stringify(req.query)}`);
        const currentPage = req.query.currentPage;
        const pageSize = req.query.pageSize;
        const { incoming, outgoing } = await fileDiariesService.retrieveFileDiaries(currentPage, pageSize);

        // Check if both incoming and outgoing file diaries are empty
        if (incoming.fileDiaries.length === 0 && outgoing.fileDiaries.length === 0) {
            logger.info(`No Data Found On This Page!`);
            return res.status(200).send({
                success: true,
                message: "No Data Found On This Page!",
                data: []
            });
        }
        
        // Prepare response object
        const response = {
            incoming: {
                count: incoming.count1,
                totalPages: incoming.totalPages,
                fileDiaries: incoming.fileDiaries
            },
            outgoing: {
                count: outgoing.count2,
                totalPages: outgoing.totalPages,
                fileDiaries: outgoing.fileDiaries
            }
        };

        logger.info(`File Diaries Retrieved Successfully!`);
        return res.status(200).send({
            success: true,
            message: "File Diaries Retrieved Successfully!",
            data: response
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


module.exports = fileDiariesController