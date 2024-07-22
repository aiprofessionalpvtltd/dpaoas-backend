const mnaService = require('../services/mnas.service');
const logger = require('../common/winston');
const db = require("../models");
const MNAs = db.mnas;
const mnaController = {

    // Create a new MNA
    createMNAs: async (req, res) => {
        try {
            const mna = await mnaService.createMNAs(req.body);
            logger.info("mna Created Successfully!");
            return res.status(200).send({
                success: true,
                message: "mna Created Successfully!",
                data: mna,
            })
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            })
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

    // Update the MNA data
    updateMnaData: async (req, res) => {
        try {
            const mnnaId = req.params.id;
            const mna = await MNAs.findByPk(mnnaId);
            if (!mna) {
                return res.status(200).send({
                    success: false,
                    message: "mna Not Found!",
                })
            }
            const updatedMnaData = await mnaService.updateMnaData(req, mnnaId);
            logger.info("Mna Data Updated Successfully!")
            return res.status(200).send({
                success: true,
                message: "Mna Data Updated Successfully!",
                data: updatedMnaData,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
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