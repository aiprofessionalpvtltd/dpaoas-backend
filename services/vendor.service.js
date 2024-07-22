const db = require("../models");

const Vendors = db.vendors
const Op = db.Sequelize.Op;
const logger = require('../common/winston');

const vendorsService = {

    // Create Vendor
    createVendor: async (req) => {
        try {
            // Create the inventory and save it in the database
            const vendor = await Vendors.create(req);
            return vendor;
        } catch (error) {
            throw { message: error.message || "Error Creating Vendor!" };

        }
    },


    // Get All Vendors
    getAllVendors: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const { count, rows } = await Vendors.findAndCountAll({
                offset,
                limit,
            });
            const totalPages = Math.ceil(count / pageSize);
            return { count, totalPages, vendors: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All Vendors");
        }
    },


    // Get Single Inventory Bill
    getSingleVendor: async (vendorId) => {
        try {
            const vendor = await Vendors.findOne({ where: { id: vendorId }});
            if (!vendor) {
                throw ({ message: "Vendor Not Found!" })
            }
            return vendor;
        } catch (error) {
            throw new Error(error.message || "Error Fetching Vendor");

        }
    },

    // Update Inventory Bill
    updateVendor: async(req, vendorId) =>
    {
        try {        
            await Vendors.update(req, { where: { id: vendorId } });
            // Fetch the updated session after the update
            const updatedVendor = await Vendors.findOne({ where: { id: vendorId } });
            return updatedVendor;
        }   catch(error) {
            throw { message: error.message || "Error Updating Vendor!" };
        }
    },

    // Delete Vendor
    deleteVendor: async(vendorId) =>
    {
        try {
        const updatedData = 
        {
            status: "inactive"
        }  
        await Vendors.update(updatedData, { where: { id: vendorId } });
        // Fetch the updated inventory bill after the update
        const deletedVendor = await Vendors.findOne({ where: { id: vendorId } });
        return deletedVendor;     
    }   catch (error)
    {
        throw { message: error.message || "Error Deleting Inventory Bill!" };
    }
    },

    // Search Inventory Bills
    searchVendor: async (searchCriteria) => {
        try {
            let queryOptions = {
                subQuery: false,
                distinct: true,
                where: {}
            };

            // Build the query options based on search criteria
            for (const key in searchCriteria) {
                // Adjust the query based on your model and search requirements
                // Example:
                if (key === 'vendorName') {
                    queryOptions.where['$vendorName$'] = { [Op.eq]: searchCriteria[key] };
                }
               
            }

            const vendors = await Vendors.findAll(queryOptions);
            return vendors;
        } catch (error) {
            throw new Error(error.message || "Error Searching Vendor");
        }
    },



}

module.exports = vendorsService