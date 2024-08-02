const db = require("../models");
const ManageCommitteeRecomendations = db.manageCommitteeRecomendations;
const Users = db.users;
const Op = db.Sequelize.Op;
const logger = require('../common/winston');


const ManageCommitteeRecomendationService = {
    // Create A New Manage Committees Recomendation
    createManageCommitteeRecomendations: async (req) => {
        try {

            const manageCommitteeRecomendation = await ManageCommitteeRecomendations.create(req);

            return manageCommitteeRecomendation;
        } catch (error) {
            throw { message: error.message || "Error Creating Manage Committees Recomendation" };

        }
    },

    // Retrieve All Manage Committees Recomendation
    findAllManageCommitteeRecomendations: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            const { count, rows } = await ManageCommitteeRecomendations.findAndCountAll({
                offset,
                limit,
                order: [['id', 'DESC']],
            });

            console.log("rows: " + rows)

            const totalPages = Math.ceil(count / pageSize);

            return { count, totalPages, manageCommitteeRecomendation: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All Manage Committees Recomendations");
        }
    },

    // Retrieve Single Manage Committee Recomendation
    findSingleManageCommitteeRecomendations: async (committeeRecommendationId) => {
        try {
            const manageCommitteeRecomendation = await ManageCommitteeRecomendations.findOne({
                where: { id: committeeRecommendationId },
            });
            if (!committeeRecommendationId) {
                throw ({ message: "committee recomendation Status Not Found!" })
            }
            return manageCommitteeRecomendation;
        }
        catch (error) {
            throw { message: error.message || "Error Fetching Single Manage Committee Recomendation" };
        }
    },

    // Update Manage Committee Recomendation
    updateManageCommitteeRecomendations: async (req, committeeRecommendationId) => {
        try {

            await ManageCommitteeRecomendations.update(req.body, { where: { id: committeeRecommendationId } });

            // Fetch the updated Manage Committee Recomendation after the update
            const updatedManageCommitteeRecomendation = await ManageCommitteeRecomendations.findOne({
                where: { id: committeeRecommendationId }, 
            }, { raw: true });

            return updatedManageCommitteeRecomendation;

        } catch (error) {
            throw { message: error.message || "Error Updating Manage Committee Recomendation" };
        }
    },

      // Delete Manage Committee Recomendation
      deleteManageCommitteeRecomendation: async (req) => {
        try {

            const updatedData = {
                committeeStatus: "inactive"
            }

            await ManageCommitteeRecomendations.update(updatedData, { where: { id: req } });

            // Fetch the updated Manage Committee Recomendation after the update
            const updatedManageCommitteeRecomendation = await ManageCommitteeRecomendations.findByPk(req, { raw: true });

            return updatedManageCommitteeRecomendation;


        } catch (error) {
            throw { message: error.message || "Error deleting Manage Committee Recomendation" };
        }
    }


}

module.exports = ManageCommitteeRecomendationService