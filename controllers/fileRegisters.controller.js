
const fileRegistersService = require('../services/fileRegisters.service');
const logger = require('../common/winston');
const db = require("../models");
const branches = db.branches;
const mainHeadingFiles = db.mainHeadingFiles
const Op = db.Sequelize.Op;

const fileRegistersController = {
    // Create and Save a new File Register
    createFileRegister: async (req, res) => {
        try {
            const { body } = req
            logger.info(`fileRegistersController: createMainHeading id ${JSON.stringify(req.params.id)} and body ${JSON.stringify(body)}`)
            const fileRegister = await fileRegistersService.createFileRegister(body);
            return res.status(200).send({
                success: true,
                message: "File Register Created Successfully!",
                data: fileRegister,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Retrieve All Main Headings
    findAllFileRegisters: async (req, res) => {
        try {
            logger.info(`fileRegistersController: findAllFileRegisters id ${JSON.stringify(req.params)} and query ${JSON.stringify(req.query)}`)
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const branchId = parseInt(req.params.branchId)
            const { count, totalPages, fileRegisters } = await fileRegistersService.findAllFileRegisters(branchId, currentPage, pageSize);
            // Check if there are no complaints on the current page
            if (fileRegisters.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: false,
                    message: 'No data found on this page!',
                    data: []
                });
            }
            logger.info("File Registers Fetched Successfully!!");
            return res.status(200).send({
                success: true,
                message: "File Registers Fetched Successfully!",
                data: {
                    fileRegisters,
                    totalPages,
                    count
                }
            });

        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            });
        }

    },

    // Get Single File Register
    findSingleFileRegister: async (req, res) => {
        try {
            logger.info(`fileRegistersController: findSingleFileRegister id ${JSON.stringify(req.params)}`)
            const registerId = req.params.id;
            const fileRegisters = await fileRegistersService.findSingleFileRegister(registerId);
            // Check if there are no complaints on the current page
            logger.info("File Register Fetched Successfully!!");
            return res.status(200).send({
                success: true,
                message: "File Register Fetched Successfully!",
                data: fileRegisters,
            });

        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            });
        }

    },

    updateFileRegister: async (req, res) => {
        try {
            const { id } = req.params;
            const { body } = req;
    
            // Log the incoming request details
            logger.info(`fileRegistersController: updateFileRegister id ${JSON.stringify(id)} and body ${JSON.stringify(body)}`);
    
            // Call the service function to update the file register
            const updatedFileRegister = await fileRegistersService.updateFileRegister(id, body);
    
            // Return a success response
            return res.status(200).send({
                success: true,
                message: "File Register Updated Successfully!",
                data: updatedFileRegister,
            });
        } catch (error) {
            // Log the error message
            logger.error(error.message);
    
            // Return an error response
            return res.status(400).send({
                success: false,
                message: error.message,
            });
        }
    },

    // Controller Function: Delete File Register
deleteFileRegister: async (req, res) => {
    try {
        const { id } = req.params;
        logger.info(`fileRegistersController: deleteFileRegister id ${JSON.stringify(id)}`);

        const result = await fileRegistersService.deleteFileRegister(id);

        return res.status(200).send({
            success: true,
            message: "File Register Inactive Successfully!",
            data: result,
        });
    } catch (error) {
        logger.error(error.message);
        return res.status(400).send({
            success: false,
            message: error.message,
        });
    }
},

}

module.exports = fileRegistersController;
