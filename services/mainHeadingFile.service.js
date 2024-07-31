const db = require("../models");
const ManageSessions = db.manageSessions;
const Sessions = db.sessions;
const SessionAttendance = db.sessionAttendances;
const Members = db.members;
const MainHeadingFiles = db.mainHeadingFiles;
const Branches = db.branches;
const Op = db.Sequelize.Op;
const logger = require("../common/winston");

const mainHeadingFileService = {
  //Service Function: Create Main Heading
  createMainHeading: async (req) => {
    try {
      const { mainHeadingNumber, fkBranchId } = req;

      // Check if a heading with the same number already exists in the same branch
      const existingHeading = await MainHeadingFiles.findOne({
        where: {
          mainHeadingNumber: mainHeadingNumber,
          fkBranchId: fkBranchId,
        },
      });

      // If an existing heading is found, throw an error
      if (existingHeading) {
        throw new Error("Main Heading Number already exists in this branch.");
      }

      // Create the main heading for a file and save it in the database
      const mainHeadingFile = await MainHeadingFiles.create(req);

      // Return the created main heading
      return {
        success: true,
        message: "Main Heading Created Successfully!",
        data: mainHeadingFile,
      };
    } catch (error) {
      // Throw an error with a custom message
      throw {
        message: error.message || "Error Creating Main Heading For A File!",
      };
    }
  },

  //Service Function: Fetch All Main Headings for a Specific Branch with Pagination
  findAllMainHeadings: async (branchId, currentPage, pageSize) => {
    try {
      const offset = currentPage * pageSize;
      const limit = pageSize;
      const { count, rows } = await MainHeadingFiles.findAndCountAll({
        where: { fkBranchId: branchId },
        include: [
          {
            model: Branches,
            as: "branches",
            attributes: ["id", "branchName"],
          },
        ],

        offset,
        limit,
        order: [["mainHeadingNumber", "ASC"]],
      });
      const totalPages = Math.ceil(count / pageSize);
      return { count, totalPages, mainHeadings: rows };
    } catch (error) {
      throw new Error(error.message || "Error Fetching Main Headings");
    }
  },

  // Service Function: Retrieve Main Headings Based on Branch ID
  findMainHeadingsByBranchId: async (branchId) => {
    try {
      const headings = await MainHeadingFiles.findAll({
        where: { fkBranchId: branchId },
        include: [
          {
            model: Branches,
            as: "branches",
            attributes: ["id", "branchName"],
          },
        ],
      });
      return headings;
    } catch (error) {
      throw new Error(error.message || "Error Fetching Headings By Branch ");
    }
  },

  // Service Function: Retrieve Main Heading Number Based on Main Heading ID
  findHeadingNumberByHeadingId: async (headingId) => {
    try {
      const headings = await MainHeadingFiles.findAll({
        where: { id: headingId },
      });
      return headings;
    } catch (error) {
      throw new Error(
        error.message || "Error Fetching Headings By Main Heading Id "
      );
    }
  },

  // Service Function: Retrieve a Single Main Heading Based on Main Heading ID
  findSingleMainHeading: async (mainHeadingId) => {
    try {
      console.log(mainHeadingId);
      const mainHeading = await MainHeadingFiles.findOne({
        where: { id: mainHeadingId },
        include: [
          {
            model: Branches,
            as: "branches",
            attributes: ["id", "branchName"],
          },
        ],
      });
      return mainHeading;
    } catch (error) {
      throw new Error(error.message || "Error Fetching Main Heading");
    }
  },

  // Service Function: Update Main Heading
  updateMainHeading: async (req, mainHeadingId) => {
    try {
      // Extract branchId and headingNumber from the request body
      const { fkBranchId, mainHeadingNumber } = req;

      // Check if a heading with the same number already exists in the same branch
      const existingHeading = await MainHeadingFiles.findOne({
        where: {
          mainHeadingNumber: mainHeadingNumber,
          fkBranchId: fkBranchId,
          id: {
            [Op.ne]: mainHeadingId, // Exclude the current heading from the check
          },
        },
      });

      // If an existing heading is found, throw an error
      if (existingHeading) {
        throw new Error("Heading number already exists in this branch.");
      }

      // Update the main heading with the new values
      await MainHeadingFiles.update(req, { where: { id: mainHeadingId } });

      // Fetch the updated main heading to verify the update
      const updatedHeading = await MainHeadingFiles.findOne({
        where: { id: mainHeadingId },
        include: [
          {
            model: Branches,
            as: "branches",
            attributes: ["id", "branchName"], // Include branch details
          },
        ],
      });

      // Return a success response with the updated main heading
      return {
        success: true,
        message: "Main Heading updated successfully.",
        data: updatedHeading,
      };
    } catch (error) {
      // Handle any errors that occur during the update
      throw {
        success: false,
        message: error.message || "Error updating Main Heading.",
      };
    }
  },

  // Service Function: Soft Delete Main Heading by Setting Status to "inactive"
  // Service Function: Soft Delete Main Heading by Setting Status to "inactive"
  deleteMainHeading: async (mainHeadingId) => {
    try {
      // Define the update data to set the status as inactive
      const updatedData = { status: "inactive" };

      // Update the main heading to set its status to inactive
      const [affectedRows] = await MainHeadingFiles.update(updatedData, {
        where: { id: mainHeadingId },
      });

      // Check if any rows were affected (i.e., if the update was successful)
      if (affectedRows === 0) {
        throw new Error("Main Heading not found or already inactive.");
      }

      // Fetch the updated main heading to verify the update
      const updatedHeading = await MainHeadingFiles.findOne({
        where: { id: mainHeadingId },
        include: [
          {
            model: Branches,
            as: "branches",
            attributes: ["id", "branchName"], // Include branch details
          },
        ],
      });

      // Return a success response with the updated main heading
      return updatedHeading;
    } catch (error) {
      // Handle any errors that occur during the update
      throw {
        success: false,
        message: error.message || "Error Deactivating Main Heading",
      };
    }
  },
};

module.exports = mainHeadingFileService;
