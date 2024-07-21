const db = require("../models");
const ManageSessions = db.manageSessions;
const Sessions = db.sessions
const SessionAttendance = db.sessionAttendances
const Members = db.members
const MainHeadingFiles = db.mainHeadingFiles
const Branches = db.branches
const Op = db.Sequelize.Op;
const logger = require('../common/winston');

const mainHeadingFileService = {

    // Create  Single Session Sitting
    createMainHeading: async (req) => {
        try {
            const existingHeadingNumber = await MainHeadingFiles.findOne({
                where: { mainHeadingNumber: req.mainHeadingNumber }
            });
            if (existingHeadingNumber) {
                throw new Error('Main Heading Number already exists.');
            }
            // Create the main heading for a file and save it in the database
            const mainHeadingFile = await MainHeadingFiles.create(req);
            return mainHeadingFile;
        } catch (error) {
            throw { message: error.message || "Error Creating Main Heading For A File!" };

        }
    },

    findAllMainHeadings: async (branchId, currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const { count, rows } = await MainHeadingFiles.findAndCountAll({
                where: { fkBranchId: branchId },
                include: [
                    {
                        model: Branches,
                        as: 'branches',
                        attributes: ['id', 'branchName']
                    }
                ],

                offset,
                limit,
                order: [
                    ['mainHeadingNumber', 'ASC'],
                ],
            });
            const totalPages = Math.ceil(count / pageSize);
            return { count, totalPages, mainHeadings: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching Main Headings");
        }

    },


    // Retrieve Main Heading On the basis of Branch
    findMainHeadingsByBranchId: async (branchId) => {
        try {
            const headings = await MainHeadingFiles.findAll({
                where: { fkBranchId: branchId },
                include: [
                    {
                        model: Branches,
                        as: 'branches',
                        attributes: ['id', 'branchName']
                    },
                ]
            })
            return headings
        } catch (error) {
            throw new Error(error.message || "Error Fetching Headings By Branch ");
        }
    },

    // Retrieve Main Heading Number On the basis of Main Heading Id
    findHeadingNumberByHeadingId: async (headingId) => {
        try {
            const headings = await MainHeadingFiles.findAll({
                where: { id: headingId },
            })
            return headings
        } catch (error) {
            throw new Error(error.message || "Error Fetching Headings By Main Heading Id ");
        }
    },


    // Get Single Main Heading
    findSingleMainHeading: async (mainHeadingId) => {
        try {
            console.log(mainHeadingId)
            const mainHeading = await MainHeadingFiles.findOne({
                where: { id: mainHeadingId },
                include: [
                    {
                        model: Branches,
                        as: 'branches',
                        attributes: ['id', 'branchName']
                    }
                ]
            });
            return mainHeading;
        } catch (error) {
            throw new Error(error.message || "Error Fetching Main Heading");

        }
    },

    // Update Main Heading
    updateMainHeading: async (req, mainHeadingId) => {
        try {
            await MainHeadingFiles.update(req, { where: { id: mainHeadingId } });
            // Fetch the updated manage heading after the update
            const updatedHeading = await MainHeadingFiles.findOne({
                where: { id: mainHeadingId },
                include: [
                    {
                        model: Branches,
                        as: 'branches',
                        attributes: ['id', 'branchName']
                    },
                ],
            });
            return updatedHeading;
        } catch (error) {
            throw { message: error.message || "Error Updating Main Heading!" };
        }
    },

    // Delete Main Heading
    deleteMainHeading: async (mainHeadingId) => {
        try {
            const updatedData = {
                status: "inactive"
            }
            await MainHeadingFiles.update(updatedData, { where: { id: mainHeadingId } });
            // Fetch the updated main heading after the update
            const updatedHeading = await MainHeadingFiles.findOne({
                where: { id: mainHeadingId },
                include: [
                    {
                        model: Branches,
                        as: 'branches',
                        attributes: ['id', 'branchName']
                    },
                ],
            });
            return updatedHeading;
        } catch (error) {
            throw { message: error.message || "Error Deleting Main Heading!" };
        }
    },





}

module.exports = mainHeadingFileService