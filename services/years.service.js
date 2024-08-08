const db = require("../models");
const Years = db.years;
const Op = db.Sequelize.Op;
const logger = require('../common/winston');

const yearsService = {

    // Create Year
    createYear: async (req) => {
        try {
            // Create the Year and save it in the database
            const year = await Years.create(req);
            return year;
        } catch (error) {
            throw { message: error.message || "Error Creating Year!" };

        }
    },

    // Get All Years
    getAllYears: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const { count, rows } = await Years.findAndCountAll({
                offset,
                limit,
                order: [
                    ['id','DESC']
                ]
            });
            const totalPages = Math.ceil(count / pageSize);
            return { count, totalPages, years: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All Years");
        }
    },


    // Get Single Year
    getSingleYear: async (yearId) => {
        try {

            const year = await Years.findOne({ where: { id: yearId }
             });
            if (!year) {
                throw ({ message: "Year Not Found!" })
            }
            return year;
        } catch (error) {
            throw new Error(error.message || "Error Fetching Year");

        }
    },

    // Update Year
    updateYear: async (req, yearId) => {
        try {
            await Years.update(req, { where: { id: yearId } });
            // Fetch the updated year after the update
            const updatedYear = await Years.findOne({ where: { id: yearId } });
            return updatedYear;
        } catch (error) {
            throw { message: error.message || "Error Updating Year!" };
        }
    },

    // Delete Year
    deleteYear: async (yearId) => {
        try {
            const updatedData =
            {
                status: "inactive"
            }
            await Years.update(updatedData, { where: { id: yearId } });
            // Fetch the updated tenur after the update
            const deletedYear = await Years.findOne({ where: { id: yearId } });
            return deletedYear;
        } catch (error) {
            throw { message: error.message || "Error Deleting Year!" };
        }
    }

}

module.exports = yearsService
