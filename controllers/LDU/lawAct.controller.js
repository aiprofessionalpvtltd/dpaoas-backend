// controllers/lawAct.controller.js

const lawActService = require('../../services/LDU/lawAct.service');
const logger = require('../../common/winston');
const db = require("../../models");
const LawAct = db.lawAct;

const lawActController = {
    // Retrieve All LawActs
    findAllLawActs: async (req, res) => {
        try {
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const { count, totalPages, lawActs } = await lawActService.findAllLawActs(currentPage, pageSize);

            if (lawActs.length === 0) {
                logger.info("No data found on this page!");
                return res.status(200).send({
                    success: false,
                    message: 'No data found on this page!',
                    data: { lawActs }
                });
            } else {
                logger.info("All law acts fetched successfully!");
                return res.status(200).send({
                    success: true,
                    message: "All law acts fetched successfully!",
                    data: { lawActs, totalPages, count }
                });
            }
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message,
            });
        }
    },

    // Create LawAct
    createLawAct: async (req, res) => {
        try {
            const lawAct = await lawActService.createLawAct(req.body);
            return res.status(200).send({
                success: true,
                message: "Law act created successfully!",
                data: lawAct,
            });
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message,
            });
        }
    },

    // Retrieve Single LawAct
    findSingleLawAct: async (req, res) => {
        try {
            const lawActId = req.params.id;
            const lawAct = await lawActService.findSingleLawAct(lawActId);
            return res.status(200).send({
                success: true,
                message: "Law act fetched successfully!",
                data: [lawAct],
            });
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message,
            });
        }
    },

    // Update LawAct
    updateLawAct: async (req, res) => {
        try {
            const lawActId = req.params.id;
            const updatedLawAct = await lawActService.updateLawAct(lawActId, req);
            return res.status(200).send({
                success: true,
                message: "Law act updated successfully!",
                data: updatedLawAct,
            });
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message,
            });
        }
    },

    // Delete LawAct (soft delete)
    deleteLawAct: async (req, res) => {
        try {
            const lawActId = req.params.id;
            const deletedLawAct = await lawActService.deleteLawAct(lawActId);
            return res.status(200).send({
                success: true,
                message: "Law act deleted successfully!",
                data: deletedLawAct,
            });
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message,
            });
        }
    }
};

module.exports = lawActController;