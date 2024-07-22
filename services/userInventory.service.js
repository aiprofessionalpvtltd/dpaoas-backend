const db = require("../models");
const Inventory = db.inventories;
const Users = db.users;
const Employees = db.employees;
const ComplaintTypes = db.complaintTypes
const InventoryBills = db.inventoryBills
const UserInventory = db.userInventory
const ComplaintCategories = db.complaintCategories
const Branches = db.branches
const Op = db.Sequelize.Op;
const Complaints = db.complaints
const logger = require('../common/winston');

const userInventoryService = {

    // Issue Product to User
    issueProductToUser: async (req, inventoryId) => {
        try {
            // Create the inventory and save it in the database
            const inventory = await UserInventory.create({
                fkInventoryId: inventoryId,
                fkAssignedToUserId: req.fkAssignedToUserId ? req.fkAssignedToUserId : null,
                userAssignedName: req.userAssignedName ? req.userAssignedName : null,
                fkAssignedToBranchId: req.fkAssignedToBranchId,
                issuedDate: req.issuedDate
            });
            await Inventory.update(
                { status: "issued" },
                { where: { id: inventoryId } }
            );
            return inventory;
        } catch (error) {
            throw { message: error.message || "Error Creating Inventory!" };

        }
    },

    // Return Product from User
    returnProductFromUser: async (req, inventoryId) => {
        try {
            // Create the inventory and save it in the database
            const inventory = await UserInventory.update(
                { returnDate: req.returnDate },
                { where: { fkInventoryId: inventoryId } }
            );

            await Inventory.update(
                { status: "in-stock/store" },
                { where: { id: inventoryId } }
            );
            return inventory;
        } catch (error) {
            throw { message: error.message || "Error Creating Inventory!" };

        }
    },

    // Retrieve User Inventory
    retrieveUserInventory: async () => {
        try {
            const userInventory = await UserInventory.findAll({
                include: [
                    {
                        model: Users,
                        as: 'assignedToUser',
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
                        as: 'assignedToBranch',
                        attributes: ['id','branchName']
                    },
                    {
                        model: Inventory,
                        as: 'assignedInventory'
                    },
                ],
                attributes: ['issuedDate', 'returnDate', 'userAssignedName'],
                order: [
                    ['id', 'DESC'],
                ],
            })

            return userInventory
        } catch (error) {
            throw new Error(error.message || "Error Fetching User Inventory");
        }
    },

    // Get Inventory of User
    getInventoryOfUser: async (userId) => {
        try {
            const userInventory = await UserInventory.findAll({
                where: { fkAssignedToUserId: userId },
                include: [
                    {
                        model: Users,
                        as: 'assignedToUser',
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
                        as: 'assignedToBranch',
                        attributes: ['id','branchName']
                    },
                    {
                        model: Inventory,
                        as: 'assignedInventory',
                        include: [
                            {
                                model: InventoryBills,
                                as: 'invoiceNumber'
                            }
                        ]
                    },
                ],
                attributes: ['issuedDate', 'returnDate' , 'userAssignedName'],
            })

            return userInventory
        } catch (error) {
            throw new Error(error.message || "Error Fetching User Inventory");
        }
    },


    // Search User Inventory
    searchUserInventory: async (searchCriteria) => {
        try {
            // Attempt to find records in UserInventory that match the serialNo
            let userInventoryOptions = {
                include: [
                    {
                        model: Users,
                        as: 'assignedToUser',
                        attributes: ['id'],
                        include: [
                            {
                                model: Employees,
                                as: 'employee',
                                attributes: ['id','firstName', 'lastName'],
                            }
                        ],
                    },
                    {
                        model: Branches,
                        as: 'assignedToBranch',
                        attributes: ['id','branchName'],
                    },
                    {
                        model: Inventory,
                        as: 'assignedInventory',
                    },
                ],
                attributes: ['issuedDate', 'returnDate' ,'userAssignedName'],
                subQuery: false,
                distinct: true,
                where: {}
            };

            if (searchCriteria.serialNo) {
                userInventoryOptions.where['$assignedInventory.serialNo$'] = { [Op.eq]: searchCriteria.serialNo };
            }

            const userInventoryResults = await UserInventory.findAll(userInventoryOptions);

            if (userInventoryResults.length > 0) {
                // If matching records are found in UserInventory, return them
                return userInventoryResults;
            } else {
                // If no matching records in UserInventory, search in Inventory table
                let inventoryOptions = {
                    include: [
                        {
                            model: InventoryBills,
                            as: 'invoiceNumber',
                            attributes: ['id', 'invoiceNumber']
                        },
                    ],
                    where: {}
                };

                if (searchCriteria.serialNo) {
                    inventoryOptions.where.serialNo = { [Op.eq]: searchCriteria.serialNo };
                }

                const inventoryResults = await Inventory.findAll(inventoryOptions);
                //return inventoryResults;
                const formattedInventoryResults = inventoryResults.map(result => ({
                    issuedDate: null,
                    returnDate: null,
                    assignedInventory: {
                        id: result.id,
                        fkInventoryBillId: result.fkInventoryBillId,
                        serialNo: result.serialNo,
                        productName: result.productName,
                        manufacturer: result.manufacturer,
                        productCategories: result.productCategories,
                        barCodeLable: result.barCodeLable,
                        quantity: result.quantity,
                        description: result.description,
                        purchasedDate: result.purchasedDate,
                        warrantyExpiredDate: result.warrantyExpiredDate,
                        status: result.status,
                        invoiceNumber: result.invoiceNumber,
                        createdAt: result.createdAt,
                        updatedAt: result.updatedAt,
                    },
                }));
            
                return formattedInventoryResults;
            }
        } catch (error) {
            throw new Error(error.message || "Error Searching Inventory");
        }
    },

}

module.exports = userInventoryService;



