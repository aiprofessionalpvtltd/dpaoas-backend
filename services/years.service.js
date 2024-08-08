const db = require("../models");
const Year = db.years;
const Op = db.Sequelize.Op;
const logger = require('../common/winston');

const yearsService = {

    // Create Year
    createYear: async (yearData) => {
        try {
            // Check if the year already exists
            const existingYear = await Year.findOne({ where: { year: yearData.year } });
            if (existingYear) {
              throw new Error('Year already exists!');
            }
        
            // Create and save the new year
            const year = await Year.create(yearData);
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
            const { count, rows } = await Year.findAndCountAll({
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

            const year = await Year.findOne({ where: { id: yearId }
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
    updateYear: async (yearData, yearId) => {
        try {
            // Check if the new year value already exists for another record
            const existingYear = await Year.findOne({ where: { year: yearData.year, id: { [Op.ne]: yearId } } });
            if (existingYear) {
              throw new Error('Year already exists!');
            }
        
            // Update the year
            await Year.update(yearData, { where: { id: yearId } });
        
            // Fetch the updated year after the update
            const updatedYear = await Year.findOne({ where: { id: yearId } });
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
            await Year.update(updatedData, { where: { id: yearId } });
            // Fetch the updated tenur after the update
            const deletedYear = await Year.findOne({ where: { id: yearId } });
            return deletedYear;
        } catch (error) {
            throw { message: error.message || "Error Deleting Year!" };
        }
    }

}

module.exports = yearsService
