const db = require("../models");
const Inventory = db.inventories;
const Users = db.users;
const Employees = db.employees;
const InventoryBills = db.inventoryBills
const Vendors = db.vendors
const Op = db.Sequelize.Op;
const logger = require('../common/winston');

const inventoryService = {

    // Create Inventory
    createInventory: async (req) => {
        try {
            // Create the inventory and save it in the database
            const inventory = await Inventory.create(req);
            return inventory;
        } catch (error) {
            throw { message: error.message || "Error Creating Inventory!" };

        }
    },


    // Get All Inventories
    geAllInventories: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const { count, rows } = await Inventory.findAndCountAll({
                include: [
                    {
                        model: InventoryBills,
                        as: 'invoiceNumber',
                        attributes: ['id', 'invoiceNumber','invoiceDate'],
                        include: [
                            {
                                model: Vendors,
                                as: 'vendor',
                                attributes: ['id', 'vendorName']
                            }
                        ]
                    },
                ],
                offset,
                limit,
                order: [
                    ['id', 'DESC'],
                ],
            });
            const totalPages = Math.ceil(count / pageSize);
            return { count, totalPages, inventories: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All Inventories");
        }
    },

    // Get Single Inventory
    getSingleInventory: async (inventoryId) => {
        try {
            const inventory = await Inventory.findOne({ where: { id: inventoryId },
                include: [
                    {
                        model: InventoryBills,
                        as: 'invoiceNumber',
                        attributes: ['id','invoiceNumber','invoiceDate'],
                        include: [
                            {
                                model: Vendors,
                                as: 'vendor',
                                attributes: ['id', 'vendorName']
                            }
                        ]
                    },
                ]});
            if (!inventory) {
                throw ({ message: "Inventory Not Found!" })
            }
            return inventory;
        } catch (error) {
            throw new Error(error.message || "Error Fetching Inventory");

        }
    },

    // Search Inventory
    searchInventory: async (searchCriteria) => {
        try {
            let queryOptions = {
                include: [
                    {
                        model : InventoryBills,
                        as: 'invoiceNumber',
                        attributes: ['id', 'invoiceNumber','invoiceDate'],
                        include: [
                            {
                                model: Vendors,
                                as: 'vendor',
                                attributes: ['id', 'vendorName']
                            }
                        ]
                    },
                ],
                subQuery: false,
                distinct: true,
                where: {}
            };

            // Build the query options based on search criteria
            for (const key in searchCriteria) {
                // Adjust the query based on your model and search requirements
                // Example:
                if (key === 'productName') {
                    queryOptions.where['$productName$'] = { [Op.eq]: searchCriteria[key] };
                }
                if (key === 'serialNo') {
                    queryOptions.where['$serialNo$'] = { [Op.eq]: searchCriteria[key] };
                }

            }

            const inventories = await Inventory.findAll(queryOptions);
            return inventories;
        } catch (error) {
            throw new Error(error.message || "Error Searching Inventory");
        }
    },

     // Update Inventory 
     updateInventory: async(req,inventoryId) =>
     {
         try {        
             await Inventory.update(req, { where: { id: inventoryId } });
             // Fetch the updated inventory after the update
             const updatedInventory = await Inventory.findOne({ where: { id: inventoryId }, 
            include: [
                {
                    model: InventoryBills,
                    as: 'invoiceNumber',
                    attributes: ['id','invoiceNumber', 'invoiceDate', 'quantity', 'fkVendorId'],
                    include: [
                        {
                            model: Vendors,
                            as: 'vendor',
                            attributes: ['id', 'vendorName']
                        }
                    ]
                }
            ]});
             return updatedInventory;
         }   catch(error) {
             throw { message: error.message || "Error Updating Inventory!" };
         }
     },
 
     // Delete Inventory
     deleteInventory: async(inventoryId) =>
     {
         try {
         const updatedData = 
         {
             status: "out of order"
         }  
         await Inventory.update(updatedData, { where: { id: inventoryId } });
         // Fetch the updated inventory bill after the update
         const deletedInventory = await Inventory.findOne({ where: { id: inventoryId } });
         return deletedInventory;     
     }   catch (error)
     {
         throw { message: error.message || "Error Deleting Inventory Bill!" };
     }
     },



}

module.exports = inventoryService