const correspondenceService = require("../services/correspondences.service")
const db = require("../models")
const Correspondences = db.correspondences
const CorrespondenceAttachments = db.correspondenceAttachments
const logger = require('../common/winston');
const correspondenceController = {

    // Create Correspondence 
    createCorrespondence: async (req, res) => {
        try {
            logger.info(`correspondenceController: createCorrespondence body ${JSON.stringify(req.body)} and file ${JSON.stringify(req.files)}`)
            const correspondence = await correspondenceService.createCorrespondence(req.body, req.files);
            logger.info("Correspondence Created Successfully!")
            return res.status(200).send({
                success: true,
                message: "Correspondence Created Successfully!",
                data: correspondence,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    //Retrive All Correspondences
    getAllCorrespondences: async (req, res) => {
        try {
            logger.info(`correspondenceController: getAllCorrespondences query ${JSON.stringify(req.query)}`)
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const fileId = parseInt(req.query.fileId)
            const caseId = parseInt(req.query.caseId)
            const branchId = parseInt(req.query.branchId);
            const { count, totalPages, correspondences } = await correspondenceService.getAllCorrespondences(fileId, caseId, branchId, currentPage, pageSize);
            if (correspondences.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: true,
                    message: 'No data found on this page!',
                    data: { correspondences }
                });
            }
            logger.info("Correspondences Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "Correspondences Fetched Successfully!",
                data: {
                    correspondences,
                    totalPages,
                    count
                }
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Retrive Single Correspondence
    getSingleCorrespondence: async (req, res) => {
        try {
            logger.info(`correspondenceController: getSingleCorrespondence id ${JSON.stringify(req.params.id)}`)
            const correspondenceId = req.params.id;
            const correspondence = await correspondenceService.getSingleCorrespondence(correspondenceId);
            logger.info("Correspondence Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "Correspondence Fetched Successfully!",
                data: correspondence,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    //Update Correspondence
    updateCorrespondence: async (req, res) => {
        try {
            logger.info(`correspondenceController: updateCorrespondence id ${JSON.stringify(req.params.id)} and body ${JSON.stringify(req.body)} and files ${JSON.stringify(req.files)}`)
            const correspondenceId = req.params.id;
            const correspondence = await Correspondences.findByPk(correspondenceId);
            if (!correspondence) {
                return res.status(200).send({
                    success: true,
                    message: "Correspondence Not Found!",
                })
            }
            const updatedCorrespondence = await correspondenceService.updateCorrespondence(correspondenceId, req.body, req.files);
            logger.info("Correspondence Updated Successfully!")
            return res.status(200).send({
                success: true,
                message: "Correspondence Updated Successfully!",
                data: updatedCorrespondence,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }

    },

    // Delete Correspondence
    deleteCorrespondence: async (req, res) => {
        try {
            logger.info(`correspondenceController: deleteCorrespondence id ${JSON.stringify(req.params.id)}`)
            const correspondenceId = req.params.id;
            const correspondence = await Correspondences.findByPk(correspondenceId);
            if (!correspondence) {
                return res.status(200).send({
                    success: true,
                    message: "Correspondence Not Found!",
                })
            }
            const deletedCorres = await correspondenceService.deleteCorrespondence(correspondenceId);
            logger.info("Correspondence Deleted Successfully!")
            return res.status(200).send({
                success: true,
                message: "Correspondence Deleted Successfully!",
                data: deletedCorres,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }

    },

    // Delete Attachment of Correspondence
    deleteCorrespondenceAttachment: async (req, res) => {
        try {
            logger.info(`correspondenceController: deleteCorrespondenceAttachment for id ${JSON.stringify(req.params.id)}`);
            const correspondenceAttachmentId = req.params.id;
            if (correspondenceAttachmentId) {
                try {
                    const deletedRows = await CorrespondenceAttachments.destroy({
                        where: {
                            id: correspondenceAttachmentId,
                        },
                    });
                    if (deletedRows > 0) {
                        return res.status(200).send({
                            success: true,
                            message: `Correspondence attachment successfully deleted`,
                            data: [],
                        });
                    } else {
                        return res.status(404).send({
                            success: false,
                            message: `No record found for id ${correspondenceAttachmentId}`, // Corrected variable name
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


module.exports = correspondenceController