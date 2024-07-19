const db = require("../models");
const Terms = db.terms;
const Tenures = db.tenures
const Op = db.Sequelize.Op;
const logger = require('../common/winston');

const termsService = {

    // Create Term
    createTerm: async (req) => {
        try {
            // Create the Term and save it in the database
            const term = await Terms.create(req);
            return term;
        } catch (error) {
            throw { message: error.message || "Error Creating Term!" };

        }
    },

    // Get All Terms
    getAllTerms: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const { count, rows } = await Terms.findAndCountAll({
                include :[
                    {
                        model: Tenures,
                        attributes: ['id','tenureName']
                    }
                ],
                offset,
                limit,
                order: [
                    ['id','DESC']
                ]
            });
            const totalPages = Math.ceil(count / pageSize);
            return { count, totalPages, terms: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All Terms");
        }
    },


    // Get Single Term
    getSingleTerm: async (termId) => {
        try {

            const term = await Terms.findOne({ where: { id: termId },
                include :[
                    {
                        model: Tenures,
                        attributes: ['id','tenureName']
                    }
                ]
            });
            if (!term) {
                throw ({ message: "Term Not Found!" })
            }
            return term;
        } catch (error) {
            throw new Error(error.message || "Error Fetching Term");

        }
    },

    // Update Term
    updateTerm: async (req, termId) => {
        try {
            await Terms.update(req, { where: { id: termId } });
            // Fetch the updated term after the update
            const updatedTerm = await Terms.findOne({ where: { id: termId } });
            return updatedTerm;
        } catch (error) {
            throw { message: error.message || "Error Updating Term!" };
        }
    },

    // Delete Term
    deleteTerm: async (termId) => {
        try {
            const updatedData =
            {
                status: "inactive"
            }
            await Terms.update(updatedData, { where: { id: termId } });
            // Fetch the updated term after the update
            const deletedTerm = await Terms.findOne({ where: { id: termId } });
            return deletedTerm;
        } catch (error) {
            throw { message: error.message || "Error Deleting Term!" };
        }
    }

}

module.exports = termsService
