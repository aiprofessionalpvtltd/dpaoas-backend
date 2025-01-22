const legislativeBillService = require('../services/legislativeBills.service');
const logger = require('../common/winston');
const db = require("../models");
const LegislativeBills = db.legislativeBills;
const legislativeBillController = {


    // Retrieves All legislativeBills
    findAllLegislativeBills: async (req, res) => {
        try {
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            console.log("req", currentPage, pageSize);
            const { count, totalPages, legislativeBills } = await legislativeBillService.findAllLegislativeBills(currentPage, pageSize);

            console.log("legislativeBills--->>", legislativeBills)
    
            if (legislativeBills.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: false,
                    message: 'No data found on this page!',
                    data: { legislativeBills }
                });
            }
            else {
                logger.info("All legislative Bills Fetched Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "All legislative bills fetched successfully!",
                    data: { legislativeBills, totalPages, count }
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

    // Retrieves All legislativeBills in Notice
    findAllLegislativeBillsInNotice: async (req, res) => {
        try {
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            console.log("req", currentPage, pageSize);
            const { count, totalPages, legislativeBills } = await legislativeBillService.findAllLegislativeBillsInNotice(currentPage, pageSize);

            if (legislativeBills.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: false,
                    message: 'No data found on this page!',
                    data: { legislativeBills }
                });
            }
            else {
                logger.info("All legislative Bills In Notice Fetched Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "All legislative Bills In Notice Fetched Successfully!",
                    data: { legislativeBills, totalPages, count }
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

    // Retrieve Today's legislative Bills
    getTodaysLegislativeBills: async (req, res) => {
        try {
            logger.info(`legislativeBillsController: getTodaysLegislativeBills query ${JSON.stringify(req.query)}`);

            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const currentDate = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
            const legislativeSentStatus = req.query.legislativeSentStatus ? req.query.legislativeSentStatus : null;
            const { count, totalPages, legislativeBills } = await legislativeBillService.getTodaysLegislativeBills(currentPage, pageSize, currentDate, legislativeSentStatus);

            if (legislativeBills.length === 0) {
                logger.info("No legislativeBills found for today!");
                return res.status(200).send({
                    success: true,
                    message: 'No legislativeBills found for today!',
                    data: { legislativeBills, count, totalPages }
                });
            } else {
                logger.info("Today's legislativeBills fetched successfully!");
                return res.status(200).send({
                    success: true,
                    message: "Today's legislativeBills fetched successfully!",
                    data: {
                        legislativeBills,
                        count,
                        totalPages
                    }
                });
            }
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            });
        }
    },

    // Retrieve all legislativeBills by web_id
    findAllLegislativeBillsByWebId: async (req, res) => {
        try {
            logger.info(`req.query.web_id--- ${req.query.web_id}`);
            const webId = req.query.web_id;
            const legislativeBillsData = await legislativeBillService.findAllLegislativeBillsByWebId(webId);
            // Modify the legislative bills data
            const legislativeBills = legislativeBillsData.map(bill => {
                if (Array.isArray(bill.attachment) && bill.attachment.length === 1) {
                    try {
                        logger.info(`Attempting to parse attachment for bill id ${bill.id}: ${bill.attachment[0]}`);
                        bill.attachment = JSON.parse(bill.attachment[0]);
                    } catch (error) {
                        logger.error(`Error parsing attachment for bill id ${bill.id}: ${error.message}`);
                        bill.attachment = null; // or set to some default value
                    }
                }
                return bill;
            });

            logger.info("All legislative bills fetched successfully!")
            return res.status(200).send({
                success: true,
                message: "All legislative bills fetched successfully!",
                data: { legislativeBills },
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Create legislativeBill
    createLegislativeBill: async (req, res) => {
        try {
            const legislativeBills = await legislativeBillService.createLegislativeBill(req.body);
            console.log("legislativeBills", legislativeBills);

            let imageObjects = [];
            if (req.files && req.files.length > 0) {
                imageObjects = req.files.map((file, index) => {
                    const path = file.destination.replace('./public/', '/assets/') + file.originalname;
                    const id = index + 1;
                    return JSON.stringify({ id, path });
                });
            }

            const existingLegislativeBill = await LegislativeBills.findOne({ where: { id: legislativeBills.id } });
            const existingImages = existingLegislativeBill ? existingLegislativeBill.attachment || [] : [];
            const updatedImages = [...existingImages, ...imageObjects];

            try {
                // Your code to update the database
                await LegislativeBills.update(
                    {
                        attachment: updatedImages,
                    },
                    {
                        where: { id: legislativeBills.dataValues.id }
                    }
                );
                const updatedLegislativeBill = await LegislativeBills.findOne({ where: { id: legislativeBills.id } });
                logger.info("Legislative bill submitted!")
                return res.status(200).send({
                    success: true,
                    message: "Submitted",
                    data: updatedLegislativeBill,
                })
            } catch (error) {
                console.error("Error updating attachment:", error);
            }

        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Send To Legislation
    sendToLegislation: async (req, res) => {
        try {
            const billId = req.params.id;
            const bill = await LegislativeBills.findByPk(billId);
            if (!bill) {
                return res.status(200).send({
                    success: true,
                    message: "LegislativeBill Not Found!",
                    data: null
                })
            }
            const updatedBill = await legislativeBillService.sendToLegislation(req.body, billId);
            logger.info("Legislative bill sent to concerned branch successfully!")
            return res.status(200).send({
                success: true,
                message: "Legislative bill sent to concerned branch successfully!",
                data: updatedBill,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },
    // Retrieve Single legislativeBill
    findSingleLegislativeBill: async (req, res) => {
        try {
            const legislativeBillId = req.params.id
            const legislativeBills = await legislativeBillService.findSingleLegislativeBill(legislativeBillId);
            // console.log('legislativeBills' , legislativeBills); return false;
            logger.info("Single legislative Bill Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "Single legislative bill fetched successfully!",
                data: [legislativeBills],
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    updateLegislativeBill: async (req, res) => {
        try {
            const legislativeBillId = req.params.id;
            const updatedData = req.body;

            const legislativeBill = await db.legislativeBills.findByPk(legislativeBillId);
            if (!legislativeBill) {
                return res.status(404).send({
                    success: false,
                    message: "Legislative bill not found!",
                });
            }

            const updatedLegislativeBill = await legislativeBillService.updateLegislativeBill(legislativeBillId, req);

            if (updatedLegislativeBill) {
                if (req.files && req.files.length > 0) {
                    const newAttachmentObjects = req.files.map((file) => {
                        const path = file.destination.replace('./public/', '/assets/') + file.filename;
                        console.log("path", path);
                        
                        return { id: null, path };
                    });

                    const existingDocument = await db.billDocuments.findOne({
                        where: {
                            fkLegisBillDocumentId: legislativeBillId,
                            documentType: updatedData.documentType,
                        },
                    });

                    let updatedImages = [];
                    let nextId = 1;

                    if (existingDocument && existingDocument.file) {
                        const existingFiles = existingDocument.file.map((fileString) => {
                            try {
                                return JSON.parse(fileString);
                            } catch (e) {
                                console.error("Error parsing JSON:", e);
                                return null;
                            }
                        }).filter(file => file !== null);

                        const existingFileIds = existingFiles.map(file => file.id).filter(id => id !== undefined);
                        nextId = existingFileIds.length > 0 ? Math.max(...existingFileIds) + 1 : 1;

                        const existingPaths = existingFiles.map(file => file.path);
                        const filteredNewAttachments = newAttachmentObjects.filter(file => !existingPaths.includes(file.path));

                        updatedImages = existingFiles.concat(
                            filteredNewAttachments.map((file, index) => ({
                                id: nextId + index,
                                path: file.path,
                            }))
                        );
                    } else {
                        updatedImages = newAttachmentObjects.map((file, index) => ({
                            id: nextId + index,
                            path: file.path,
                        }));
                    }

                    updatedImages = updatedImages.map((file, index) => ({
                        id: file.id !== null && file.id !== undefined ? file.id : nextId + index,
                        path: file.path,
                    }));

                    const documentData = {
                        documentType: updatedData.documentType,
                        documentDate: updatedData.documentDate,
                        documentDiscription: updatedData.documentDiscription,
                        file: updatedImages.map(file => JSON.stringify(file)),
                    };

                    if (existingDocument) {
                        await db.billDocuments.update(documentData, {
                            where: {
                                fkLegisBillDocumentId: legislativeBillId,
                                documentType: updatedData.documentType,
                            },
                        });
                    } else {
                        documentData.fkLegisBillDocumentId = legislativeBillId;
                        await db.billDocuments.create(documentData);
                    }
                }

                logger.info("Senate Bill Data Updated Successfully!", updatedLegislativeBill);
                return res.status(200).send({
                    success: true,
                    message: "Senate Bill Data Updated Successfully!",
                    data: updatedLegislativeBill,
                });
            }
        } catch (error) {
            logger.error(error.message);
            return res.status(500).send({
                success: false,
                message: error.message,
            });
        }
    },       

    // Delets/Suspend the LegislativeBill
    deleteLegislativeBill: async (req, res) => {
        try {
            const legislativeBillId = req.params.id;
            const legislativeBills = await LegislativeBills.findByPk(legislativeBillId);
            if (!legislativeBills) {
                return res.status(200).send({
                    success: false,
                    message: "legislative Bill Not Found!",
                })
            }
            const deletedLegislativeBill = await legislativeBillService.deleteLegislativeBill(legislativeBillId);

            logger.info("legislative Bill Deleted Successfully!")
            return res.status(200).send({
                success: true,
                message: "legislative bill deleted successfully!",
                data: deletedLegislativeBill,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },


    generateDiaryNumber: async (req, res) => {
        try {
            const result = await legislativeBillService.generateDiaryNumber();

            return res.status(200).send({
                success: true,
                message: "Legislative Bill new diary number generated successfully!",
                data: result
            });
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = legislativeBillController;