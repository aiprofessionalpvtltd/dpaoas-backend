const ministriesService = require("../services/ministries.service");
const logger = require('../common/winston');
const db = require("../models");
const Ministries = db.ministries;
const MinistriesController = {

    createMinistry: async (req, res) => {
        try {
            console.log("req", req.body);
            const ministry = await ministriesService.createMinistry(req.body);
            logger.info("Ministry created successfully!");
            return res.status(200).send({
                success: true,
                message: "Ministry created successfully!",
                data: ministry,
            })
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    getAllMinistries: async (req, res) => {
        try {
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const { count, totalPages, ministries } = await ministriesService.getAllMinistries(currentPage, pageSize);

            if (ministries.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: true,
                    message: 'No data found on this page!'
                });
            }
            else {
                logger.info("All ministries Fetched Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "All ministries Fetched Successfully!",
                    data: { ministries, totalPages, count }
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

    getMinistryById: async (req, res) => {
        try {
            const ministryId = req.params.id
            console.log("ministry", ministryId)
            const ministry = await ministriesService.getMinistryById(ministryId);
            logger.info("Single ministry Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "Single ministry Fetched Successfully!",
                data: [ministry],
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    updateMinistry: async (req, res) => {
        try {
            const ministryId = req.params.id;
            const ministry = await Ministries.findByPk(ministryId);
            if (!ministry) {
                return res.status(200).send({
                    success: true,
                    message: "ministry Not Found!",
                    data: null
                })
            }
            const updatedMinistry = await ministriesService.updateMinistry(req, ministryId);
            logger.info("Ministry updated successfully!")
            return res.status(200).send({
                success: true,
                message: "Ministry updated successfully!",
                data: updatedMinistry,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    deleteMinistry: async (req, res) => {
        try {
            const ministryId = req.params.id;
            const ministry = await Ministries.findByPk(ministryId);
            if (!ministry) {
                return res.status(200).send({
                    success: true,
                    message: "ministry Not Found!",
                    data: null
                })
            }
            const deletedMinistry = await ministriesService.deleteMinistry(ministryId);

            logger.info("Ministry deleted successfully!")
            return res.status(200).send({
                success: true,
                message: "Ministry deleted successfully!",
                data: deletedMinistry,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    getMinistriesByTenure: async (req, res) => {
        try {
            const { fkTenureId } = req.params;
    
            if (!fkTenureId) {
                return res.status(400).json({ message: "fkTenureId is required." });
            }
    
            const ministries = await ministriesService.getMinistriesByTenure(fkTenureId);
    
            if (ministries.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: true,
                    message: 'No data found on this page!'
                });
            }
            else {
                logger.info("All ministries Fetched Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "All ministries Fetched Successfully!",
                    data: ministries
                })
            }
        }  catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message,

            })
        }
    }
}
module.exports = MinistriesController; 