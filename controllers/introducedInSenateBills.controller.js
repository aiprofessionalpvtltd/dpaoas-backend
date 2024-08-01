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
            const updatedSenateBill = await senateBillService.updateIntroducedInSenateBill(updatedData, senateBillId);
            if (updatedSenateBill) {
                if (req.files && req.files.length > 0) {
                    const newAttachmentObjects = req.files.map((file, index) => {
                        const path = file.destination.replace('./public/', '/assets/') + file.originalname;
                        const id = index + 1;
                        return JSON.stringify({ id, path });
                    });

                    // Merge existing image objects with the new ones
                    const updatedImages = [...newAttachmentObjects];

                    const [numberOfAffectedRows, affectedRows] = await BillDocuments.update(
                        {
                            file: updatedImages,
                        },
                        {
                            where: { fkBillDocumentId: senateBillId }
                        }
                    );

                }

                const updatedBillDocument = await BillDocuments.findOne({ where: { fkBillDocumentId: senateBillId } });

                if (updatedBillDocument && updatedBillDocument.file) {
                    updatedBillDocument.file = updatedBillDocument.file.map(imageString => JSON.parse(imageString));
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