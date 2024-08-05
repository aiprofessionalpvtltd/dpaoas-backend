const mnaService = require('../services/mnas.service');
const logger = require('../common/winston');
const db = require("../models");
const MNAs = db.mnas;
const mnaController = {



    // Create a new MNA
    createMNAs: async (req, res) => {
        try {
            const { mnaData, ministryIds } = req.body;

            // Validate input data
            if (!mnaData || !ministryIds) {
                return res.status(400).send({
                    success: false,
                    message: "MNA data and Ministry IDs are required"
                });
            }

            const result = await mnaService.createMNAs({ mnaData, ministryIds });

            logger.info("MNA and Ministries Associations Created Successfully!");
            return res.status(200).send({
                success: true,
                message: "MNA and Ministries Associations Created Successfully!",
                data: result,
            });
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            });
        }
    },

    // Retrieves All MNAs
    findAllMNAs: async (req, res) => {
        try {
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const { count, totalPages, mnas } = await mnaService.findAllMNAs(currentPage, pageSize);

            logger.info("mnas--->>", mnas)

            if (mnas.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: false,
                    message: 'No data found on this page!'
                });
            }
            else {
                logger.info("All mnas Fetched Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "All mnas Fetched Successfully!",
                    data: { mnas, totalPages, count }
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

    // Fetch ministries related to a specific MNA
    findAllMinistriesByMnaId: async (req, res) => {
        try {
            const mnaId = req.params.mnaId;
            const ministries = await mnaService.findAllMinistriesByMnaId(mnaId);

            logger.info("ministries--->>", ministries)

            if (ministries.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: false,
                    message: 'No data found on this page!'
                });
            }
            else {
                logger.info("All ministries Fetched Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "All ministries Fetched Successfully!",
                    data: { ministries }
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

    // Retrieve Single MNA
    findSinlgeMNA: async (req, res) => {
        try {
            const mnnaId = req.params.id
            const mnna = await mnaService.findSinlgeMNA(mnnaId);
            logger.info("Single mnna Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "Single mnna Fetched Successfully!",
                data: [mnna],
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Update MNA Data
    updateMnaData: async (req, res) => {
        try {
            const mnaId = req.params.id;

            const updatedMnaData = await mnaService.updateMnaData(req, mnaId);

            logger.info("MNA Data Updated Successfully!");
            return res.status(200).send({
                success: true,
                message: "MNA Data Updated Successfully!",
                data: updatedMnaData,
            });
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            });
        }
    },

    // Delets/Suspend the MNA
    deleteMna: async (req, res) => {
        try {
            const mnnaId = req.params.id;
            const mna = await MNAs.findByPk(mnnaId);
            if (!mna) {
                return res.status(200).send({
                    success: false,
                    message: "mna Not Found!",
                })
            }
            const deletedMna = await mnaService.deleteMna(mnnaId);

            logger.info("MNA Data Deleted Successfully!")
            return res.status(200).send({
                success: true,
                message: "MNA Data Deleted Successfully!",
                data: deletedMna,
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

module.exports = mnaController;