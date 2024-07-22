const researchServices = require('../services/researchServices.service');
const logger = require('../common/winston');
const db = require("../models");
const ResearchServices = db.researchServices;
const researchServiceController = {

    // Create and Save a new Research Service
    createResearchServices: async (req, res) => {
        try {
            //console.log("controller route", req)
            const researchServiceData = await researchServices.createResearchServices(req.body);
            logger.info("research Service Created Successfully!");
            return res.status(200).send({
                success: true,
                message: "Submitted",
                data: researchServiceData,
            })
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

     // Retrieve all All Research Service by web_id
     findAllResearchServiceByWebId: async (req, res) => {
        try {
            logger.info(`req.query.web_id--- ${req.query.web_id}`);
            const webId = req.query.web_id;
            const researchServiceData = await researchServices.findAllResearchServiceByWebId(webId);
            logger.info("All researchServiceData Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "All research services fetched successfully!",
                data: { researchServiceData },
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Retrieves All Research Services
    findAllResearchServices: async (req, res) => {
        try {
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const isActive = req.query.isActive ? req.query.isActive : null
           // console.log("req", currentPage, pageSize);
            const { count, totalPages, researchServiceData } = await researchServices.findAllResearchServices(currentPage, pageSize,isActive);

           // console.log("researchServiceData--->>", researchServiceData)

            if (researchServiceData.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: true,
                    message: 'No data found on this page!',
                    data: {researchServiceData}
                });
            }
            else {
                logger.info("All research Service Data Fetched Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "All research services fetched successfully!",
                    data: { researchServiceData, totalPages, count }
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

    // Retrieve Single Research Service
    findSinlgeResearchService: async (req, res) => {
        try {
            const researchServiceId = req.params.id
            const researchServiceData = await researchServices.findSinlgeResearchService(researchServiceId);
            logger.info("Single Research Service Data Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "Single research service fetched successfully!",
                data: [researchServiceData],
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
    getResearchServicesStats: async (req, res) => {
        try {
            const researchService = await researchServices.getResearchServicesStats();
            logger.info("Research services stats retrieved successfully!")
            return res.status(200).send({
                success: true,
                message: "Research services stats retrieved successfully!",
                data: researchService
            })


        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message,

            })
        }
    },

    //   // Update the Research Service
    updateResearchService: async (req, res) => {
        try {
            console.log("Reg body",req.body)
            const researchServiceId = req.params.id;
            const researchServiceData = await ResearchServices.findByPk(researchServiceId);
            if (!researchServiceData) {
                return res.status(200).send({
                    success: false,
                    message: "Research service not found!"
                })
            }
            const updatedResearchService = await researchServices.updateResearchService(req.body, req.file, researchServiceId);
            logger.info("Research Service Data Updated Successfully!")
            return res.status(200).send({
                success: true,
                message: "Research service updated successfully!",
                data: updatedResearchService,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Delets/Suspend the Research Service
    deleteResearchService: async (req, res) => {
        try {
            const researchServiceId = req.params.id;
            const researchServiceData = await ResearchServices.findByPk(researchServiceId);
            if (!researchServiceData) {
                return res.status(200).send({
                    success: false,
                    message: "Research service data not found!"
                })
            }
            const deletedResearchService = await researchServices.deleteResearchService(researchServiceId);

            logger.info("Research Service Deleted Successfully!")
            return res.status(200).send({
                success: true,
                message: "Research service deleted successfully!",
                data: deletedResearchService,
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

module.exports = researchServiceController;