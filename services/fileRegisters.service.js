const db = require("../models");
const ManageSessions = db.manageSessions;
const Sessions = db.sessions
const SessionAttendance = db.sessionAttendances
const Members = db.members
const MainHeadingFiles = db.mainHeadingFiles
const Branches = db.branches
const FileRegisters = db.fileRegisters
const Op = db.Sequelize.Op;
const logger = require('../common/winston');

const fileRegistersService = {

    // Create  Single Session Sitting
    createFileRegister: async (req) => {
        try {
            // Create the file register
            const existingRegister = await FileRegisters.findOne({
                where: { registerNumber: req.registerNumber }
            });

            if (existingRegister) {
                throw new Error('Register Number is already assigned to another register');
            }
            const fileRegister = await FileRegisters.create(req);
            return fileRegister;
        } catch (error) {
            throw { message: error.message || "Error Creating File Register!" };

        }
    },

    findAllFileRegisters: async (branchId, currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const { count, rows } = await FileRegisters.findAndCountAll({
                where: {
                    fkBranchId: branchId
                },
                include: [
                    {
                        model: Branches,
                        as: 'branches',
                        attributes: ['id', 'branchName']
                    },
                ],

                offset,
                limit,
                distinct: true,
                order: [
                    ['id', 'ASC'],
                ],
            });
            const totalPages = Math.ceil(count / pageSize);
            return { count, totalPages, fileRegisters: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching Main Headings");
        }

    },


    // Retrieve Main Heading On the basis of Branch
    // findMainHeadingsByBranchId: async(branchId) => {
    //     try {
    //         const headings = await MainHeadingFiles.findAll({
    //             where: { fkBranchId: branchId },
    //             include: [
    //                 {
    //                     model: Branches,
    //                     as: 'branches',
    //                     attributes: ['id','branchName']
    //                 },
    //             ]
    //     })
    //         return headings
    //     } catch (error)
    //     {
    //         throw new Error(error.message || "Error Fetching Headings By Branch ");
    //     }
    // },


    // Get Single Session
    // getSingleSessionSitting: async (sessionSittingId) => {
    //     try {
    //         const session = await ManageSessions.findOne({
    //             where: { id: sessionSittingId },
    //             include: [
    //                 {
    //                     model: Sessions,
    //                     attributes: ['id', 'sessionName']
    //                 },
    //             ],
    //         });
    //         if (!session) {
    //             throw ({ message: "Session Sitting Not Found!" })
    //         }
    //         return session;
    //     } catch (error) {
    //         throw new Error(error.message || "Error Fetching Session Sitting");

    //     }
    // },

    // Update Session Sitting
    // updateSessionSitting: async (req, sessionSittingId) => {
    //     try {
    //         await ManageSessions.update(req, { where: { id: sessionSittingId } });
    //         // Fetch the updated session sitting after the update
    //         const updatedSession = await ManageSessions.findOne({
    //             where: { id: sessionSittingId },
    //             include: [
    //                 {
    //                     model: Sessions,
    //                     attributes: ['id', 'sessionName']
    //                 },
    //             ],
    //         });
    //         return updatedSession;
    //     } catch (error) {
    //         throw { message: error.message || "Error Updating Session Sitting!" };
    //     }
    // },

    // deleteSessionSitting: async (sessionSittingId) => {
    //     try {
    //         const updatedData = {
    //             status: "inactive"
    //         }
    //         await ManageSessions.update(updatedData, { where: { id: sessionSittingId } });
    //         // Fetch the updated session sitting after the update
    //         const updatedSession = await ManageSessions.findOne({
    //             where: { id: sessionSittingId },
    //             include: [
    //                 {
    //                     model: Sessions,
    //                     attributes: ['id', 'sessionName']
    //                 },
    //             ],
    //         });
    //         return updatedSession;
    //     } catch (error) {
    //         throw { message: error.message || "Error Deleting Session Sitting!" };
    //     }
    // },





}

module.exports = fileRegistersService