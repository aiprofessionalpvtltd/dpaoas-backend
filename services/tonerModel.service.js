const db = require("../models");

const TonerModels = db.tonerModels
const Op = db.Sequelize.Op;
const logger = require('../common/winston');

const tonerModelService = {

    // Create Toner Model
    createTonerModel: async (req) => {
        try {
            // Create the toner model and save it in the database
            const tonerModel = await TonerModels.create(req);
            return tonerModel;
        } catch (error) {
            throw { message: error.message || "Error Creating Toner Model!" };

        }
    },


    // Get All TonerModels
    getAllTonerModels: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const { count, rows } = await TonerModels.findAndCountAll({
                offset,
                limit,
                order: [
                    ['id', 'DESC'],
                ]
            });
            const totalPages = Math.ceil(count / pageSize);
            return { count, totalPages, tonerModels: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All TonerModels");
        }
    },


    // Get Single Toner Model
    getSingleTonerModel: async (tonerModelId) => {
        try {
            const tonerModel = await TonerModels.findOne({ where: { id: tonerModelId }});
            if (!tonerModel) {
                throw ({ message: "Toner Model Not Found!" })
            }
            return tonerModel;
        } catch (error) {
            throw new Error(error.message || "Error Fetching Toner Model");

        }
    },

    // Update Toner Model
    updateTonerModel: async(req, tonerModelId) =>
    {
        try {        
            await TonerModels.update(req, { where: { id: tonerModelId } });
            // Fetch the updated toner model after the update
            const updatedModel = await TonerModels.findOne({ where: { id: tonerModelId } });
            return updatedModel;
        }   catch(error) {
            throw { message: error.message || "Error Updating Toner Model!" };
        }
    },

    // Delete Toner Model
    deleteTonerModel: async(tonerModelId) =>
    {
        try {
        const updatedData = 
        {
            status: "inactive"
        }  
        await TonerModels.update(updatedData, { where: { id: tonerModelId } });
        // Fetch the updated toner model after the update
        const deletedModel = await TonerModels.findOne({ where: { id: tonerModelId } });
        return deletedModel;     
    }   catch (error)
    {
        throw { message: error.message || "Error Deleting Inventory Bill!" };
    }
    },

    // Search Inventory Bills
    searchTonerModel: async (searchCriteria) => {
        try {
            let queryOptions = {
                subQuery: false,
                distinct: true,
                where: {}
            };

            // Build the query options based on search criteria
            for (const key in searchCriteria) {

                if (key === 'tonerModel') {
                    queryOptions.where['$tonerModel$'] = { [Op.eq]: searchCriteria[key] };
                }
               
            }

            const tonerModels = await TonerModels.findAll(queryOptions);
            return tonerModels;
        } catch (error) {
            throw new Error(error.message || "Error Searching Toner Models");
        }
    },



}

module.exports = tonerModelService