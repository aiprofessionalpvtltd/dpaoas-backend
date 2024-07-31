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
                where: {
                //    registerNumber: req.registerNumber,
                    year: req.year,
                    fkBranchId: req.fkBranchId,
                }
            });

            if (existingRegister) {
                throw new Error('Register is already created of this year');
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

    // Find Single File Register
    findSingleFileRegister: async (registerId) => {
        try {
            const result = await FileRegisters.findOne({
                raw: false,
                where: {
                    id: registerId
                }, include: [{
                    model: Branches,
                    as: 'branches',
                    attributes: ['id', 'branchName']
                }]
            })
            return result
        } catch (error) {
            console.error('Error Fetching File Register request:', error.message);
        }
    },

    updateFileRegister: async (id, updateData) => {
        try {
            // Check if the file register exists
            const fileRegister = await FileRegisters.findByPk(id);
            if (!fileRegister) {
                throw new Error('File Register not found');
            }
    
            // Check if there is an existing register with the same year and branch ID (excluding the current register being updated)
            const existingRegisterNumber = await FileRegisters.findOne({
                where: {
                    registerNumber: updateData.registerNumber,
                    year: updateData.year,
                    fkBranchId: updateData.fkBranchId,
                    id: {
                        [Op.ne]: id
                    }
                }
            });
            if (existingRegisterNumber) {
                throw new Error('Register Number is already created for same year  in the same branch');
            }
    
            // Update the file register
            await fileRegister.update(updateData);
    
            // Return the updated file register
            return fileRegister;
        } catch (error) {
            // Throw the error with a custom message
            throw { message: error.message || "Error Updating File Register!" };
        }
    },


     
}

module.exports = fileRegistersService