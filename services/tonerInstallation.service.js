const db = require("../models");
const Inventory = db.inventories;
const Users = db.users;
const Employees = db.employees;
const InventoryBills = db.inventoryBills
const TonerInstallations = db.tonerInstallations
const TonerModels = db.tonerModels
const ComplaintCategories = db.complaintCategories
const ComplaintTypes = db.complaintTypes
const Branches = db.branches
const Vendors = db.vendors
const Op = db.Sequelize.Op;
const logger = require('../common/winston');

const tonerInstallationService = {

    // Create Toner Installation
    createTonerInstallation: async (req) => {
        try {
            // Create the toner installation and save it in the database
            const tonerInstallation = await TonerInstallations.create({
                requestDate: req.requestDate ? req.requestDate: null,
                fkUserRequestId: req.fkUserRequestId ? req.fkUserRequestId : null,
                userRequestName: req.userRequestName ? req.userRequestName : null,
                fkBranchRequestId: req.fkBranchRequestId ? req.fkBranchRequestId : null,
                fkTonerModelId: req.fkTonerModelId ? req.fkTonerModelId : null,
                quantity: req.quantity ? req.quantity : null
            });
            return tonerInstallation;
        } catch (error) {
            throw { message: error.message || "Error Creating Toner Installation!" };

        }
    },


    // Get All Toner Installations
    getAllTonerInstallations: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const { count, rows } = await TonerInstallations.findAndCountAll({
                include: [
                    {
                        model: Users,
                        as: 'requestUser',
                        attributes: ['id'],
                        include: [
                            {
                                model: Employees,
                                as: 'employee',
                                attributes: ['id', 'firstName', 'lastName']
                            }
                        ]
                    },
                    {
                        model: Branches,
                        as: 'requestBranch',
                        attributes: ['id','branchName'],
                    },
                    {
                        model: TonerModels,
                        as: 'tonerModel',
                        attributes: ['id', 'tonerModel']
                    }
                ],
                offset,
                limit,
                order: [
                    ['id', 'DESC'],
                ],
            });
            const totalPages = Math.ceil(count / pageSize);
            return { count, totalPages, tonerInstallations: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All Toner Installations");
        }
    },


    // Get Single Toner Installation
    getSingleTonerInstallation: async (tonerInstallationId) => {
        try {
            const tonerInstallation = await TonerInstallations.findOne({
                where: { id: tonerInstallationId },
                include: [
                    {
                        model: Users,
                        as: 'requestUser',
                        attributes: ['id'],
                        include: [
                            {
                                model: Employees,
                                as: 'employee',
                                attributes: ['id', 'firstName', 'lastName']
                            }
                        ]
                    },
                    {
                        model: Branches,
                        as: 'requestBranch',
                        attributes: ['id','branchName']
                    },
                    {
                        model: TonerModels,
                        as: 'tonerModel',
                        attributes: ['id', 'tonerModel']
                    }
                ],
            });
            if (!tonerInstallation) {
                throw ({ message: "Toner Installation Not Found!" })
            }
            return tonerInstallation;
        } catch (error) {
            throw new Error(error.message || "Error Fetching Toner Installation");

        }
    },

    // Update Toner Installation
    updateTonerInstallation: async (req, tonerInstallationId) => {
        try {
            await TonerInstallations.update(req, { where: { id: tonerInstallationId } });
            // Fetch the updated session after the update
            const updatedTonerInstallation = await TonerInstallations.findOne({ where: { id: tonerInstallationId } });
            return updatedTonerInstallation;
        } catch (error) {
            throw { message: error.message || "Error Updating Toner Installation!" };
        }
    },

    // Delete Toner Installation
    deleteTonerInstallation: async (tonerInstallationId) => {
        try {
            const updatedData =
            {
                status: "inactive"
            }
            await TonerInstallations.update(updatedData, { where: { id: tonerInstallationId } });
            // Fetch the updated toner installation after the update
            const deletedTonerInstallation = await TonerInstallations.findOne({
                where: { id: tonerInstallationId },
            });
            return deletedTonerInstallation;
        } catch (error) {
            throw { message: error.message || "Error Deleting Toner Installation!" };
        }
    },

    // Search Toner Installations
    searchTonerInstallation: async (searchCriteria) => {
        try {
            let queryOptions = {
                include: [
                    {
                        model: Users,
                        as: 'requestUser',
                        attributes: ['id'],
                        include: [
                            {
                                model: Employees,
                                as: 'employee',
                                attributes: ['id', 'firstName', 'lastName']
                            }
                        ]
                    },
                    {
                        model: Branches,
                        as: 'requestBranch',
                        attributes: ['id','branchName']
                    },
                    {
                        model: TonerModels,
                        as: 'tonerModel',
                        attributes: ['id', 'tonerModel']
                    }
                ],
                subQuery: false,
                distinct: true,
                where: {}
            };

            // Build the query options based on search criteria
            for (const key in searchCriteria) {
                // Adjust the query based on your model and search requirements
                // Example:
                if (key === 'requestUser') {
                    queryOptions.where['$requestUser.id$'] = { [Op.eq]: searchCriteria[key] };
                }
                if (key === 'requestBranch') {
                    queryOptions.where['$requestBranch.id$'] = { [Op.eq]: searchCriteria[key] };
                }
                if (key === 'tonerModel') {
                    queryOptions.where['$tonerModel.id$'] = { [Op.eq]: searchCriteria[key] };
                }
                if (key === 'requestDate') {
                    queryOptions.where['$requestDate$'] = { [Op.eq]: searchCriteria[key] };
                }
                if (key === 'userRequestName') {
                    queryOptions.where['$userRequestName$'] = { [Op.iLike]: `%${searchCriteria.userRequestName}%` };

                }


            }

            const tonerInstallations = await TonerInstallations.findAll(queryOptions);
            return tonerInstallations;
        } catch (error) {
            throw new Error(error.message || "Error Searching Toner Installation");
        }
    },



}

module.exports = tonerInstallationService