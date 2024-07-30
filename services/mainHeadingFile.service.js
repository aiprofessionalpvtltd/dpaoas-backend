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
      // Calculate offset and limit for pagination
      const offset = currentPage * pageSize;
      const limit = pageSize;

      // Fetch the count and rows of main headings from the database
      const { count, rows } = await MainHeadingFiles.findAndCountAll({
        where: { fkBranchId: branchId }, // Filter by branch ID
        include: [
          {
            model: Branches,
            as: "branches",
            attributes: ["id", "branchName"], // Include branch details
          },
        ],
        offset, // Pagination offset
        limit, // Pagination limit
        order: [["mainHeadingNumber", "ASC"]], // Order by mainHeadingNumber in ascending order
      });

      // Calculate the total number of pages
      const totalPages = Math.ceil(count / pageSize);

      // Return the result with count, total pages, and main headings
      return {
        success: true,
        message: "Main Headings fetched successfully.",
        count,
        totalPages,
        mainHeadings: rows,
      };
    } catch (error) {
      // Throw an error with a custom message
      throw {
        success: false,
        message: error.message || "Error Fetching Main Headings",
      };
    }
  },

  // Service Function: Retrieve Main Headings Based on Branch ID
  findMainHeadingsByBranchId: async (branchId) => {
    try {
      // Fetch all main headings associated with the specified branch ID
      const headings = await MainHeadingFiles.findAll({
        where: { fkBranchId: branchId }, // Filter by branch ID
        include: [
          {
            model: Branches,
            as: "branches",
            attributes: ["id", "branchName"], // Include branch details
          },
        ],
      });

      // Return the retrieved headings
      return {
        success: true,
        message: "Main Headings fetched successfully.",
        data: headings,
      };
    } catch (error) {
      // Throw an error with a custom message
      throw {
        success: false,
        message: error.message || "Error Fetching Headings By Branch",
      };
    }
  },

  // Service Function: Retrieve Main Heading Number Based on Main Heading ID
  findHeadingNumberByHeadingId: async (headingId) => {
    try {
      // Fetch the main heading with the specified heading ID
      const heading = await MainHeadingFiles.findOne({
        where: { id: headingId }, // Filter by heading ID
        attributes: ["mainHeadingNumber"], // Only retrieve the mainHeadingNumber field
      });

      // Check if the heading exists
      if (!heading) {
        throw new Error("Main Heading not found.");
      }

      // Return the retrieved heading number
      return {
        success: true,
        message: "Main Heading Number fetched successfully.",
        data: heading.mainHeadingNumber,
      };
    } catch (error) {
      // Throw an error with a custom message
      throw {
        success: false,
        message:
          error.message || "Error Fetching Heading Number By Main Heading ID",
      };
    }
  },

  // Service Function: Retrieve a Single Main Heading Based on Main Heading ID
  findSingleMainHeading: async (mainHeadingId) => {
    try {
      // Log the main heading ID for debugging purposes
      console.log(`Fetching main heading with ID: ${mainHeadingId}`);

      // Fetch the main heading with the specified ID and include associated branch details
      const mainHeading = await MainHeadingFiles.findOne({
        where: { id: mainHeadingId }, // Filter by main heading ID
        include: [
          {
            model: Branches,
            as: "branches",
            attributes: ["id", "branchName"], // Include branch details
          },
        ],
      });

      // Check if the main heading was found
      if (!mainHeading) {
        throw new Error("Main Heading not found.");
      }

      // Return the retrieved main heading
        return mainHeading;
     
    } catch (error) {
      // Throw an error with a custom message
      throw {
        success: false,
        message: error.message || "Error Fetching Main Heading",
      };
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
      return {
        success: true,
        message: "Main Heading successfully deactivated.",
        data: updatedHeading,
      };
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
