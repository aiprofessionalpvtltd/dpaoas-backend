const speechOnDemandsService = require('../services/speechOnDemands.service');
const memberController = require('./senate-public.controller')
const logger = require('../common/winston');
const db = require("../models");
const SpeechOnDemands = db.speechOnDemands;
const path = require('path');
const fs = require('fs');
const { validationResult } = require('express-validator')
const SenatorPublicService = require('../services/senate-public.services')
const {
    validationErrorResponse,
    validResponse,
    errorResponse,
} = require('../common/validation-responses')

const speechOnDemandController = {

    // Create and Save a new SpeechOnDemand
    createSpeechOnDemands: async (req, res) => {
        try {
            //  console.log("controller route", req)
            const speechOnDemand = await speechOnDemandsService.createSpeechOnDemands(req.body);
            logger.info("speechOnDemand Created Successfully!");
            return res.status(200).send({
                success: true,
                message: "Submitted",
                data: speechOnDemand,
            })
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Retrieves All SpeechOnDemands
    findAllSpeechOnDemands: async (req, res) => {
        try {
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const isActive = req.query.isActive ? req.query.isActive : null
            const { count, totalPages, speechOnDemand } = await speechOnDemandsService.findAllSpeechOnDemands(currentPage, pageSize, isActive);

            if (speechOnDemand.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: true,
                    message: 'No data found on this page!',
                    data: { speechOnDemand }
                });
            }
            else {
                logger.info("All speechOnDemand Fetched Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "All Speech on demand fetched successfully!",
                    data: { speechOnDemand, totalPages, count }
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

    // Retrieve all All SpeechOnDemands by web_id
    findAllSpeechOnDemandsByWebId: async (req, res) => {
        try {
            logger.info(`req.query.web_id--- ${req.query.web_id}`);
            const webId = req.query.web_id;
            const speechOnDemand = await speechOnDemandsService.findAllSpeechOnDemandsByWebId(webId);
            logger.info("All SpeechOnDemands Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "All Speech on demand fetched successfully!",
                data: { speechOnDemand },
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    getAllMembers: async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

        const { winston, db } = req
        logger.info(`SenatorController: getAllMembers`)
        const service = new SenatorPublicService(db, logger)
        try {
            const result = await service.getAllMembers()
            return result
        } catch (error) {
            winston.error(
                `Error occurred on SenatorController: getAllMembers ${error}`,
            )
            return errorResponse(res, error)
        }
    },

    // Retrieve Single SpeechOnDemand
    findSinlgeSpeechOnDemands: async (req, res) => {
        try {
            const speechOnDemandId = req.params.id
            const speechOnDemand = await speechOnDemandsService.findSinlgeSpeechOnDemands(speechOnDemandId);
            const members = await speechOnDemandController.getAllMembers({ req, res: null });
            const matchingMember = members.find(member => member.websiteId === speechOnDemand.web_id);
            const memberName = matchingMember.memberName
            pdfData = await speechOnDemandsService.createProforma(speechOnDemand, memberName);
            const buffer = Buffer.from(pdfData);
            const fileName = `output_${Date.now()}.pdf`;
            const pdfDirectory = path.join(__dirname, '..', 'pdfDownload');
            if (!fs.existsSync(pdfDirectory)) {
                fs.mkdirSync(pdfDirectory, { recursive: true });
            }
            const filePathh = path.join(pdfDirectory, fileName);
            fs.writeFileSync(filePathh, buffer);
            const fileLink = `/assets/${fileName}`;
            logger.info("Single speechOnDemand Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "Single Speech on demand fetched successfully!",
                data: { speechOnDemand, fileLink }
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    //   // Update the SpeechOnDemand
    updateSpeechOnDemand: async (req, res) => {
        try {
            const speechOnDemandId = req.params.id;
            const speechOnDemand = await SpeechOnDemands.findByPk(speechOnDemandId);
            if (!speechOnDemand) {
                return res.status(200).send({
                    success: true,
                    message: "speechOnDemand Not Found!"
                })
            }
            const updatedSpeechOnDemand = await speechOnDemandsService.updateSpeechOnDemand(req, speechOnDemandId);
            console.log(updatedSpeechOnDemand)
            logger.info("SpeechOnDemand Updated Successfully!")
            return res.status(200).send({
                success: true,
                message: "Speech on demand updated successfully!",
                data: updatedSpeechOnDemand,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Delets/Suspend the SpeechOnDemand
    deleteSpeechOnDemand: async (req, res) => {
        try {
            const speechOnDemandId = req.params.id;
            const speechOnDemand = await SpeechOnDemands.findByPk(speechOnDemandId);
            if (!speechOnDemand) {
                return res.status(200).send({
                    success: true,
                    message: "SpeechOnDemand Not Found!"
                })
            }
            const deletedSpeechOnDemand = await speechOnDemandsService.deleteSpeechOnDemand(speechOnDemandId);

            logger.info("SpeechOnDemand Deleted Successfully!")
            return res.status(200).send({
                success: true,
                message: "Speech on demand deleted successfully!",
                data: deletedSpeechOnDemand,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Dashboard SpechOnDemand Stats
    getSpeechOnDemandsStats: async (req, res) => {
        try {

            const speechOnDemand = await speechOnDemandsService.getSpeechOnDemandsStats();
            logger.info("Speech on demand stats retrieved successfully!")
            return res.status(200).send({
                success: true,
                message: "Speech on demand stats retrieved successfully!",
                data: speechOnDemand
            })


        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message,

            })
        }
    },
}

module.exports = speechOnDemandController;