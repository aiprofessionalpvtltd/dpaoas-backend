const db = require("../models");
const ManageCommittees = db.manageCommittees;
const Users = db.users;
const Op = db.Sequelize.Op;
const logger = require('../common/winston');


const ManageCommitteesService = {
    // Create A New Manage Committees
    createManageCommittees: async (req) => {
        try {

            const manageCommittees = await ManageCommittees.create(req);

            return manageCommittees;
        } catch (error) {
            throw { message: error.message || "Error Creating Manage Committees" };

        }
    },

    // Retrieve All Manage Committees
    findAllManageCommittees: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            const { count, rows } = await ManageCommittees.findAndCountAll({
                offset,
                limit,
            });

            console.log("rows: " + rows)

            const totalPages = Math.ceil(count / pageSize);

            return { count, totalPages, manageCommittees: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All Manage Committees");
        }
    },

    // Retrieve Single Manage Committee
    findSingleManageCommittee: async (manageCommitteeId) => {
        try {
            const manageCommittee = await ManageCommittees.findOne({
                where: { id: manageCommitteeId },
            });
            if (!manageCommittee) {
                throw ({ message: "bill Status Not Found!" })
            }
            return manageCommittee;
        }
        catch (error) {
            throw { message: error.message || "Error Fetching Single Manage Committee" };
        }
    },

    // Update Manage Committee
    updatemanageCommittee: async (req, manageCommitteeId) => {
        try {

            await ManageCommittees.update(req.body, { where: { id: manageCommitteeId } });

            // Fetch the updated Manage Committee after the update
            const updatedManageCommittee = await ManageCommittees.findOne({
                where: { id: manageCommitteeId }, 
            }, { raw: true });

            return updatedManageCommittee;

        } catch (error) {
            throw { message: error.message || "Error Updating Manage Committee" };
        }
    },

      // Delete Manage Committee
      deleteManageCommittee: async (req) => {
        try {

            const updatedData = {
                committeeStatus: "inactive"
            }

            await ManageCommittees.update(updatedData, { where: { id: req } });

            // Fetch the updated Manage Committee after the update
            const updatedManageCommittee = await ManageCommittees.findByPk(req, { raw: true });

            return updatedManageCommittee;


        } catch (error) {
            throw { message: error.message || "Error deleting Manage Committee" };
        }
    }


}

module.exports = ManageCommitteesService