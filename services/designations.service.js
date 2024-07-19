const db = require("../models");
const Designations = db.designations;
const Op = db.Sequelize.Op;
const logger = require('../common/winston');

const designationsService = {
    // Create A New Designation
    createDesignation: async (req) => {
        try {
            // Create the designation and save it in the database
            const designation = await Designations.create(req);
            return designation;
        } catch (error) {
            throw { message: error.message || "Error Creating Designation!" };

        }
    },

    // Retrieve All Designations
    findAllDesignations: async (currentPage, pageSize) => {
        try {
            const offset = currentPage  * pageSize;
            const limit = pageSize;

            const { count, rows } = await Designations.findAndCountAll({
                offset,
                limit,
                order: [
                    ['id','DESC']
                ]
            });

            const totalPages = Math.ceil(count / pageSize);
            return { count, totalPages, designations: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All Designations");
        }
    },

    // Search Designations: 
    searchDesignations: async (searchQuery, queryOptions) => {
        try {
            if (searchQuery) {
                whereCondition = {
                    designationName: { [Op.like]: `%${searchQuery}%` }
                };
            }
            queryOptions.where = whereCondition;
            const designations = await Designations.findAll(queryOptions);
            return designations;
        } catch (error) {
            throw { message: error.message || "Error Searching Designations" };
        }
    },

    // Retrieve Single Designation
    findSingleDesignation: async (designationId) => {
        try {
            const designation = await Designations.findOne({ where: { id: designationId } });
            if (!designation) {
                throw ({ message: "Designation Not Found!" })
            }
            return designation;
        }
        catch (error) {
            throw { message: error.message || "Error Fetching Single Designation!" };
        }
    },

    // Updates Designation
    updateDesignation: async (req, designationId) => {
        try {
            console.log("Request",req)
            await Designations.update(req, { where: { id: designationId } });
            // Fetch the updated designation after the update
            const updatedDesignation = await Designations.findOne({ where: { id: designationId } });
            console.log("Up",updatedDesignation)
            return updatedDesignation;
        } catch (error) {
            throw { message: error.message || "Error Updating Designation!" };
        }
    },

    // Deletes/Suspend Designation
    deleteDesignation: async (designationId) => {
        try {
            const updatedData =
            {
                designationStatus: "inactive"
            }
            await Designations.update(updatedData, { where: { id: designationId } });
            // Fetch the updated designation after the update
            const updateDesignation = await Designations.findOne({ where: { id: designationId } });
            return updateDesignation;

        } catch (error) {
            throw { message: error.message || "Error Suspending Designation!" };
        }
    }
}

module.exports = designationsService