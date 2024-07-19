const resolutionService = require('../services/resolution.service')
const logger = require('../common/winston')
const db = require("../models");
const Resolution = db.resolutions;

const resolutionController = {

    // Create An Resolution
    createResolution: async (req, res) => {
        try {
            // const url = req.protocol + '://' + req.get('host')
            const body = req.body;
            const resolution = await resolutionService.createResolution(body);
            if (req.files && req.files.length > 0) {
                const paths = req.files.map(file => {
                    const path = file.destination.replace('./public/', '/public/');
                    return `${path}/${file.originalname}`;
                });
                try {
                    // Your code to update the database
                    await Resolution.update(
                        {
                            attachment: paths,
                        },
                        {
                            where: { id: resolution.dataValues.id }
                        }
                    );
                    const updatedResolution = await Resolution.findOne({ where: { id: resolution.id } });
                    logger.info("Resolution Created Successfully!")
                    return res.status(200).send({
                        success: true,
                        message: "Resolution Created Successfully!",
                        data: updatedResolution,
                    })
                } catch (error) {
                    console.error("Error updating attachment:", error);
                }
            }
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message,
            });
        }
    },

    // Retrieves All Resolution
    findAllResolution: async (req, res) => {
        try {
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const { count, totalPages, resolution } = await resolutionService.findAllResolution(currentPage, pageSize);

            if (resolution.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: false,
                    message: 'No data found on this page!'
                });
            }
            else {
                logger.info("All Resolution Fetched Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "All Resolution Fetched Successfully!",
                    data: { resolution, totalPages, count }
                })
            }

        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message,

            })
        }
    },

    // Get Resolution Statuses
    getResolutionStatuses: async (req, res) => {
        try {

            const resolutionStatuses = await resolutionService.getResolutionStatuses()
            if (resolutionStatuses) {
                logger.info("Resolution Statuses Fetched Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "Resolution Statuses Fetched Successfully!",
                    data: resolutionStatuses,
                })
            }
            else {
                logger.info("No Data Found!")
                return res.status(200).send({
                    success: true,
                    message: "No Data Found!",

                })
            }

        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })

        }
    },

    // Update Resolution
    updateResolution: async (req, res) => {
        try {
            const resolutionId = req.params.id;
            const resolution = await Resolution.findByPk(resolutionId);
            if (!resolution) {
                return res.status(200).send({
                    success: false,
                    message: "Resolution Not Found!",
                    data: null
                })
            }
            const updatedResolution = await resolutionService.updateResolution(req, resolutionId, resolution);
            if (updatedResolution) {
                if (req.files && req.files.length > 0) {
                    const attachmentPaths = req.files.map(file => {
                      const path = file.destination.replace('./public/', '/public/') + `/${file.originalname}`;
                      return path;
                    });
                    try {
                        // Your code to update the database
                        await Resolution.update(
                            {
                                attachment: attachmentPaths,
                            },
                            {
                                where: { id: resolutionId }
                            }
                        );
                    } catch (error) {
                        console.error("Error updating attachment:", error);
                    }
                }
                const updatedResolutionData = await Resolution.findOne({ where: { id: resolutionId } });
                logger.info("Resolution Updated Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "Resolution Updated Successfully!",
                    data: updatedResolutionData,
                })
            }
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Retrieve Single Resolution
    findSingleResolution: async (req, res) => {
        try {
            const resolutionId = req.params.id
            const resolutionData = await resolutionService.findSingleResolution(resolutionId);
            logger.info("Single Resolution Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "Single Resolution Fetched Successfully!",
                data: resolutionData,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Search Resolution
    searchResolution: async (req, res) => {
        try {
            if (Object.keys(req.query).length !== 0) {
                const currentPage = parseInt(req.query.currentPage);
        const pageSize = parseInt(req.query.pageSize);
        const { count, totalPages, resolutions } = await resolutionService.searchResolution(req.query, currentPage, pageSize);

              //  const searchResolutionData = await resolutionService.searchResolution(req.query)
                if (resolutions.length > 0) {
                    logger.info("Searched Successfully!");
                    return res.status(200).send({
                        success: true,
                        message: "Resolution Search Results!",
                        data: {
                            resolutions,
                            count,
                            totalPages
                            
                        },
                    });
                }
                else {
                    logger.info("Data Not Found!");
                    return res.status(200).send({
                        success: false,
                        message: "Data Not Found!",
                        data: searchResolutionData,
                    });
                }
            }
            else {
                logger.info("Data Not Found!");
                return res.status(200).send({
                    success: false,
                    message: "Data Not Found!",
                    data: [],
                });
            }

        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message,

            })
        }
    },

    // Send For Translation
    sendTranslation: async (req, res) => {
        try {
            const resolutionId = req.params.id;
            const resolution = await Resolution.findByPk(resolutionId);
            if (!resolution) {
                return res.status(200).send({
                    success: false,
                    message: "Resolution Not Found!",
                    data: null
                })
            }
            const updatedResolution = await resolutionService.sendTranslation(resolutionId);
            logger.info("Resolution Sent To Translation Branch Successfully!")
            return res.status(200).send({
                success: true,
                message: "Resolution Sent To Translation Branch Successfully!",
                data: updatedResolution,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Delete Resolution
    deleteResolution: async (req, res) => {
        try {
            const resolutionId = req.params.id;
            const resolution = await Resolution.findByPk(resolutionId);
            if (!resolution) {
                return res.status(200).send({
                    success: false,
                    message: "Resolution Not Found!",
                    data: null
                });
            }
            const deleteResolution = await resolutionService.deleteResolution(resolutionId);
            logger.info("Resolution Deleted Successfully!")
            return res.status(200).send({
                success: true,
                message: "Resolution Deleted Successfully!",
                data: deleteResolution,
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




module.exports = resolutionController