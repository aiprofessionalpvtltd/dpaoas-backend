const db = require("../models");
const LegislativeBills = db.legislativeBills;
const Sessions = db.sessions;
const BillStatuses = db.billStatuses;
const { Op } = require('sequelize');
const logger = require('../common/winston');

const legislativeBillService = {


    // Retrieve All LegislativeBills
    findAllLegislativeBills: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            const { count, rows } = await LegislativeBills.findAndCountAll({
                where: { legislativeSentStatus: 'toLegislation'},
                offset,
                limit,
                order: [['id', 'DESC']],
                include: [
                    {
                        model: Sessions,
                        as: 'session',
                        attributes: ['sessionName']
                    },
                    {
                        model: BillStatuses,
                        as: 'billStatuses'
                    }
                ],
            });

            console.log("rows: " + rows)

            const totalPages = Math.ceil(count / pageSize);

            return { count, totalPages, legislativeBills: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All contactList");
        }
    },

    findAllLegislativeBillsInNotice: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            const { count, rows } = await LegislativeBills.findAndCountAll({
                where: {legislativeSentStatus: 'inNotice'},
                offset,
                limit,
                order: [['id', 'ASC']],
                include: [
                    {
                        model: Sessions,
                        as: 'session',
                        attributes: ['sessionName']
                    },
                    {
                        model: BillStatuses,
                        as: 'billStatuses'
                    }
                ],
            });

            console.log("rows: " + rows)

            const totalPages = Math.ceil(count / pageSize);

            return { count, totalPages, legislativeBills: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All contactList");
        }
    },
    // Create A New LegislativeBill
    createLegislativeBill: async (req) => {

        try {
            const legislativeBill = await LegislativeBills.create(req);

            return legislativeBill;
        } catch (error) {
            throw { message: error.message || "Error Creating legislative Bill" };
        }
    },

 // Send To Legislation
 sendToLegislation: async(req,billId) => {
    try {
        const updatedData = {
            legislativeSentStatus: "toLegislation",
            legislativeSentDate: req.legislativeSentDate
        }
        await LegislativeBills.update(updatedData, { where: { id: billId } });

        // Fetch the updated private member bill which is sent to legislation
        const billData = await LegislativeBills.findOne({ where: { id: billId } });
        return billData;
    } catch (error) {
        throw { message: error.message || "Error Sending Legislative Bill To Legislation!" };
    }
},
    // Retrieve Single LegislativeBill
    findSinlgeLegislativeBill: async (legislativeBillId) => {
        try {
            const legislativeBill = await LegislativeBills.findOne({
                where: { id: legislativeBillId },
                order: [['id', 'ASC']],
                include: [
                    {
                        model: Sessions,
                        as: 'session',
                        attributes: ['id', 'sessionName']
                    },
                    {
                        model: BillStatuses,
                        as: 'billStatuses'
                    }
                ],
            });
            if (!legislativeBill) {
                throw ({ message: "legislative Bill Not Found!" })
            }
            return legislativeBill;
        }
        catch (error) {
            throw { message: error.message || "Error Fetching Single legislative Bill" };
        }
    },

    // Retrieve all LegislativeBill by web_id
    findAllLegislativeBillsByWebId: async (webId) => {
        try {
            const legislativeBill = await LegislativeBills.findAll({
                where: { web_id: webId },
                include: [
                    {
                        model: Sessions,
                        as: 'session',
                        attributes: ['id', 'sessionName']
                    },
                    {
                        model: BillStatuses,
                        as: 'billStatuses'
                    }
                ],
                order: [['createdAt', 'DESC']]
            });
            if (!legislativeBill) {
                throw ({ message: "legislative Bill Not Found!" })
            }
            return legislativeBill;
        }
        catch (error) {
            throw { message: error.message || "Error Fetching legislative Bill by web_id" };
        }
    },

    // Update LegislativeBill
    updateLegislativeBill: async (legislativeBillId, req) => {
        try {
            // console.log("req", req.body)
            await LegislativeBills.update(req.body, { where: { id: legislativeBillId } });

            const updatedLegislativeBill = await LegislativeBills.findOne({
                where: { id: legislativeBillId },
            }, { raw: true });

            return updatedLegislativeBill;

        } catch (error) {
            throw { message: error.message || 'Error updating LegislativeBill' };
        }
    },


    // Delete LegislativeBill
    deleteLegislativeBill: async (req) => {
        try {
            const updatedData = {
                isActive: "inactive"
            }

            await LegislativeBills.update(updatedData, { where: { id: req } });

            const updatedLegislativeBill = await LegislativeBills.findByPk(req, { raw: true });

            return updatedLegislativeBill;

        } catch (error) {
            throw { message: error.message || "Error deleting Legislative Bill" };
        }
    }






}

module.exports = legislativeBillService