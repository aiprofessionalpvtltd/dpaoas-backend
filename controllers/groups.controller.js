const groupsService = require("../services/groups.service")
const db = require("../models")
const Divisions = db.divisions
const Groups = db.groups
const GroupsDivisions = db.groupsDivisions
const logger = require('../common/winston');
const {
    validationErrorResponse,
    notFoundResponse,
    unAuthorizedResponse,
} = require('../common/validation-responses')
const groupsController = {

    // Create Group 
    createGroup: async (req, res) => {
        try {
            logger.info(`groupsController: createGroup body ${JSON.stringify(req.body)}`)
            const group = await groupsService.createGroup(req.body);
            logger.info("Group Created Successfully!")
            return res.status(200).send({
                success: true,
                message: "Group Created Successfully!",
                data: group,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Add Division To Group
    manageDivisionInGroup: async (req, res) => {
        try {
            logger.info(`groupsController: addDivisionToGroup body ${JSON.stringify(req.body)}`)
            const sessionId = req.params.id;
            await groupsService.manageDivisionInGroup(req.body,sessionId);
            logger.info("Record Has Been Updated Sucessfully!")
            return res.status(200).send({
                success: true,
                message: "Record Has Been Updated Sucessfully!",
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Retrieve All Groups and its divisions on the basis of Session Id
    retrieveDivisionsForGroups: async (req, res) => {
        try {
            logger.info(`divisionsController: retrieveDivisionsForGroups id ${JSON.stringify(req.params.id)}`);
            const sessionId = req.params.id;
            // Find all groups for a given session ID
            const groupsDivisions = await GroupsDivisions.findAll({
                where: {
                    fkSessionId: sessionId
                }
            });
            // Retrieve divisions for each group based on filtered GroupsDivisions
            const groupsDivisionsData = await groupsService.retrieveDivisionsForGroups(groupsDivisions);
            logger.info("Divisions Retrieved For Groups Successfully!");
            return res.status(200).send({
                success: true,
                message: "Divisions Retrieved For Groups Successfully!",
                data: groupsDivisionsData
            });
    
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            });
        }
    },    

    // Get All Groups
    getAllGroups: async(req,res) => {
        try {
            logger.info(`groupsController: getAllGroups `)
            const groups = await groupsService.getAllGroups();
            logger.info("Retrieved All Groups Successfully!")
            return res.status(200).send({
                success: true,
                message: "Retrieved All Groups Successfully!",
                data: groups,
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


module.exports = groupsController
