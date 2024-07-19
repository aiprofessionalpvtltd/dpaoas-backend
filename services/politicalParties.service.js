const db = require("../models");
const PoliticalParties = db.politicalParties;
const Op = db.Sequelize.Op;
const logger = require('../common/winston');

const politicalPartiesSerivce = {

    // Create Political Party
    createPoliticalParty: async (req) => {
        try {
            // Create the Political Party and save it in the database
            const politicalParty = await PoliticalParties.create(req);
            return politicalParty;
        } catch (error) {
            throw { message: error.message || "Error Creating Political Party!" };

        }
    },

    // Get All Political Parties
    getAllPoliticalParties: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const { count, rows } = await PoliticalParties.findAndCountAll({
                offset,
                limit,
                order: [
                    ['id', 'DESC'],
                ]
            });
            const totalPages = Math.ceil(count / pageSize);
            return { count, totalPages, politicalParties: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All Political Parties");
        }
    },


    // Get Single Political Party
    getSinglePoliticalParty: async (politicalPartyId) => {
        try {

            const politicalParty = await PoliticalParties.findOne({ where: { id: politicalPartyId },
            });
            if (!politicalParty) {
                throw ({ message: "Political Party Not Found!" })
            }
            return politicalParty;
        } catch (error) {
            throw new Error(error.message || "Error Fetching Political Party");

        }
    },

    // Update Political Party
    updatePoliticalParty: async (req, politicalPartyId) => {
        try {
            await PoliticalParties.update(req, { where: { id: politicalPartyId } });
            // Fetch the updated political party after the update
            const updatedPolitcalParty = await PoliticalParties.findOne({ where: { id: politicalPartyId } });
            return updatedPolitcalParty;
        } catch (error) {
            throw { message: error.message || "Error Updating Politcal Party!" };
        }
    },

    // Delete Political Party
    deletePoliticalParty: async (politicalPartyId) => {
        try {
            const updatedData =
            {
                status: "inactive"
            }
            await PoliticalParties.update(updatedData, { where: { id: politicalPartyId } });
            // Fetch the updated political party after the update
            const deletedPoliticalParty = await PoliticalParties.findOne({ where: { id: politicalPartyId } });
            return deletedPoliticalParty;
        } catch (error) {
            throw { message: error.message || "Error Deleting Political Party!" };
        }
    }

}

module.exports = politicalPartiesSerivce
