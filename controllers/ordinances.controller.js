const ordinanceService = require('../services/ordinances.service');
const logger = require('../common/winston');
const db = require("../models");
const Ordinances = db.ordinances;
const ordinanceController = {

    // Create a new Ordinance
    createOrdinance: async (req, res) => {
        try {
            const ordinanceData = req.body;
            const createdOrdinanceData = await ordinanceService.createOrdinance(ordinanceData);
            logger.info("Ordinance Created Successfully!");
            return res.status(200).send({
                success: true,
                message: "Ordinance Created Successfully!",
                data: createdOrdinanceData,
            })
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Retrieves All Ordinances
    findAllOrdinances: async (req, res) => {
        try {
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const { count, totalPages, ordinance } = await ordinanceService.findAllOrdinances(currentPage, pageSize);

            logger.info("ordinance--->>", ordinance)

            if (ordinance.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: true,
                    message: 'No data found on this page!'
                });
            }
            else {
                logger.info("All ordinances Fetched Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "All ordinances Fetched Successfully!",
                    data: { ordinance, totalPages, count }
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

    // search All Ordinances
    searchAllOrdinance: async (req, res) => {
        try {
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const { count, totalPages, ordinance } = await ordinanceService.searchAllOrdinance(req.query, currentPage, pageSize);

            logger.info("ordinance--->>", ordinance)

            if (ordinance.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: true,
                    message: 'No data found on this page!'
                });
            }
            else {
                logger.info("All ordinances Fetched Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "All ordinances Fetched Successfully!",
                    data: { ordinance, totalPages, count }
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

    // Retrieve Single Ordinance
    findSinlgeOrdinance: async (req, res) => {
        try {
            const ordinanceId = req.params.id
            const ordinance = await ordinanceService.findSinlgeOrdinance(ordinanceId);
            logger.info("Single Ordinance Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "Single Ordinance Fetched Successfully!",
                data: [ordinance],
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Update Ordinance
    updateOrdinance: async (req, res) => {
        try {
            const ordinanceId = req.params.id;
            const updatedData = req.body;
            const ordinance = await Ordinances.findByPk(ordinanceId);
            if (!ordinance) {
                return res.status(200).send({
                    success: true,
                    message: "Ordinance Not Found!",
                })
            }
            const updatedOrdinance = await ordinanceService.updateOrdinance(updatedData, ordinanceId);
            if (updatedOrdinance) {
                if (req.files && req.files.length > 0) {
                    const newAttachmentObjects = req.files.map((file, index) => {
                        const path = file.destination.replace('./public/', '/public/') + file.originalname;
                        const id = index + 1;
                        return JSON.stringify({ id, path });
                    });

                    // Merge existing image objects with the new ones
                    const updatedImages = [...newAttachmentObjects];

                    const [numberOfAffectedRows, affectedRows] = await Ordinances.update(
                        {
                            file: updatedImages,
                        },
                        {
                            where: { id: ordinanceId }
                        }
                    );

                }

                const updatedOrdinance = await Ordinances.findOne({ where: { id: ordinanceId } });

                if (updatedOrdinance && updatedOrdinance.file) {
                    updatedOrdinance.file = updatedOrdinance.file.map(imageString => JSON.parse(imageString));
                }


                logger.info("Ordinance Updated Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "Ordinance Updated Successfully!",
                    data: updatedOrdinance,
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

    // Delets/Suspend the Ordinance
    deleteOrdinance: async (req, res) => {
        try {
            const ordinanceId = req.params.id;
            const ordinance = await Ordinances.findByPk(ordinanceId);
            if (!ordinance) {
                return res.status(200).send({
                    success: true,
                    message: "senate Bill Not Found!",
                })
            }
            const deletedOrdinance = await ordinanceService.deleteOrdinance(ordinanceId);

            logger.info("Senate Ordinance Deleted Successfully!")
            return res.status(200).send({
                success: true,
                message: "Senate Ordinance Deleted Successfully!",
                data: deletedOrdinance,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    }
}

module.exports = ordinanceController;