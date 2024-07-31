const db = require("../models");
const PrivateMemberBills = db.privateMemberBills;
const Branches = db.branches;
const BillStatuses = db.billStatuses;
const { Op } = require('sequelize');
const logger = require('../common/winston');

const privateMemberBillService = {


    // Retrieve All PrivateMemberBills
    findAllPrivateMemberBills: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            const { count, rows } = await PrivateMemberBills.findAndCountAll({
                where: {billSentStatus: 'toLegislation'},
                offset,
                limit,
                order: [['id', 'ASC']],
                include: [
                    {
                        model: Branches,
                        as: 'branch',
                        attributes: ['branchName', 'description', 'branchStatus'],
                    },
                    {
                        model: BillStatuses,
                        as: 'billStatuses'
                    },
                ],
            });

            console.log("rows: " + rows)

            const totalPages = Math.ceil(count / pageSize);

            return { count, totalPages, privateMemberBills: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All contactList");
        }
    },

     // Retrieve All PrivateMemberBills
     findAllPrivateMemberBillsInNotice: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            const { count, rows } = await PrivateMemberBills.findAndCountAll({
                where: {billSentStatus: 'inNotice'},
                offset,
                limit,
                order: [['id', 'DESC']],
                include: [
                    {
                        model: Branches,
                        as: 'branch',
                        attributes: ['branchName', 'description', 'branchStatus'],
                    },
                    {
                        model: BillStatuses,
                        as: 'billStatuses'
                    },
                    {
                        model: db.members,
                        as: 'member',
                        attributes: ['memberName'] // Include only the member name
                    }
                ],
            });

            console.log("rows: " + rows)

            const totalPages = Math.ceil(count / pageSize);

            return { count, totalPages, privateMemberBills: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All contactList");
        }
    },

    // Create A New PrivateMemberBills
    createPrivateMemberBills: async (req) => {

        try {
            const privateMemberBill = await PrivateMemberBills.create(req);

            return privateMemberBill;
        } catch (error) {
            throw { message: error.message || "Error Creating PrivateMemberBill" };
        }
    },


    // Retrieve Single PrivateMemberBill
    findSinlgePrivateMemberBill: async (privateMemberBillId) => {
        try {
            const privateMemberBill = await PrivateMemberBills.findOne({
                where: { id: privateMemberBillId },
                order: [['id', 'ASC']],
                include: [
                    {
                        model: Branches,
                        as: 'branch',
                        attributes: ['branchName', 'description', 'branchStatus'],
                    },
                    {
                        model: BillStatuses,
                        as: 'billStatuses'
                    }
                ],
            });
            if (!privateMemberBill) {
                throw ({ message: "privateMemberBill Not Found!" })
            }
            return privateMemberBill;
        }
        catch (error) {
            throw { message: error.message || "Error Fetching Single privateMemberBill" };
        }
    },

        // Retrieve all PrivateMemberBill by web_id
        findAllPrivateMemberBillsByWebId: async (webId) => {
            try {
                const privateMemberBill = await PrivateMemberBills.findAll({
                    where: { web_id: webId },
                    include: [
                        {
                            model: Branches,
                            as: 'branch',
                            attributes: ['branchName', 'description', 'branchStatus'],
                        },
                        {
                            model: BillStatuses,
                            as: 'billStatuses'
                        }
                    ],
                    order: [['createdAt', 'DESC']]
                });
                if (!privateMemberBill) {
                    throw ({ message: "privateMemberBill Not Found!" })
                }
                return privateMemberBill;
            }
            catch (error) {
                throw { message: error.message || "Error Fetching privateMemberBill" };
            }
        },

    // Update PrivateMemberBill
    updatePrivateMemberBill: async (privateMemberBillId, req) => {
        try {

           const privateMemberBill = await PrivateMemberBills.findOne({
            where: { id: privateMemberBillId },
        });
            // Check if the bill is already assigned to another branch
            if (privateMemberBill.fkBranchesId) {
                throw { message: 'This business is already assigned to another Branch.' };
            } else {

                await PrivateMemberBills.update(req.body, { where: { id: privateMemberBillId } });

                const updatedPrivateMemberBills = await PrivateMemberBills.findOne({
                    where: { id: privateMemberBillId },
                }, { raw: true });

                return updatedPrivateMemberBills;

            }
        } catch (error) {
            throw { message: error.message || 'Error updating PrivateMemberBill' };
        }
    },

    // Send To Legislation
    sendToLegislation: async(req,billId) => {
        try {
            const updatedData = {
                billSentStatus: "toLegislation",
                billSentDate: req.billSentDate
            }
            await PrivateMemberBills.update(updatedData, { where: { id: billId } });

            // Fetch the updated private member bill which is sent to legislation
            const billData = await PrivateMemberBills.findOne({ where: { id: billId } });
            return billData;
        } catch (error) {
            throw { message: error.message || "Error Sending Private Member Bill To Legislation!" };
        }
    },


    // Delete PrivateMemberBill
    deletePrivateMemberBills: async (privateMemberBill, privateMemberBillId) => {
        try {
            if (privateMemberBill.fkBranchesId) {
                throw { message: 'This business can not be deleted. Its already assigned to the Branch.' };
            } else {
                // Update the associated billStatus to "inactive"
                const billStatusId = privateMemberBill.fkBillStatus;
                if (billStatusId) {
                    await BillStatuses.update(
                        { billStatus: "inactive" },
                        { where: { id: billStatusId } }
                    );
                }
    
                // Optionally, you can also update the privateMemberBill status or any other field
                // await PrivateMemberBills.update({ status: 'inactive' }, { where: { id: privateMemberBillId } });
    
                // Fetch the updated PrivateMemberBill after the update
                const updatedPrivateMemberBill = await PrivateMemberBills.findByPk(privateMemberBillId, { raw: true });
    
                return updatedPrivateMemberBill;
            }
        } catch (error) {
            throw { message: error.message || "Error deleting PrivateMemberBill" };
        }
    }        






}

module.exports = privateMemberBillService