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

    // Update the LegislativeBill
    updateLegislativeBill: async (req, res) => {
        try {
            const legislativeBillId = req.params.id;

            const legislativeBills = await LegislativeBills.findByPk(legislativeBillId);
            if (!legislativeBills) {
                return res.status(200).send({
                    success: false,
                    message: "legislative bill not found!",
                })
            }
            // Assuming the request body contains the updated data
            const updatedLegislativeBill = await legislativeBillService.updateLegislativeBill(legislativeBillId, req);
            if (updatedLegislativeBill) {
                if (req.files && req.files.length > 0) {

                    const newAttachmentObjects = req.files.map((file, index) => {
                        const path = file.destination.replace('./public/', '/assets/') + file.originalname;
                        const id = index + 1;
                        return JSON.stringify({ id, path });
                    });

                    // Merge existing image objects with the new ones
                    const updatedImages = [...newAttachmentObjects];

                    await LegislativeBills.update(
                        {
                            attachment: updatedImages,
                        },
                        {
                            where: { id: legislativeBillId }
                        }
                    );
                }
                const updatedLegislativeBillData = await LegislativeBills.findOne({ where: { id: legislativeBillId } });
                if (updatedLegislativeBillData && updatedLegislativeBillData.attachment) {
                    updatedLegislativeBillData.attachment = updatedLegislativeBillData.attachment.map(imageString => JSON.parse(imageString));
                }


                logger.info("legislative Bill Updated Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "legislative bill updated successfully!",
                    data: updatedLegislativeBillData,
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
    }


}

module.exports = legislativeBillController;