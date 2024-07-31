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
          flag: flagData.flag,
          fkBranchId: flagData.fkBranchId,
        },
      });

      if (existingFlag) {
        console.warn("A flag with the same branch already exists.");
        return {
          success: false,
          message: "A flag with the same branch already exists.",
        };
      }

      // Create the new flag
      const flag = await db.flags.create(flagData);

      return {
        success: true,
        message: "Flag created successfully.",
        data: flag,
      };
    } catch (error) {
      console.error("Error creating flag:", error.message);
      return {
        success: false,
        message: "Error creating flag.",
        error: error.message,
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

// Service function to update a flag by ID
updateFlag: async (id, flagData) => {
  try {
    // Validate input
    if (!flagData || typeof flagData.fkBranchId === "undefined" || typeof flagData.flag === "undefined") {
      return {
        success: false,
        message: "Invalid flag data: branchId and flag are required",
      };
    }

    // Check if a flag with the given ID exists
    const existingFlag = await db.flags.findOne({ where: { id } });
    if (!existingFlag) {
      return { success: false, message: "Flag with the given ID not found" };
    }

    // Check for duplicate flag with the same fkBranchId and flag
    const duplicateFlag = await db.flags.findOne({
      where: {
        fkBranchId: flagData.fkBranchId,
        flag: flagData.flag,
        id: { [db.Sequelize.Op.ne]: id }, // Ensure it's not the same flag being updated
      },
    });

    if (duplicateFlag) {
      return {
        success: false,
        message: `Duplicate flag found with branch ID: ${flagData.fkBranchId} and flag: ${flagData.flag}`,
      };
    }

    // Proceed with the update
    const [updateCount] = await db.flags.update(flagData, {
      where: { id },
      returning: true,
      plain: true,
    });

    // If no rows were updated, return an error
    if (updateCount === 0) {
      return { success: false, message: "Flag update failed" };
    }

    // Retrieve the updated flag
    const updatedFlag = await db.flags.findOne({ where: { id } });

    return { success: true, data: updatedFlag };
  } catch (error) {
    console.error("Error updating flag:", error);
    return {
      success: false,
      message: error.message || "Error updating flag!",
    };
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

  // Service function to get flags by branch ID with pagination and branch name
  getFlagsByBranchId: async (branchId, currentPage, pageSize) => {
    try {
      // Calculate offset for pagination
      const offset = currentPage * pageSize;
      const limit = parseInt(pageSize);

      // Find all flags that belong to the given branchId with pagination and include branch name
      const flags = await db.flags.findAndCountAll({
        where: { fkBranchId: branchId },
        limit,
        offset,
        include: [
          {
            model: db.branches,
            as: "branches",
            attributes: ["id", "branchName"], // Include branch details
          },
        ],
      });

      // If no flags are found, return a specific message
      if (!flags || flags.rows.length === 0) {
        return {
          success: false,
          message: `No flags found for branch ID: ${branchId}`,
        };
      }

      // Return the retrieved flags with a success message
      return {
        success: true,
        message: "Flags retrieved successfully",
        data: flags.rows,
        totalItems: flags.count,
        totalPages: Math.ceil(flags.count / pageSize),
        currentPage: parseInt(currentPage),
      };
    } catch (error) {
      console.error("Error retrieving flags:", error);
      return {
        success: false,
        message: error.message || "Error retrieving flags!",
      };
    }
  },
};

module.exports = flagService;
