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

            console.log("privateMemberBills--->>", privateMemberBills)

            if (privateMemberBills.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: false,
                    message: 'No data found on this page!'
                });
            }
            else {
                logger.info("All privateMemberBills Fetched Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "All privateMemberBills Fetched Successfully!",
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



    // Update the privateMemberBill
    updatePrivateMemberBill: async (req, res) => {
        try {
            const privateMemberBillId = req.params.id;
            console.log("biody---", req.body);
            const fkBrancheId = req.body.fkBranchesId;

            if (!fkBrancheId) {
                return res.status(400).json({ error: 'fkBranchesId is required in the payload.' });
            }

            const privateMemberBill = await PrivateMemberBills.findByPk(privateMemberBillId);
            if (!privateMemberBill) {
                return res.status(200).send({
                    success: false,
                    message: "privateMemberBill Not Found!",
                })
            }
            const updatedPrivateMemberBill = await privateMemberBillService.updatePrivateMemberBill(privateMemberBill, fkBrancheId);
            console.log(updatedPrivateMemberBill)
            logger.info("PrivateMemberBill Updated Successfully!")
            return res.status(200).send({
                success: true,
                message: "PrivateMemberBill Updated Successfully!",
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },


}

module.exports = privateMemberBillController;