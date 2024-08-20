const db = require("../models");
const Divisions = db.divisions;
const Groups = db.groups;
const GroupsDivisions = db.groupsDivisions;
const Ministries = db.ministries;
const Op = db.Sequelize.Op;
const logger = require('../common/winston');

const divisionsService = {

    // Create Division
    createDivision: async (req) => {
        try {
            // Create the Division and save it in the database
            const division = await Divisions.create(req);
            return division;
        } catch (error) {
            throw { message: error.message || "Error Creating Division!" };

        }
    },

    // Route to get group by division ID 
    groupByDivision: async (divisionId) => {
        try {
            // Fetch the group associated with the division
            const groupDivision = await GroupsDivisions.findOne({
                where: { fkDivisionId: divisionId },
                include: [{
                    model: Groups,
                    as: 'group'
                }]
            });
            return groupDivision;
        } catch (error) {
            throw { message: error.message || 'An error occurred while fetching the group' };

        }
    },



    // Get All Divisions
    getAllDivisions: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const { count, rows } = await Divisions.findAndCountAll({
                include: [
                    {
                        model: Ministries,
                        attributes: ['id', 'ministryName']
                    }
                ],
                offset,
                limit,
                order: [
                    ['id', 'DESC'],
                ],
            });
            const totalPages = Math.ceil(count / pageSize);
            return { count, totalPages, divisions: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All Divisions");
        }
    },


    // Get Single Division
    getSingleDivision: async (divisionId) => {
        try {

            const division = await Divisions.findOne({
                where: { id: divisionId },
                include: [
                    {
                        model: Ministries,
                        attributes: ['id', 'ministryName']
                    }
                ]
            });
            if (!division) {
                throw ({ message: "Division Not Found!" })
            }
            return division;
        } catch (error) {
            throw new Error(error.message || "Error Fetching Division");

        }
    },

    // Update Division
    updateDivision: async (req, divisionId) => {
        try {
            await Divisions.update(req, { where: { id: divisionId } });
            // Fetch the updated division after the update
            const updatedDivision = await Divisions.findOne({ where: { id: divisionId } });
            return updatedDivision;
        } catch (error) {
            throw { message: error.message || "Error Updating Division!" };
        }
    },

    // Delete Session
    deleteDivision: async (divisionId) => {
        try {
            const updatedData =
            {
                divisionStatus: "inactive"
            }
            await Divisions.update(updatedData, { where: { id: divisionId } });
            // Fetch the updated division after the update
            const deletedDivision = await Divisions.findOne({ where: { id: divisionId } });
            return deletedDivision;
        } catch (error) {
            throw { message: error.message || "Error Deleting Division!" };
        }
    }

}

module.exports = divisionsService
