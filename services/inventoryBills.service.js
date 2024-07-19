const db = require("../models");
const Inventory = db.inventories;
const Users = db.users;
const Employees = db.employees;
const InventoryBills = db.inventoryBills
const Vendors = db.vendors
const Op = db.Sequelize.Op;
const logger = require('../common/winston');

const inventoryBillsService = {

    // Create Inventory Bill
    createInventoryBill: async (req) => {
        try {
            // Create the inventory and save it in the database
            const inventory = await InventoryBills.create(req);
            return inventory;
        } catch (error) {
            throw { message: error.message || "Error Creating Inventory Bill!" };

        }
    },


    // Get All Inventory Bills
    getAllInventoryBills: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const { count, rows } = await InventoryBills.findAndCountAll({
                include: [
                    {
                        model: Vendors,
                        as: 'vendor',
                        attributes: ['id','vendorName']
                    }
                ],
                offset,
                limit,
                order: [
                    ['id', 'DESC'],
                ],
            });
            const totalPages = Math.ceil(count / pageSize);
            return { count, totalPages, inventoryBills: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All Inventory Bills");
        }
    },


    // Get Single Inventory Bill
    getSingleInventoryBill: async (inventoryBillId) => {
        try {
            const inventoryBill = await InventoryBills.findOne({ where: { id: inventoryBillId },
                include: [
                    {
                        model: Vendors,
                        as: 'vendor',
                        attributes: ['id','vendorName']
                    }
                ]});
            if (!inventoryBill) {
                throw ({ message: "Inventory Bill Not Found!" })
            }
            return inventoryBill;
        } catch (error) {
            throw new Error(error.message || "Error Fetching Inventory Bill");

        }
    },

    // Update Inventory Bill
    updateInventoryBill: async(req, inventoryBillId) =>
    {
        try {        
            await InventoryBills.update(req, { where: { id: inventoryBillId } });
            // Fetch the updated session after the update
            const updatedInventoryBill = await InventoryBills.findOne({ where: { id: inventoryBillId } });
            return updatedInventoryBill;
        }   catch(error) {
            throw { message: error.message || "Error Updating Inventory Bill!" };
        }
    },

    // Delete Inventory Bill
    deleteInventoryBill: async(inventoryBillId) =>
    {
        try {
        const updatedData = 
        {
            status: "inactive"
        }  
        await InventoryBills.update(updatedData, { where: { id: inventoryBillId } });
        // Fetch the updated inventory bill after the update
        const deletedInventoryBill = await InventoryBills.findOne({ where: { id: inventoryBillId },
            include: [
                {
                    model: Vendors,
                    as: 'vendor',
                    attributes: ['id','vendorName']
                }
            ]});
        return deletedInventoryBill;     
    }   catch (error)
    {
        throw { message: error.message || "Error Deleting Inventory Bill!" };
    }
    },

    // Search Inventory Bills
    searchInventoryBill: async (searchCriteria) => {
        try {
            let queryOptions = {
                include:[
                    {
                        model: Vendors,
                        as: 'vendor',
                        attributes: ['id', 'vendorName']
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
                if (key === 'invoiceNumber') {
                    queryOptions.where['$invoiceNumber$'] = { [Op.eq]: searchCriteria[key] };
                }
               
            }

            const inventories = await InventoryBills.findAll(queryOptions);
            return inventories;
        } catch (error) {
            throw new Error(error.message || "Error Searching Inventory Bill");
        }
    },



}

module.exports = inventoryBillsService