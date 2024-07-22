const passService = require('../services/passes.service')
const visitorService = require('../services/visitors.service')
const logger = require('../common/winston');
const path = require('path');
const db = require("../models");
const fs = require('fs');
const Pass = db.passes;
const passController = {

    //Create A New Pass
    createPass: async (req, res) => {
        try {
            const body = req.body;
            const pass = await passService.createPass(body);
            logger.info("Pass Created Successfully!")
            return res.status(200).send({
                success: true,
                message: "Pass Created Successfully!",
                data: pass,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // PDF Data
    getPDFData: async (req, res) => {
        try {
            const passId = req.params.id;
            const passData = await passService.getPDFData(passId);
            const pdfData = await passService.generatePDF(passData)

            const buffer = Buffer.from(pdfData);

            const fileName = `output_${Date.now()}.pdf`;
   
            const pdfDirectory = path.join(__dirname, '..', 'pdfDownload');

            if (!fs.existsSync(pdfDirectory)) {
                fs.mkdirSync(pdfDirectory, { recursive: true });
            }

            const filePathh = path.join(pdfDirectory, fileName);
            fs.writeFileSync(filePathh, buffer);

            // Provide a link
            const fileLink = `/assets/${fileName}`;


            logger.info("PDF Generated And Sent Successfully!")
            return res.status(200).send({
                success: true,
                message: "PDF Generated Successfully!",
                data: {
                    fileLink,
                },
            });

        }
        catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }

    },

    // Retrieve All Passes
    findAllPasses: async (req, res) => {
        try {
            // Parsing query parameters for pagination
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
      
            const { count, totalPages, passes } = await passService.findAllPasses(currentPage, pageSize);
      
            // Check if there are no departments on the current page
            if (passes.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: false,
                    message: 'No data found on this page!'
                });
            }
            logger.info("All Passes Fetched Successfully!");
            return res.status(200).send({
                success: true,
                message: "All Passes Fetched Successfully!",
                data: passes,
                totalPages,
                count
            });

        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            });
        }
    },

    searchPasses: async (req, res) => {
        try {
            const searchQuery = req.query.search; // Get search query from request parameters
            const queryOptions = {};
            const searchedPass = await passService.searchPasses(searchQuery, queryOptions)
            if (searchedPass.length > 0) {
                logger.info("Searched Successfully!");
                return res.status(200).send({
                    success: true,
                    message: "Passes Search Results!",
                    data: searchedPass,
                });
            }
            else {
                logger.info("Data Not Found!");
                return res.status(200).send({
                    success: false,
                    message: "Data Not Found!",
                    data: searchedPass,
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

    // Retrive Single Pass
    findSinglePass: async (req, res) => {
        try {
            const passId = req.params.id;
            const pass = await Pass.findByPk(passId);
            if (!pass) {
                throw { message: "Pass Not Found!" }
            }
            const fetchedPass = await passService.findSinglePass(passId);

            logger.info("Pass Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "Pass Fetched Successfully!",
                data: fetchedPass,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message,

            })
        }
    },

    // Update Pass
    updatePass: async (req, res) => {
        try {
            const passId = req.params.id;
            const pass = await Pass.findByPk(passId);
            if (!pass) {
                throw { message: "Pass Not Found!" }
            }

            const updatedPass = await passService.updatePass(req, passId)
            logger.info("Pass Updated Successfully!");
            return res.status(200).send({
                success: true,
                message: "Pass Updated Successfully!",
                data: updatedPass,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message,

            })
        }
    },

    // Delete Pass
    deletePass: async (req, res) => {
        try {
            const passId = req.params.id;
            const pass = await Pass.findByPk(passId);
            if (!pass) {
                throw { message: "Pass Not Found!" }
            }

            const deletedPass = await passService.deletePass(passId)
            logger.info("Pass Deleted Successfully!");
            return res.status(200).send({
                success: true,
                message: "Pass Deleted Successfully!",
                data: deletedPass,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message,

            })

        }
    },

    // Get Visitors For A Pass
    getVisitors: async (req, res) => {
        try {
            const passId = req.params.id;
            const pass = await Pass.findByPk(passId);
            if (!pass) {
                throw { message: "Pass Not Found!" }
            }

            const passDetails = await passService.getVisitors(passId)
            if (passDetails.length > 0) {
                logger.info("Fetched Pass Visitors Successfully!");
                return res.status(200).send({
                    success: true,
                    message: "Fetched Pass Visitors Successfully!",
                    data: passDetails,
                })
            }

            else {
                logger.info("Data Not Found!");
                return res.status(200).send({
                    success: false,
                    message: "Data Not Found",
                    data: passDetails,
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

    // Get Duplicate Pass
    getDuplicatePass: async (req, res) => {
        try {
            const passId = req.params.id;
            const passData = await passService.getDuplicatePass(passId)
            logger.info("Duplicate Pass Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "Duplicate Pass Fetched Successfully!",
                data: passData,
            })

        }
        catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Create Duplicate Pass
    createDuplicatePass: async (req, res) => {
        try {
            // const body = req.body.pass;

            //console.log("BODY",body)
            const pass = await passService.createPass(req.body.pass);
            //console.log("CREATED PASS",pass)
            const passId = pass.id;
            //console.log("PASS ID",passId)
            if (passId) {
                await visitorService.createDuplicateVisitor(req.body.visitor, passId)
            }
            else {
                console.log("Pass ID didn't generate")
            }


            logger.info("Duplicate Pass Created Successfully!")
            return res.status(200).send({
                success: true,
                message: "Duplicate Pass Created Successfully!",
                data: pass,
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

module.exports = passController