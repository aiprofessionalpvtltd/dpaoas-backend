const db = require("../models");
const BillStatuses = db.billStatuses;
const Users = db.users;
const Op = db.Sequelize.Op;
const logger = require('../common/winston');


const BillStatusService = { 
    // Create A New bill Status
    createBillStatus: async (req) => {
        try {

            const billStatus = await BillStatuses.create(req);

            return billStatus;
        } catch (error) {
            throw { message: error.message || "Error Creating bill Status" };

        }
    },

    // Retrieve All Bill Statuses
    findAllBillStatuses: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            const { count, rows } = await BillStatuses.findAndCountAll({
              offset,
              limit,
              order: [["id", "DESC"]],
            });

            console.log("rows: " + rows)

            const totalPages = Math.ceil(count / pageSize);

            return { count, totalPages, billStatus: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All bill Statuses");
        }
    },

    // Retrieve Single bill Status
    findSinlgeBillStatus: async (billStatusId) => {
        try {
            const billStatus = await BillStatuses.findOne({
                where: { id: billStatusId },
            });
            if (!billStatus) {
                throw ({ message: "bill Status Not Found!" })
            }
            return billStatus;
        }
        catch (error) {
            throw { message: error.message || "Error Fetching Single bill Status" };
        }
    },

    // Update Bill Status
    updateBillStatus: async (req, billStatusId) => {
        try {

            await BillStatuses.update(req.body, { where: { id: billStatusId } });

            // Fetch the updated Bill Status after the update
            const updatedBillStatus = await BillStatuses.findOne({
                where: { id: billStatusId }, 
            }, { raw: true });

            return updatedBillStatus;

        } catch (error) {
            throw { message: error.message || "Error Updating Bill Status" };
        }
    },

      // Delete Bill Status
      deleteBillStatus: async (req) => {
        try {

            const updatedData = {
                billStatus: "inactive"
            }

            await BillStatuses.update(updatedData, { where: { id: req } });

            // Fetch the updated Bill Status after the update
            const updatedBillStatus = await BillStatuses.findByPk(req, { raw: true });

            return updatedBillStatus;


        } catch (error) {
            throw { message: error.message || "Error deleting Bill Status" };
        }
    }


}

module.exports = BillStatusService