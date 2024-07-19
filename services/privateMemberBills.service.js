const db = require("../models");
const PrivateMemberBills = db.privateMemberBills;
const Branches = db.branches;
const { Op } = require('sequelize');
const logger = require('../common/winston');

const privateMemberBillService = {


    // Retrieve All PrivateMemberBills
    findAllPrivateMemberBills: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            const { count, rows } = await PrivateMemberBills.findAndCountAll({
                offset,
                limit,
                order: [['id', 'ASC']],
                include: [
                    {
                        model: Branches,
                        as: 'branch',
                        attributes: ['branchName', 'description', 'branchStatus'],
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



    // Update PrivateMemberBill
    updatePrivateMemberBill: async (privateMemberBill, fkBrancheId) => {
        try {

            if (privateMemberBill.fkBranchesId) {
                throw { message: 'This business is already assigned to another Branch.' };
            } else {
                privateMemberBill.fkBranchesId = fkBrancheId;

                // Save the changes
                await privateMemberBill.save();

                return { message: 'PrivateMemberBill updated successfully!' };
            }




        } catch (error) {
            throw { message: error.message || "Error Updating PrivateMemberBill" };
        }
    },






}

module.exports = privateMemberBillService