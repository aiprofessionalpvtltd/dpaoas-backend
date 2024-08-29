const db = require("../models");
const Tenures = db.tenures;
const Op = db.Sequelize.Op;
const logger = require('../common/winston');

const tenuresService = {

    // Create Tenure
    createTenure: async (req) => {
        try {
            // Create the Tenure and save it in the database
            const tenure = await Tenures.create(req);
            return tenure;
        } catch (error) {
            throw { message: error.message || "Error Creating Tenure!" };

        }
    },

    // Get All Tenures
    getAllTenures: async (currentPage, pageSize, tenureType) => {
        try {
            // Validate and sanitize pagination inputs
            const page = Math.max(parseInt(currentPage, 10) || 0, 0);
            const size = Math.min(parseInt(pageSize, 10) || 10, 100); // Assuming 100 is the max page size
            const offset = page * size;
            const limit = size;
    
            // Build the where condition dynamically
            const where = {};
            if (tenureType) {
                where.tenureType = tenureType;
            }
    
            // Execute the query
            const { count, rows } = await Tenures.findAndCountAll({
                offset,
                limit,
                where,
                order: [
                    ['id', 'DESC']
                ]
            });
    
            const totalPages = Math.ceil(count / size);
    
            return { count, totalPages, tenures: rows };
        } catch (error) {
            console.error("Error fetching tenures:", error);
            throw new Error(error.message || "Error Fetching All Tenures");
        }
    },
    


    // Get Single Tenure
    getSingleTenure: async (tenureId) => {
        try {

            const tenure = await Tenures.findOne({ where: { id: tenureId }
             });
            if (!tenure) {
                throw ({ message: "Tenure Not Found!" })
            }
            return tenure;
        } catch (error) {
            throw new Error(error.message || "Error Fetching Tenure");

        }
    },

    // Update Tenure
    updateTenure: async (req, tenureId) => {
        try {
            await Tenures.update(req, { where: { id: tenureId } });
            // Fetch the updated tenure after the update
            const updatedTenure = await Tenures.findOne({ where: { id: tenureId } });
            return updatedTenure;
        } catch (error) {
            throw { message: error.message || "Error Updating Tenure!" };
        }
    },

    // Delete Tenure
    deleteTenure: async (tenureId) => {
        try {
            const updatedData =
            {
                status: "inactive"
            }
            await Tenures.update(updatedData, { where: { id: tenureId } });
            // Fetch the updated tenur after the update
            const deletedTenure = await Tenures.findOne({ where: { id: tenureId } });
            return deletedTenure;
        } catch (error) {
            throw { message: error.message || "Error Deleting Tenure!" };
        }
    }

}

module.exports = tenuresService
