const db = require("../models");
const Branches = db.branches;
const Op = db.Sequelize.Op;
const logger = require('../common/winston');

const branchesService = {
    // Create A New Branch
    createBranch: async (req) => {
        try {
            // Validate the branch data
            if (!req.branchName) {
                throw ({ message: 'Please Provide Name!' })
            }
            // Create the branch
            const branch = await Branches.create(req);
            return branch;
        } catch (error) {
            throw { message: error.message || "Error Creating Branch" };

        }
    },



    // Get Branch by ID
    findSingleBranch: async (id) => {
        try {
            const result = await Branches.findOne({
                raw: false,
                where: {
                    id: id
                }
            });

            return result
        } catch (error) {
            console.error('Error Fetching Branch request:', error.message);
        }
    },

    // Updates Branch
    updateBranch: async (req) => {
        try {
            const branchId = req.params.id;
            const branch = await Branches.findByPk(branchId);
            if (!branch) {
                throw ({ message: "Branch Not Found!" });
            }

            await Branches.update(req.body, { where: { id: branchId } });

            // Fetch the updated Branch after the update
            const updatedBranch = await Branches.findOne({ where: { id: branchId } }, { raw: true });

            return updatedBranch;

        } catch (error) {
            throw { message: error.message || "Error Updating Branch" };
        }
    },

    // Deletes/Suspend Branch
    suspendBranch: async (req) => {
        try {
            const branchId = req.params.id;
            const branch = await Branches.findByPk(branchId);
            if (!branch) {
                throw ({ message: "branch Not Found!" });
            }
            const updatedData = {
                branchStatus: "inactive"
            }

            await Branches.update(updatedData, { where: { id: branchId } });

            // Fetch the updated Branch after the update
            const updatedBranch = await Branches.findByPk(branchId, { raw: true });

            return updatedBranch;


        } catch (error) {
            throw { message: error.message || "Error Suspending Branch" };
        }
    }
}

module.exports = branchesService
