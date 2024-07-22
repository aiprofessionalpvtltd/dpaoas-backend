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

            let imageObjects = [];
            if (req.files && req.files.length > 0) {
                imageObjects = req.files.map((file, index) => {
                    const path = file.destination.replace('./public/', '/assets/') + file.originalname;
                    const id = index + 1;
                    return JSON.stringify({ id, path });
                });
            }

            const existingResolution = await Resolution.findOne({ where: { id: resolution.id } });
            const existingImages = existingResolution ? existingResolution.attachment || [] : [];
            const updatedImages = [...existingImages, ...imageObjects];

            try {
                // Your code to update the database
                await Resolution.update(
                    {
                        attachment: updatedImages,
                    },
                    {
                        where: { id: resolution.dataValues.id }
                    }
                );
                const updatedResolution = await Resolution.findOne({ where: { id: resolution.id } });
                logger.info("Resolution submitted!")
                return res.status(200).send({
                    success: true,
                    message: "Submitted",
                    data: updatedResolution,
                })
            } catch (error) {
                console.error("Error updating attachment:", error);
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
            const resolutionSentStatus = req.query.resolutionSentStatus ? req.query.resolutionSentStatus : null;
            const { count, totalPages, resolution } = await resolutionService.findAllResolution(currentPage, pageSize, resolutionSentStatus);

            if (resolution.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: true,
                    message: 'No data found on this page!',
                    data: { resolution }
                });
            }
            else {
                logger.info("All Resolution Fetched Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "All resolution fetched successfully!",
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

    findAllResolutionInNotice: async (req, res) => {
        try {
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const { count, totalPages, resolution } = await resolutionService.findAllResolutionInNotice(currentPage, pageSize);
            if (resolution.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: true,
                    message: 'No data found on this page!',
                    data: { resolution }
                });
            }
            else {
                logger.info("All Resolution In Notice Fetched Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "All Resolution In Notice Fetched Successfully!",
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

    // Retrieves Resolutions by IDs
    pdfResolutionList: async (req, res) => {
        try {

            const resolutionIds = req.body;

            if (!Array.isArray(resolutionIds) || resolutionIds.length === 0) {
                return res.status(400).send({
                    success: false,
                    message: "Invalid resolution IDs array!"
                });
            }

            const resolutions = await resolutionService.pdfResolutionList(resolutionIds);

            if (resolutions.length === 0) {
                logger.info("No data found for the provided resolution IDs!")
                return res.status(200).send({
                    success: true,
                    message: 'No data found for the provided resolution IDs!',
                    data: { resolutions }
                });
            } else {
                logger.info("Resolutions fetched successfully by IDs!")
                return res.status(200).send({
                    success: true,
                    message: "Resolutions fetched successfully by IDs!",
                    data: { resolutions }
                });
            }

        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            });
        }
    },

    // Retrieves counts and data of resolutions by status
    getResolutionsByStatus: async (req, res) => {
        try {
            const statuses = ['inResolution', 'toResolution'];
            const result = await resolutionService.getResolutionsByStatus(statuses);

            return res.status(200).send({
                success: true,
                message: "Resolutions fetched successfully!",
                data: result
            });
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            });
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
                    message: "Resolution statuses fetched successfully!",
                    data: resolutionStatuses,
                })
            }
            else {
                logger.info("No Data Found!")
                return res.status(200).send({
                    success: true,
                    message: "No data found!",

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
                    success: true,
                    message: "Resolution not found!",
                    data: null
                })
            }
            const updatedResolution = await resolutionService.updateResolution(req, resolutionId, resolution);
            if (updatedResolution) {

                if (req.files && req.files.length > 0) {

                    const newAttachmentObjects = req.files.map((file, index) => {
                        const path = file.destination.replace('./public/', '/assets/') + file.originalname;
                        const id = index + 1;
                        return JSON.stringify({ id, path });
                    });

                    // Merge existing image objects with the new ones
                    const updatedImages = [...newAttachmentObjects];

                    await Resolution.update(
                        {
                            attachment: updatedImages,
                        },
                        {
                            where: { id: resolutionId }
                        }
                    );
                }

                const updatedResolutionData = await Resolution.findOne({ where: { id: resolutionId } });
                if (updatedResolutionData && updatedResolutionData.attachment) {
                    updatedResolutionData.attachment = updatedResolutionData.attachment.map(imageString => JSON.parse(imageString));
                }


                logger.info("Resolution Updated Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "Resolution updated successfully!",
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
                message: "Single resolution fetched successfully!",
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

    // Retrieve all Resolution status summary
    findAllResolutionsSummary: async (req, res) => {
        try {
            const { fromSessionId, toSessionId, currentPage, pageSize } = req.query;
            const resolutionStatusCounts = await resolutionService.findAllResolutionsSummary(fromSessionId, toSessionId, currentPage, pageSize);
            logger.info("resolution Status Counts Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "Resolution status counts fetched successfully!",
                data: resolutionStatusCounts
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    getAllResolutionLists: async (req, res) => {
        try {
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);

            const { count, totalPages, resolutionList } = await resolutionService.getAllResolutionLists(currentPage, pageSize);
            
            if (resolutionList.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: true,
                    message: 'No data found on this page!',
                    data: { resolutionList }
                });
            }
            else {
                logger.info("All Resolution List Fetched Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "All resolution list fetched successfully!",
                    data: { resolutionList, totalPages, count }
                })
            }

        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            });
        }
    },

    // delete Resolution List
    deleteResolutionList: async (req, res) => {
        try {
            const resolutionListId = req.params.id
            const result = await resolutionService.deleteResolutionList(resolutionListId);
            logger.info("Resolution list deleted successfully!")
            return res.status(200).send({
                success: true,
                message: "Resolution list deleted successfully!",
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Create Resolution List and get all Resolutions
    createResolutionListAndAssociateResolutions: async (req, res) => {
        try {
            const payload = req.body;
            const createdResolutionList = await resolutionService.createResolutionListAndAssociateResolutions(payload);
            logger.info("Resolution list created and resolutions associated successfully!")
            return res.status(200).send({
                success: true,
                message: "Resolution list created and resolutions associated successfully!",
                data: [createdResolutionList]
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Update Resolution List and get all Resolutions
    updateResolutionListAndAssociations: async (req, res) => {
        try {
            const payload = req.body;
            const updatedResolutionList = await resolutionService.updateResolutionListAndAssociations(payload);
            logger.info("Resolution list updated and resolutions associated successfully!");
            return res.status(200).send({
                success: true,
                message: "Resolution list updated and resolutions associated successfully!",
                data: [updatedResolutionList]
            });
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            });
        }
    },

    generateResolutionListData: async (req, res) => {
        try {
            const payload = req.body;
            const resolutionListData = await resolutionService.generateResolutionListData(payload);
            logger.info("Resolution list data generated successfully!")
            return res.status(200).send({
                success: true,
                message: "Resolution list data generated successfully!",
                data: [resolutionListData]
            });
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            });
        }
    },

    getSingleResolutionData: async (req, res) => {
        try {
            const resolutionListId = req.params.id
            const resolutionListData = await resolutionService.getSingleResolutionData(resolutionListId);
            logger.info("Single Resolution list data generated successfully!")
            return res.status(200).send({
                success: true,
                message: "Single Resolution list data generated successfully!",
                data: [resolutionListData]
            });
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            });
        }
    },

    // Retrieve all Resolution by web_id
    findAllResolutionsByWebId: async (req, res) => {
        try {
            const webId = req.query.web_id;
            const resolution = await resolutionService.findAllResolutionsByWebId(webId);
            resolution.forEach(resolution => {
                resolution.attachment = JSON.parse(resolution.attachment[0]);
            });
            logger.info("Resolutions fetched successfully!")
            return res.status(200).send({
                success: true,
                message: "Resolutions fetched successfully!",
                data: { resolution },
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
                if (resolutions.length > 0) {
                    logger.info("Searched Successfully!");
                    return res.status(200).send({
                        success: true,
                        message: "Resolution search results!",
                        data: {
                            resolutions,
                            count,
                            totalPages

                        },
                    });
                }
                else {
                    logger.info("Data not found!");
                    return res.status(200).send({
                        success: true,
                        message: "Data not found!",
                        data: { resolutions },
                    });
                }
            }
            else {
                logger.info("Data Not Found!");
                return res.status(200).send({
                    success: false,
                    message: "Data not found!",
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

    // Annual Report
    searchResolutionAnnualReport: async (req, res) => {
        try {
            if (Object.keys(req.query).length !== 0) {
                const currentPage = parseInt(req.query.currentPage);
                const pageSize = parseInt(req.query.pageSize);
                const { count, totalPages, resolutions } = await resolutionService.searchResolutionAnnualReportService(req.query, currentPage, pageSize);
                if (resolutions.length > 0) {
                    logger.info("Searched Successfully!");
                    return res.status(200).send({
                        success: true,
                        message: "Resolution search results!",
                        data: {
                            resolutions,
                            count,
                            totalPages

                        },
                    });
                }
                else {
                    logger.info("Data not found!");
                    return res.status(200).send({
                        success: true,
                        message: "Data not found!",
                        data: { resolutions },
                    });
                }
            }
            else {
                logger.info("Data Not Found!");
                return res.status(200).send({
                    success: false,
                    message: "Data not found!",
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

    // Search Inactive Resolution
    searchInactiveResolution: async (req, res) => {
        try {
            if (Object.keys(req.query).length !== 0) {
                const currentPage = parseInt(req.query.currentPage);
                const pageSize = parseInt(req.query.pageSize);
                const { count, totalPages, resolutions } = await resolutionService.searchInactiveResolution(req.query, currentPage, pageSize);
                if (resolutions.length > 0) {
                    logger.info("Searched Successfully!");
                    return res.status(200).send({
                        success: true,
                        message: "Resolution search results!",
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
                        success: true,
                        message: "Data not found!",
                        data: [],
                    });
                }
            }
            else {
                logger.info("Data Not Found!");
                return res.status(200).send({
                    success: false,
                    message: "Data not found!",
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
                    success: true,
                    message: "Resolution not found!",
                    data: null
                })
            }
            const updatedResolution = await resolutionService.sendTranslation(resolutionId);
            logger.info("Resolution Sent To Translation Branch Successfully!")
            return res.status(200).send({
                success: true,
                message: "Resolution sent to translation branch successfully!",
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

    // Send To Resolution
    sendToResolution: async (req, res) => {
        try {
            const resolutionId = req.params.id;
            const resolution = await Resolution.findByPk(resolutionId);
            if (!resolution) {
                return res.status(200).send({
                    success: true,
                    message: "Resolution Not Found!",
                    data: null
                })
            }
            const updatedResolution = await resolutionService.sendToResolution(req.body, resolutionId);
            logger.info("Resolution sent to concerned branch successfully!")
            return res.status(200).send({
                success: true,
                message: "Resolution sent to concerned branch successfully!",
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
            const { description, deletedByUser } = req.body;

            const resolution = await Resolution.findByPk(resolutionId);
            if (!resolution) {
                return res.status(200).send({
                    success: true,
                    message: "Resolution not found!",
                    data: null
                });
            }
            const deleteResolution = await resolutionService.deleteResolution(resolutionId, description, deletedByUser);
            logger.info("Resolution Deleted Successfully!")
            return res.status(200).send({
                success: true,
                message: "Resolution deleted successfully!",
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

    // Re-Active Resolution
    reActiveResolution: async (req, res) => {
        try {
            const resolutionId = req.params.id;
            const resolution = await Resolution.findByPk(resolutionId);
            if (!resolution) {
                return res.status(200).send({
                    success: true,
                    message: "Resolution not found!",
                    data: null
                });
            }
            const reActiveResolution = await resolutionService.reActiveResolution(resolutionId);
            logger.info("Resolution Re-Activated Successfully!")
            return res.status(200).send({
                success: true,
                message: "Resolution re-Activated successfully!",
                data: reActiveResolution,
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