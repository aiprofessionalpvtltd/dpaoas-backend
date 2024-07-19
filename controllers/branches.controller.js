
const branchesService = require('../services/branches.service');
const logger = require('../common/winston');
const db = require("../models");
const branches = db.branches;
const Op = db.Sequelize.Op;

const branchesController = {
    // Create and Save a new Branch
    createBranch: async (req, res) => {
        try {
            const { body } = req
            logger.info(`branchesController: createBranch body ${JSON.stringify(body)}`)
            const branch = await branchesService.createBranch(body);
            return res.status(200).send({
                success: true,
                message: "Branch Created Successfully!",
                data: branch,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Retrieve All Branches
    findAllBranches: async (req, res) => {
        logger.info(`branchesController: findAllBranches`)
        const { query } = req
        const { page, pageSize } = query;
        const offset = page * pageSize;
        let orderType = req.query.order;
        if (orderType == "ascend") {
            orderType = "ASC";
        }
        else {
            orderType = "DESC";
        }
        const defaultSortColumn = 'id';
        const order = [[defaultSortColumn, orderType]];

        let whereClause = {};
        let options = {};
        if (page && pageSize) {
            options = {
                ...options,
                limit: parseInt(pageSize),
                offset,
            };
        }
        options.order = order;

        try {
            const { rows, count } = await branches.findAndCountAll(options);
            return res.status(200).send({
                success: true,
                message: `All Branches Information fetched successfully`,
                data: { rows, count },
            });
        } catch (error) {
            console.error('Error fetching Branches:', error.message);
            return res.status(400).send({
                success: false,
                message: 'Error fetching Branches',
                error: error.message,
            });
        }
    },

    // Retrieve Single Branch
    findSingleBranch: async (req, res) => {
        const { params } = req
        const { id } = params
        logger.info(`branchesController: findSingleBranch for Id ${id}`)
        const motionRecord = await branchesService.findSingleBranch(id)
        if (motionRecord) {
            return res.status(200).send({
                success: true,
                message: `Branch fetched successfully for id ${id}`,
                data: motionRecord,
            })
        }
        return res.status(400).send({
            success: false,
            message: `No record found for id ${id}`,
            data: {},
        })
    },

    // Updates the Branch
    updateBranch: async (req, res) => {
        try {
            const { body } = req
            logger.info(`branchesController: updateBranch body ${JSON.stringify(body)}`)
            const branch = await branchesService.updateBranch(req);
            return res.status(200).send({
                success: true,
                message: "Branch Updated Successfully!",
                data: branch,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },
    // Delete/Suspend the Branch
    suspendBranch: async (req, res) => {
        try {
            const { params } = req
            const { id } = params
            logger.info(`branchesController: suspendBranch for Id ${id}`)
            const branch = await branchesService.suspendBranch(req);
            return res.status(200).send({
                success: true,
                message: "Branch Suspend/Deleted Successfully!",
                data: branch,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

}

module.exports = branchesController;
