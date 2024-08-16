
const freshReceiptService = require('../services/freshReceipt.service');
const logger = require('../common/winston');
const { uploadFile } = require('../common/upload');
const db = require("../models");
const File = db.files;
const newFiles = db.newFiles
const FreshReceipts = db.freshReceipts
const FreshReceiptAttachments = db.freshReceiptsAttachments
const FileDiaries = db.fileDiaries
const Op = db.Sequelize.Op;

const freshReceiptController = {

    // Creater External Ministry
    createExternalMinistry: async (req, res) => {
        try {
            logger.info(`freshReceiptController: createExternalMinistry  body ${JSON.stringify(req.body)}`);
            const externalMinistries = await freshReceiptService.createExternalMinistry(req.body);
            logger.info("External Ministry Created Successfully!")
            return res.status(200).send({
                success: true,
                message: "External Ministry Created Successfully!",
                data: externalMinistries,
            });
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message,
            });
        }
    },

    // Create New Fresh Receipt (FR)
    createFR: async (req, res) => {
        try {
            logger.info(`freshReceiptController: createFR id ${JSON.stringify(req.params.id)} and body ${JSON.stringify(req.body)}`);
            const userId = req.params.id;
            const freshReceipts = await freshReceiptService.createFR(req.body, req.files, userId);
            logger.info("Fresh Receipt Created Successfully!")
            return res.status(200).send({
                success: true,
                message: "Fresh Receipt Created Successfully!",
                data: freshReceipts,
            });
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message,
            });
        }
    },

    // Upload Multiple Attachments (FRs)
    uploadMultipleFRs: async (req, res) => {
        try {
            logger.info(`freshReceiptController: uploadMultipleFRs id ${JSON.stringify(req.params.id)} and files ${JSON.stringify(req.files)}`);
            const freshReceiptId = req.params.id;
            const freshReceipts = await freshReceiptService.uploadMultipleFRs(req.files, freshReceiptId);
            logger.info("Multiple FRs Uploaded Successfully!")
            return res.status(200).send({
                success: true,
                message: "Multiple FRs Uploaded Successfully!",
                data: freshReceipts,
            });
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message,
            });
        }
    },

    // Get All Fresh Receipts (FR) On User Basis
    getAllFRs: async (req, res) => {
        try {
            logger.info(`freshReceiptController: getAllFRs query ${JSON.stringify(req.query)}`);
            const currentPage = req.query.currentPage;
            const pageSize = req.query.pageSize;
            const userId = req.params.id;
            const { count, totalPages, freshReceipts } = await freshReceiptService.getAllFRs(currentPage, pageSize, userId);
            if (freshReceipts.length === 0) {
                logger.info(`No Data Found On This Page!`);
                return res.status(200).send({
                    success: true,
                    message: "No Data Found On This Page!",
                    data: []
                });
            }
            else {
                logger.info(`Fresh Receipts (FRs) Retrieved Successfully!`);
                return res.status(200).send({
                    success: true,
                    message: "Fresh Receipts (FRs) Retrieved Successfully!",
                    data: {
                        freshReceipts,
                        count,
                        totalPages
                    }
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
    
    // Get All Fresh Receipts (FR) On User Basis
    getAllPendingFRs: async (req, res) => {
        try {
            logger.info(`freshReceiptController: getAllFRs query ${JSON.stringify(req.query)}`);
            const currentPage = req.query.currentPage;
            const pageSize = req.query.pageSize;
            const userId = req.params.id;
            const { count, totalPages, freshReceipts } = await freshReceiptService.getAllPendingFRs(currentPage, pageSize, userId);
            if (freshReceipts.length === 0) {
                logger.info(`No Data Found On This Page!`);
                return res.status(200).send({
                    success: true,
                    message: "No Data Found On This Page!",
                    data: []
                });
            }
            else {
                logger.info(`Fresh Receipts (FRs) Retrieved Successfully!`);
                return res.status(200).send({
                    success: true,
                    message: "Fresh Receipts (FRs) Retrieved Successfully!",
                    data: {
                        freshReceipts,
                        count,
                        totalPages
                    }
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

    // Retrieve External Ministry
    getAllExternalMinistries: async (req, res) => {
        try {
            logger.info(`freshReceiptController: getAllExternalMinistries query ${JSON.stringify(req.query)}`);
            const currentPage = req.query.currentPage;
            const pageSize = req.query.pageSize;
            const { count, totalPages, externalMinistries } = await freshReceiptService.getAllExternalMinistries(currentPage, pageSize);
            if (externalMinistries.length === 0) {
                logger.info(`No Data Found On This Page!`);
                return res.status(200).send({
                    success: true,
                    message: "No Data Found On This Page!",
                    data: []
                });
            }
            else {
                logger.info(`External Ministries Retrieved Successfully!`);
                return res.status(200).send({
                    success: true,
                    message: "External Ministries Retrieved Successfully!",
                    data: {
                        externalMinistries,
                        count,
                        totalPages
                    }
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

    // Get All Fresh Receipts(FRs)
    getAllFRsByBranch: async (req, res) => {
        try {
            logger.info(`freshReceiptController: getAllFRsByBranch id ${JSON.stringify(req.params.id)}`);
            const branchId = req.params.id;
            const freshReceipts = await freshReceiptService.getAllFRsByBranch(branchId);
            logger.info(`Fresh Receipts (FRs) Retrieved Successfully!`);
            return res.status(200).send({
                success: true,
                message: "Fresh Receipts (FRs) Retrieved Successfully!",
                data:
                    freshReceipts,
            });

        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message,
            });
        }
    },
    // Get FRs On The Basis of Branch
    getFRsHistory: async (req, res) => {
        try {
            logger.info(`freshReceiptController: getFRsHistory query ${JSON.stringify(req.query)}`);
            const branchId = req.params.branchId
            const userId = req.params.userId
            const currentPage = req.query.currentPage;
            const pageSize = req.query.pageSize;
            const { count, totalPages, freshReceipts } = await freshReceiptService.getFRsHistory(branchId, userId, currentPage, pageSize)
            if (freshReceipts.length === 0) {
                return res.status(200).send({
                    success: true,
                    message: "No Data Found!",
                    data: []
                })
            }
            else {
                return res.status(200).send({
                    success: true,
                    message: `FRs Fetched Successfully!`,
                    data: { freshReceipts, count, totalPages },
                })
            }
        }
        catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            });


        }
    },

    // Get FRs On The Basis of Branch
    getFRsUpperHerarchyHistory: async (req, res) => {
        try {
            logger.info(`freshReceiptController: getFRsHistory query ${JSON.stringify(req.query)}`);
            const branchId = req.params.branchId
            const userId = req.params.userId
            const currentPage = req.query.currentPage;
            const pageSize = req.query.pageSize;
            const { count, totalPages, freshReceipts } = await freshReceiptService.getFRsUpperHerarchyHistory(branchId, userId, currentPage, pageSize)
            if (freshReceipts.length === 0) {
                return res.status(200).send({
                    success: true,
                    message: "No Data Found!",
                    data: []
                })
            }
            else {
                return res.status(200).send({
                    success: true,
                    message: `FRs Fetched Successfully!`,
                    data: { freshReceipts, count, totalPages },
                })
            }
        }
        catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            });


        }
    },

    // Get Single Fresh Receipt (FR)
    getSingleFR: async (req, res) => {
        try {
            logger.info(`freshReceiptController: getSingleFR id ${JSON.stringify(req.params.id)}`);
            const freshReceiptId = req.params.id;
            const freshReceipt = await freshReceiptService.getSingleFR(freshReceiptId);
            logger.info("Single Fresh Receipt Retrieved Successfully!")
            return res.status(200).send({
                success: true,
                message: "Single Fresh Receipt Retrieved Successfully!",
                data: freshReceipt,
            });
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message,
            });
        }
    },

    // Update Fresh Receipt (FR)
    updateFR: async (req, res) => {
        try {
            logger.info(`freshReceiptController: updateFR id ${JSON.stringify(req.params.id)} and body ${JSON.stringify(req.body)}`);
            const freshReceiptId = req.params.id;
            const freshReceipt = await FreshReceipts.findByPk(freshReceiptId)
            if (!freshReceipt) {
                logger.infor("Fresh Receipt (FR) Not Found!")
                return res.status(200).send({
                    success: true,
                    message: "Fresh Receipt (FR) Not Found!"
                })
            }
            // Pass both the body and files to the service function
            const freshReceipts = await freshReceiptService.updateFR(req.body, req.files, freshReceiptId);
            logger.info("Fresh Receipt Updated Successfully!")
            return res.status(200).send({
                success: true,
                message: "Fresh Receipt Updated Successfully!",
                data: freshReceipts,
            });
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message,
            });
        }
    },

    // Assign Fresh Receipt (FR)
    assignFR: async (req, res) => {
        try {
            logger.info(`freshReceiptController: assignFR id ${JSON.stringify(req.params.id)} and body ${JSON.stringify(req.body)}`);
            const freshReceiptId = req.params.id;
            const fr = await freshReceiptService.assignFR(freshReceiptId, req.body);
            logger.info("Fresh Receipt(FR) Assigned Successfully!")
            return res.status(200).send({
                success: true,
                message: "Fresh Receipt(FR) Assigned Successfully!",
                data: fr

            });
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message,
            });
        }
    },

    // Delete Fresh Receipt (FR)
    deleteFR: async (req, res) => {
        try {
            logger.info(`freshReceiptController: deleteFR id ${JSON.stringify(req.params.id)}`);
            const freshReceiptId = req.params.id;
            const freshReceipt = await FreshReceipts.findByPk(freshReceiptId)
            if (!freshReceipt) {
                logger.infor("Fresh Receipt (FR) Not Found!")
                return res.status(200).send({
                    success: true,
                    message: "Fresh Receipt (FR) Not Found!"
                })
            }
            // Pass both the body and files to the service function
            const freshReceipts = await freshReceiptService.deleteFR(freshReceiptId);
            logger.info("Fresh Receipt Deleted Successfully!")
            return res.status(200).send({
                success: true,
                message: "Fresh Receipt Deleted Successfully!",
                data: freshReceipts,
            });
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message,
            });
        }
    },

    // Delete Attachment of FR
    deleteFreshReceiptAttachment: async (req, res) => {
        try {
            logger.info(`fileController: deleteCorrespondingFile for Id ${JSON.stringify(req.params.id)}`);
            const freshReceiptAttachmentId = req.params.id;
            if (freshReceiptAttachmentId) {
                try {
                    const deletedRows = await FreshReceiptAttachments.destroy({
                        where: {
                            id: freshReceiptAttachmentId,
                        },
                    });
                    if (deletedRows > 0) {
                        return res.status(200).send({
                            success: true,
                            message: `File attachment successfully deleted`,
                            data: [],
                        });
                    } else {
                        return res.status(404).send({
                            success: false,
                            message: `No record found for id ${freshReceiptAttachmentId}`, // Corrected variable name
                            data: {},
                        });
                    }
                } catch (error) {
                    console.error("Error deleting attachment:", error);
                    return res.status(500).send({
                        success: false,
                        message: "Internal server error",
                        error: error.message,
                    });
                }
            } else {
                return res.status(400).send({
                    success: false,
                    message: "Invalid attachment ID",
                    data: {},
                });
            }
        } catch (error) {
            console.error("Error deleting attachment:", error);
            return res.status(500).send({
                success: false,
                message: "Internal server error",
                error: error.message,
            });
        }
    },

}

module.exports = freshReceiptController