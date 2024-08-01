const privateMemberBillService = require('../services/privateMemberBills.service');
const logger = require('../common/winston');
const db = require("../models");
const PrivateMemberBills = db.privateMemberBills;
const privateMemberBillController = {


    // Retrieves All privateMemberBills
    findAllPrivateMemberBills: async (req, res) => {
        try {
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            console.log("req", currentPage, pageSize);
            const { count, totalPages, privateMemberBills } = await privateMemberBillService.findAllPrivateMemberBills(currentPage, pageSize);

            if (privateMemberBills.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: false,
                    message: 'No data found on this page!',
                    data: {privateMemberBills}
                });
            }
            else {
                logger.info("All privateMemberBills Fetched Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "All private member bills fetched successfully!",
                    data: { privateMemberBills, totalPages, count }
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

    // Retrieve All privateMemberBills in Notice Branch
    findAllPrivateMemberBillsInNotice: async (req, res) => {
        try {
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            console.log("req", currentPage, pageSize);
            const { count, totalPages, privateMemberBills } = await privateMemberBillService.findAllPrivateMemberBillsInNotice(currentPage, pageSize);

            if (privateMemberBills.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: false,
                    message: 'No data found on this page!',
                    data: {privateMemberBills}
                });
            }
            else {
                logger.info("All privateMemberBills in Notice Branch Fetched Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "All privateMemberBills in Notice Branch Fetched Successfully!",
                    data: { privateMemberBills, totalPages, count }
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

    // Retrieve all All privateMemberBills by web_id
    findAllPrivateMemberBillsByWebId: async (req, res) => {
        try {
            logger.info(`req.query.web_id--- ${req.query.web_id}`);
            const webId = req.query.web_id;
            const privateMemberBills = await privateMemberBillService.findAllPrivateMemberBillsByWebId(webId);
            privateMemberBills.forEach(privateMemberBills => {
                if(privateMemberBills.file && privateMemberBills.file[0]){
                    privateMemberBills.file = JSON.parse(privateMemberBills.file[0]);
                } else {
                    privateMemberBills.file = null;
                }

            });
            logger.info("All privateMemberBills Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "All private member bills fetched successfully!",
                data: { privateMemberBills },
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Create privateMemberBill
    createPrivateMemberBills: async (req, res) => {
        try {
            const privateMemberBills = await privateMemberBillService.createPrivateMemberBills(req.body);
            console.log("privateMemberBills", privateMemberBills);

            let imageObjects = [];
            if (req.files && req.files.length > 0) {
                imageObjects = req.files.map((file, index) => {
                    const path = file.destination.replace('./public/', '/assets/') + file.originalname;
                    const id = index + 1;
                    return JSON.stringify({ id, path });
                });
            }

            const existingPrivateMemberBill = await PrivateMemberBills.findOne({ where: { id: privateMemberBills.id } });
            const existingImages = existingPrivateMemberBill ? existingPrivateMemberBill.file || [] : [];
            const updatedImages = [...existingImages, ...imageObjects];

            try {
                // Your code to update the database
                await PrivateMemberBills.update(
                    {
                        file: updatedImages,
                    },
                    {
                        where: { id: privateMemberBills.dataValues.id }
                    }
                );
                const updatedPrivateMemberBill = await PrivateMemberBills.findOne({ where: { id: privateMemberBills.id } });
                logger.info("privateMember Bill Created Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "Submitted",
                    data: updatedPrivateMemberBill,
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


    // Retrieve Single privateMemberBill
    findSinlgePrivateMemberBill: async (req, res) => {
        try {
            const privateMemberBillId = req.params.id
            const privateMemberBill = await privateMemberBillService.findSinlgePrivateMemberBill(privateMemberBillId);
            logger.info("Single privateMemberBill Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "Single private memberBill fetched successfully!",
                data: [privateMemberBill],
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Update the privateMemberBill
    updatePrivateMemberBill: async (req, res) => {
        try {
            const privateMemberBillId = req.params.id;

            const privateMemberBill = await PrivateMemberBills.findByPk(privateMemberBillId);
            if (!privateMemberBill) {
                return res.status(200).send({
                    success: false,
                    message: "private memberBill not found!",
                })
            }
            // Assuming the request body contains the updated data
            const updatedPrivateMemberBill = await privateMemberBillService.updatePrivateMemberBill(privateMemberBillId, req);
            if (updatedPrivateMemberBill) {
                if (req.files && req.files.length > 0) {

                    const newAttachmentObjects = req.files.map((file, index) => {
                        const path = file.destination.replace('./public/', '/assets/') + file.originalname;
                        const id = index + 1;
                        return JSON.stringify({ id, path });
                    });

                    // Merge existing image objects with the new ones
                    const updatedImages = [...newAttachmentObjects];

                    await PrivateMemberBills.update(
                        {
                            file: updatedImages,
                        },
                        {
                            where: { id: privateMemberBillId }
                        }
                    );
                }
                const updatedprivateMemberBillData = await PrivateMemberBills.findOne({ where: { id: privateMemberBillId } });
                if (updatedprivateMemberBillData && updatedprivateMemberBillData.file) {
                    updatedprivateMemberBillData.file = updatedprivateMemberBillData.file.map(imageString => JSON.parse(imageString));
                }


                logger.info("privateMember Bill Data Updated Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "Private member bill updated successfully!",
                    data: updatedprivateMemberBillData,
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

    // Send To Legislation
    sendToLegislation: async(req,res) => {
        try {
            const billId = req.params.id;
            const bill = await PrivateMemberBills.findByPk(billId);
            if (!bill) {
                return res.status(200).send({
                    success: true,
                    message: "PrivateMemberBill Not Found!",
                    data: null
                })
            }
            const updatedBill = await privateMemberBillService.sendToLegislation(req.body, billId);
            logger.info("Private member bill sent to concerned branch successfully!")
            return res.status(200).send({
                success: true,
                message: "Private member bill sent to concerned branch successfully!",
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

    // Delets/Suspend the privateMemberBill
    deletePrivateMemberBills: async (req, res) => {
        try {
            const privateMemberBillId = req.params.id;
            const privateMemberBill = await PrivateMemberBills.findByPk(privateMemberBillId);
            if (!privateMemberBill) {
                return res.status(200).send({
                    success: false,
                    message: "private member bill not found!",
                    data: null
                });
            }
    
            const result = await privateMemberBillService.deletePrivateMemberBills(privateMemberBill, privateMemberBillId);
    
            logger.info("privateMemberBill Deleted Successfully!");
            return res.status(200).send({
                success: true,
                message: "private member bill deleted successfully!",
                data: result,
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

module.exports = privateMemberBillController;