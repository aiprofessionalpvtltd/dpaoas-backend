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

            logger.info("Ministers--->>", mnas)

            if (mnas.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: false,
                    message: 'No data found on this page!'
                });
            }
            else {
                logger.info("All Ministers Fetched Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "All Ministers Fetched Successfully!",
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
    findAllMinistriesByMinisterID: async (req, res) => {
        try {
            const ministerID = req.params.mnaId;
            const ministries = await mnaService.findAllMinistriesByMinisterID(ministerID);

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
    findSingleMNA: async (req, res) => {
        try {
            const mnnaId = req.params.id
            const mnna = await mnaService.findSingleMNA(mnnaId);
            logger.info("Single Minister Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "Single Minister Fetched Successfully!",
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

            logger.info("Ministers Data Updated Successfully!");
            return res.status(200).send({
                success: true,
                message: "Ministers Data Updated Successfully!",
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
    },


    promoteMinister: async (req, res) => {
        try {
          const { body, params } = req;
          const { ministerID } = params;
          const { newParliamentaryYearId } = body;
    
          logger.info(`ministersController: promoteMinisters for ministerID ${ministerID}`);
    
          // Call the promoteMinisters service with ministerID and newParliamentaryYearId
          const ministerRecord = await mnaService.promoteMinisters(
            newParliamentaryYearId,
            ministerID
          );
    
          return res.status(200).send({
            success: true,
            message: `Minister promoted successfully for ID ${ministerID}`,
            data: ministerRecord,
          });
        } catch (error) {
          console.error("Error promoting minister:", error);
          return res.status(500).send({
            success: false,
            message: `Failed to promote minister for ID`,
            error: error.message,
          });
        }
      },
    
      getMinisterByParliamentaryYearID: async (req, res) => {
        try {
            const { params } = req;
            const { id } = params;
    
            logger.info(`ministersController: getMinisterById ${id}`);
    
            // Fetch the minister record
            const ministerRecord = await mnaService.getMinisterByParliamentaryYearID(id);
    
            // Check if the ministerRecord is empty
            if (!ministerRecord || Object.keys(ministerRecord).length === 0) {
                logger.warn(`No minister found for id ${id}`);
                return res.status(404).send({
                    success: true,
                    message: `No minister found for id ${id}`,
                });
            }
    
            // If the ministerRecord is found
            logger.info(`Minister fetched successfully for id ${id}`);
            return res.status(200).send({
                success: true,
                message: `Minister fetched successfully for id ${id}`,
                data: ministerRecord,
            });
    
        } catch (error) {
            logger.error(`Error fetching minister by id ${id}: ${error.message}`);
            return res.status(500).send({
                success: false,
                message: `Error fetching minister by id ${id}`,
            });
        }
    },
    
    
}

module.exports = mnaController;