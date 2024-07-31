const { where, sequelize } = require("sequelize");
const db = require("../models");

const flagService = {
  /**
   * Create a new flag
   * @param {Object} flagData - The data to create a new flag
   * @returns {Promise<Object>} - The created flag
   * @throws {Error} - If there is an error creating the flag
   */
  createFlag: async (flagData) => {
    try {
      // Check for existing flag with the same branch
      const existingFlag = await db.flags.findOne({
        where: {
            fkBranchId: flagData.fkBranchId
        }
      });

      if (existingFlag) {
        console.warn("A flag with the same branch already exists.");
        return {
          success: false,
          message: "A flag with the same branch already exists."
        };
      }

      // Create the new flag
      const flag = await db.flags.create(flagData);

      return {
        success: true,
        message: "Flag created successfully.",
        data: flag
      };
    } catch (error) {
      console.error("Error creating flag:", error.message);
      return {
        success: false,
        message: "Error creating flag.",
        error: error.message
      };
    }
  },


  /**
   * Retrieve all flags
   * @returns {Promise<Array>} - The list of all flags
   * @throws {Error} - If there is an error retrieving the flags
   */
  findAllFlags: async () => {
    try {
      const flags = await db.flags.findAll();
      return flags;
    } catch (error) {
      console.error("Error retrieving flags:", error);
      throw new Error(error.message || "Error retrieving flags!");
    }
  },

  /**
   * Retrieve a flag by ID
   * @param {number} id - The ID of the flag to retrieve
   * @returns {Promise<Object|null>} - The retrieved flag or null if not found
   * @throws {Error} - If there is an error retrieving the flag
   */
  findFlagById: async (id) => {
    try {
      const flag = await db.flags.findByPk(id);
      return flag;
    } catch (error) {
      console.error("Error retrieving flag:", error);
      throw new Error(error.message || "Error retrieving flag!");
    }
  },

  /**
   * Update a flag by ID
   * @param {number} id - The ID of the flag to update
   * @param {Object} flagData - The new data for the flag
   * @returns {Promise<Object|null>} - The updated flag or null if not found
   * @throws {Error} - If there is an error updating the flag
   */
  updateFlag: async (id, flagData) => {
      try {
        //   console.log('flagData', id, flagData); return false;
      // Validate input
      if (!flagData || typeof flagData.fkBranchId === 'undefined') {
        return { success: false, message: 'Invalid flag data: branchId is required' };
      }
  
      // Check if a flag with the given ID exists
      const existingFlag = await db.flags.findOne({ where: { id } });
      if (!existingFlag) {
        return { success: false, message: 'Flag with the given ID not found' };
      }
  
       // Proceed with the update
      const [updateCount, updatedFlag] = await db.flags.update(flagData, {
        where: { id },
        returning: true,
        plain: true,
      });
  
      if (updateCount === 0) {
        return { success: false, message: 'Flag update failed' };
      }
  
      return { success: true, data: updatedFlag };
    } catch (error) {
      console.error("Error updating flag:", error);
      return { success: false, message: error.message || "Error updating flag!" };
    }
  },
  

  /**
   * Delete a flag by ID
   * @param {number} id - The ID of the flag to delete
   * @returns {Promise<boolean>} - True if the flag was deleted, false otherwise
   * @throws {Error} - If there is an error deleting the flag
   */
  deleteFlag: async (id) => {
    try {
      const result = await db.flags.destroy({
        where: { id },
      });

      return result > 0;
    } catch (error) {
      console.error("Error deleting flag:", error);
      throw new Error(error.message || "Error deleting flag!");
    }
    },
  
  
  // Retrieve flags by branchId
  getFlagsByBranchId: async (branchId) => {
    try {
      // Find all flags that belong to the given branchId
      const flags = await db.flags.findAll({ where: { branchId } });

      // If no flags are found, return a specific message
      if (!flags || flags.length === 0) {
        return {
          success: false,
          message: `No flags found for branch ID: ${branchId}`,
        };
      }

      // Return the retrieved flags with a success message
      return {
        success: true,
        message: "Flags retrieved successfully",
        data: flags,
      };
    } catch (error) {
      console.error("Error retrieving flags:", error);
      return {
        success: false,
        message: error.message || "Error retrieving flags!",
      };
    }
  }
};

module.exports = flagService;
