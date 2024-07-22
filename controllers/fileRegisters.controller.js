
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

    }

    // Retrieve Main Heading Number On the basis of Main Heading Id
    // findHeadingNumberByHeadingId: async (req, res) => {
    //     try {
    //         logger.info(`mainHeadingFileController: findHeadingNumberByHeadingId id ${JSON.stringify(req.params.id)}`)
    //         const headingId = req.params.id;
    //         const mainHeadings = await mainHeadingFileService.findHeadingNumberByHeadingId(headingId)
    //         return res.status(200).send({
    //             success: true,
    //             message: `Main Headings Numbers fetched successfully for Heading id ${headingId}`,
    //             data: mainHeadings,
    //         })
    //     }
    //     catch (error) {
    //         logger.error(error.message);
    //         return res.status(400).send({
    //             success: false,
    //             message: error.message
    //         });


    //     }
    // },





    // Retrieve Single Branch
    // findSingleBranch: async (req, res) => {
    //     const { params } = req
    //     const { id } = params
    //     logger.info(`branchesController: findSingleBranch for Id ${id}`)
    //     const motionRecord = await branchesService.findSingleBranch(id)
    //     if (motionRecord) {
    //         return res.status(200).send({
    //             success: true,
    //             message: `Branch fetched successfully for id ${id}`,
    //             data: motionRecord,
    //         })
    //     }
    //     return res.status(400).send({
    //         success: false,
    //         message: `No record found for id ${id}`,
    //         data: {},
    //     })
    // },

    // Updates the Branch
    // updateBranch: async (req, res) => {
    //     try {
    //         const { body } = req
    //         logger.info(`branchesController: updateBranch body ${JSON.stringify(body)}`)
    //         const branch = await branchesService.updateBranch(req);
    //         return res.status(200).send({
    //             success: true,
    //             message: "Branch Updated Successfully!",
    //             data: branch,
    //         })
    //     } catch (error) {
    //         logger.error(error.message)
    //         return res.status(400).send({
    //             success: false,
    //             message: error.message
    //         })
    //     }
    // },

    // Delete/Suspend the Branch
    // suspendBranch: async (req, res) => {
    //     try {
    //         const { params } = req
    //         const { id } = params
    //         logger.info(`branchesController: suspendBranch for Id ${id}`)
    //         const branch = await branchesService.suspendBranch(req);
    //         return res.status(200).send({
    //             success: true,
    //             message: "Branch Suspend/Deleted Successfully!",
    //             data: branch,
    //         })
    //     } catch (error) {
    //         logger.error(error.message)
    //         return res.status(400).send({
    //             success: false,
    //             message: error.message
    //         })
    //     }
    // },

}

module.exports = fileRegistersController;
