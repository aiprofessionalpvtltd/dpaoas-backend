
const mainHeadingFileService = require('../services/mainHeadingFile.service');
const logger = require('../common/winston');
const db = require("../models");
const branches = db.branches;
const mainHeadingFiles = db.mainHeadingFiles
const Op = db.Sequelize.Op;

const mainHeadingFileController = {
    // Create and Save a new Main Heading For A File
    createMainHeading: async (req, res) => {
        try {
            const { body } = req
            logger.info(`mainHeadingFileController: createMainHeading body ${JSON.stringify(body)}`)
            const mainHeading = await mainHeadingFileService.createMainHeading(body);
            return res.status(200).send({
                success: true,
                message: "Main Heading For A File Created Successfully!",
                data: mainHeading,
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
    findAllMainHeadings: async(req,res) => {
        try {
            logger.info(`mainHeadingFileController: findAllMainHeadings query ${JSON.stringify(req.query)}`)
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const { count, totalPages, mainHeadings } = await mainHeadingFileService.findAllMainHeadings(currentPage, pageSize);
            // Check if there are no complaints on the current page
            if (mainHeadings.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: false,
                    message: 'No data found on this page!',
                    data: []
                });
            }
            logger.info("Main Headings Fetched Successfully!");
            return res.status(200).send({
                success: true,
                message: "Main Headings Fetched Successfully!",
                data: {
                    mainHeadings,
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

    // Retrieve Main Heading On the basis of Branch
    findMainHeadingsByBranchId: async (req, res) => {
        try {
            logger.info(`mainHeadingFileController: findMainHeadingsByBranchId id ${JSON.stringify(req.params.id)}`)
            const branchId = req.params.id;
            const mainHeadings = await mainHeadingFileService.findMainHeadingsByBranchId(branchId)
            return res.status(200).send({
                success: true,
                message: `Main Headings fetched successfully for Branch id ${branchId}`,
                data: mainHeadings,
            })
        }
        catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            });


        }
    },

    // Retrieve Main Heading Number On the basis of Main Heading Id
    findHeadingNumberByHeadingId: async (req, res) => {
        try {
            logger.info(`mainHeadingFileController: findHeadingNumberByHeadingId id ${JSON.stringify(req.params.id)}`)
            const headingId = req.params.id;
            const mainHeadings = await mainHeadingFileService.findHeadingNumberByHeadingId(headingId)
            return res.status(200).send({
                success: true,
                message: `Main Headings Numbers fetched successfully for Heading id ${headingId}`,
                data: mainHeadings,
            })
        }
        catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            });


        }
    },


     // Find Single Main Heading
    findSingleMainHeading: async (req, res) => {
        const mainHeadingId = req.params.id
        logger.info(`mainHeadingFileController: findSingleMainHeading for Id ${mainHeadingId}`)
        const mainHeading = await mainHeadingFileService.findSingleMainHeading(mainHeadingId)
        if (mainHeading) {
            logger.info("Main Heading Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "Main Heading Fetched Successfully!",
                data: mainHeading,
            })
        }
        return res.status(400).send({
            success: false,
            message: `No record found for id ${mainHeadingId}`,
            data: {},
        })
    },

    // Updates the Main Heaing
    updateMainHeading: async (req, res) => {
        try {
            
            logger.info(`mainHeadingFileController: updateMainHeading body ${JSON.stringify(req.body)} and id ${JSON.stringify(req.params.id)}`)
            const mainHeadingId = req.params.id
            const mainHeading = await mainHeadingFiles.findByPk(mainHeadingId)
            if(!mainHeading)
            {
                logger.info("Main Heading Not Found!")
                return res.status(200).send({
                    success: true,
                    message: "Main Heading Not Found!",
                })
            }
            const updatedMainHeading = await mainHeadingFileService.updateMainHeading(req.body,mainHeadingId);
            return res.status(200).send({
                success: true,
                message: "Main Heading Updated Successfully!",
                data: updatedMainHeading,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    //Delete/Suspend the Main Heading
    deleteMainHeading: async (req, res) => {
        try {
 
            logger.info(`mainHeadingFileController: deleteMainHeading  id ${JSON.stringify(req.params.id)}`)
            const mainHeadingId = req.params.id
            const mainHeading = await mainHeadingFiles.findByPk(mainHeadingId)
            if(!mainHeading)
            {
                logger.info("Main Heading Not Found!")
                return res.status(200).send({
                    success: true,
                    message: "Main Heading Not Found!",
                })
            }
            const deletedMainHeading = await mainHeadingFileService.deleteMainHeading(mainHeadingId);
            return res.status(200).send({
                success: true,
                message: "Main Heading Suspend/Deleted Successfully!",
                data: deletedMainHeading,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

}

module.exports = mainHeadingFileController;
