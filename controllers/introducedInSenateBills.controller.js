const senateBillService = require('../services/introducedInSenateBills.service');
const logger = require('../common/winston');
const db = require("../models");
const IntroducedInSenateBills = db.introducedInSenateBills;
const BillDocuments = db.billDocuments;
const senateBillController = {

    // Create a new senate Bill
    createSenateBill: async (req, res) => {
        try {
            const senateBillData = req.body;
            console.log("senateBillData------",senateBillData);
            const createdSenateBill = await senateBillService.createSenateBill(senateBillData);
            logger.info("senate Bill Created Successfully!");
            return res.status(200).send({
                success: true,
                message: "senate Bill Created Successfully!",
                data: createdSenateBill,
            })
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Retrieves All Introduced In Senate Bills
    findAllIntroducedInSenateBills: async (req, res) => {
        try {
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const billFrom = req.query.billFrom;
            const { count, totalPages, senateBills } = await senateBillService.findAllIntroducedInSenateBills(currentPage, pageSize, billFrom);

            logger.info("senateBills--->>", senateBills)

            if (senateBills.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: true,
                    message: 'No data found on this page!'
                });
            }
            else {
                logger.info("All senate Bills Fetched Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "All senate Bills Fetched Successfully!",
                    data: { senateBills, totalPages, count }
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

    // Retrieves All Introduced In Senate Bills By Category
    findAllIntroducedInSenateBillsByCategory: async (req, res) => {
        try {
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const billCategory = req.query.billCategory;
            const billFrom = req.query.billFrom;

            if (!billCategory) {
                return res.status(400).send({
                    success: false,
                    message: 'billCategory is required!'
                });
            }

            const { count, totalPages, senateBills } = await senateBillService.findAllIntroducedInSenateBillsByCategory(currentPage, pageSize, billCategory, billFrom);

            logger.info("senateBills--->>", senateBills);

            if (senateBills.length === 0) {
                logger.info("No data found for this category on this page!");
                return res.status(200).send({
                    success: true,
                    message: 'No data found for this category on this page!'
                });
            } else {
                logger.info("All senate Bills Fetched Successfully!");
                return res.status(200).send({
                    success: true,
                    message: "All senate Bills Fetched Successfully!",
                    data: { senateBills, totalPages, count }
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



    // search All Introduced In Senate Bills
    searchAllIntroducedInSenateBills: async (req, res) => {
        try {
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const { count, totalPages, senateBills } = await senateBillService.searchAllIntroducedInSenateBills(req.query, currentPage, pageSize);

            logger.info("senateBills--->>", senateBills)

            if (senateBills.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: true,
                    message: 'No data found on this page!'
                });
            }
            else {
                logger.info("All senate Bills Fetched Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "All senate Bills Fetched Successfully!",
                    data: { senateBills, totalPages, count }
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

    // Retrieve Single Introduced In Senate Bill
    findSinlgeIntroducedInSenateBill: async (req, res) => {
        try {
            const senateBillId = req.params.id
            const senateBil = await senateBillService.findSinlgeIntroducedInSenateBill(senateBillId);
            logger.info("Single Senate Bil Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "Single Senate Bil Fetched Successfully!",
                data: [senateBil],
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Update the Introduced In Senate Bill data
    updateIntroducedInSenateBill: async (req, res) => {
        try {
            const senateBillId = req.params.id;
            const updatedData = req.body;
            const senateBill = await IntroducedInSenateBills.findByPk(senateBillId);
            if (!senateBill) {
                return res.status(200).send({
                    success: true,
                    message: "senate Bill Not Found!",
                })
            }

            // Ensure updatedData.billDocuments is an array
            if (!Array.isArray(updatedData.billDocuments)) {
                updatedData.billDocuments = [];
            }


            const updatedSenateBill = await senateBillService.updateIntroducedInSenateBill(updatedData, senateBillId);
            if (updatedSenateBill) {
                if (req.files && req.files.length > 0) {
                    const newAttachmentObjects = req.files.map((file, index) => {
                        const path = file.destination.replace('./public/', '/assets/') + file.originalname;
                        return { id: null, path }; // We'll update IDs later
                    });

                    const existingDocument = await BillDocuments.findOne({
                        where: {
                            fkBillDocumentId: senateBillId,
                            documentType: updatedData.documentType
                        }
                    });

                    let updatedImages = newAttachmentObjects;

                    if (existingDocument && existingDocument.file) {
                        // Correctly parse JSON strings
                        const existingFiles = existingDocument.file.map(fileString => {
                            try {
                                return JSON.parse(fileString);
                            } catch (e) {
                                console.error("Error parsing JSON:", e);
                                return null; // Handle parsing error
                            }
                        }).filter(file => file !== null); // Filter out any parsing errors


                        const existingFileIds = existingFiles.map(file => file.id);

                        const nextId = Math.max(...existingFileIds, 0) + 1;
                        // Update images with existing files and new attachments
                        updatedImages = existingFiles.map(file => ({ ...file, id: file.id })) // Preserve existing IDs
                            .concat(newAttachmentObjects.map((file, index) => ({ id: nextId + index, path: file.path })));

                    } else {
                        // Generate IDs for new attachments if no existing document is found
                        const nextId = 1;
                        updatedImages = newAttachmentObjects.map((file, index) => ({ id: nextId + index, path: file.path }));
                    }

                    const documentData = {
                        documentType: updatedData.documentType,
                        documentDate: updatedData.documentDate,
                        documentDiscription: updatedData.documentDiscription,
                        file: updatedImages.map(file => JSON.stringify(file))
                    };

                    if (existingDocument) {
                        await BillDocuments.update(documentData, {
                            where: {
                                fkBillDocumentId: senateBillId,
                                documentType: updatedData.documentType
                            }
                        });
                    } else {
                        documentData.fkBillDocumentId = senateBillId;
                        await BillDocuments.create(documentData);
                    }
                }


                logger.info("senate Bill Data Updated Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "senate Bill Data Updated Successfully!",
                    data: updatedSenateBill,
                })
            }
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Delete a file from the Introduced In Senate Bill data
    deleteFile: async (req, res) => {
        try {
            const senateBillId = req.params.id;
            const { documentType, fileId } = req.body;

            const existingDocument = await BillDocuments.findOne({
                where: {
                    fkBillDocumentId: senateBillId,
                    documentType: documentType
                }
            });

            if (!existingDocument) {
                return res.status(404).send({
                    success: false,
                    message: "Document not found!"
                });
            }

            const existingFiles = existingDocument.file.map(file => JSON.parse(file));
            const fileIndex = existingFiles.findIndex(file => file.id === fileId);

            if (fileIndex === -1) {
                return res.status(404).send({
                    success: false,
                    message: "File not found!"
                });
            }

            // Remove the file from the array
            existingFiles.splice(fileIndex, 1);

            // Update the IDs to be sequential
            const updatedFiles = existingFiles.map((file, index) => ({
                ...file,
                id: index + 1
            }));

            const updatedDocumentData = {
                file: updatedFiles.map(file => JSON.stringify(file))
            };


            // Update the document if there are files remaining
            if (updatedFiles.length > 0) {
                await BillDocuments.update(updatedDocumentData, {
                    where: {
                        fkBillDocumentId: senateBillId,
                        documentType: documentType
                    }
                });
            } else {
                // Delete the document type if no files are remaining
                await BillDocuments.destroy({
                    where: {
                        fkBillDocumentId: senateBillId,
                        documentType: documentType
                    }
                });
            }

            // Check if any documents are left for the senate bill
            const remainingDocuments = await BillDocuments.findOne({
                where: {
                    fkBillDocumentId: senateBillId
                }
            });

            if (!remainingDocuments) {
                // Optionally handle the case if all documents are deleted
                // For example, you might want to delete the senate bill itself if necessary
                // await IntroducedInSenateBills.destroy({
                //     where: {
                //         id: senateBillId
                //     }
                // });
            }

            logger.info("File deleted and IDs updated successfully!");
            return res.status(200).send({
                success: true,
                message: "File deleted and IDs updated successfully!"
            });

        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            });
        }
    },

    // Delets/Suspend the Senate Bill
    deleteIntroducedInSenateBill: async (req, res) => {
        try {
            const senateBillId = req.params.id;
            const senateBill = await IntroducedInSenateBills.findByPk(senateBillId);
            if (!senateBill) {
                return res.status(200).send({
                    success: true,
                    message: "senate Bill Not Found!",
                })
            }
            const deletedSenateBill = await senateBillService.deleteIntroducedInSenateBill(senateBillId);

            logger.info("Senate Bill Data Deleted Successfully!")
            return res.status(200).send({
                success: true,
                message: "Senate Bill Data Deleted Successfully!",
                data: deletedSenateBill,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    }
}

module.exports = senateBillController;