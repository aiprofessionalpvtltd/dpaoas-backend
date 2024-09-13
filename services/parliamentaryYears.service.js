const db = require("../models");
const ParliamentaryYears = db.parliamentaryYears;
const Tenures = db.tenures;
const Op = db.Sequelize.Op;
const logger = require("../common/winston");

const parliamentaryYearsService = {
  // Create Parliamentary Year
  createParliamentaryYear: async (req) => {
    try {
      // Create the Parliamentary Year and save it in the database
      const parliamentaryYear = await ParliamentaryYears.create(req);
      return parliamentaryYear;
    } catch (error) {
      throw { message: error.message || "Error Creating Parliamentary Year!" };
    }
  },

  // Get All Parliamentary Years
  getAllParliamentaryYears: async (currentPage, pageSize) => {
    try {
      const offset = currentPage * pageSize;
      const limit = pageSize;
      const { count, rows } = await ParliamentaryYears.findAndCountAll({
        include: [
          {
            model: Tenures,
            attributes: [
              "id",
              "tenureName",
              "tenureType",
              "fromDate",
              "toDate",
            ],
            required: false, // Include even if there's no matching Tenures record
          },
          {
            model: db.terms,
            attributes: ["id", "termName"],
            required: false,
          },
        ],
        offset,
        limit,
        order: [
          // Order by tenureType first
          [
            db.sequelize.literal(
              `CASE WHEN "tenure"."tenureType" = 'Senators' THEN 1 ELSE 2 END`
            ),
            "ASC",
          ],
          // Then by fromDate within each tenureType
          [db.sequelize.col("tenure.fromDate"), "ASC"],
          // Then by toDate within each tenureType
          [db.sequelize.col("tenure.toDate"), "ASC"],
          // Then by parliamentaryTenure within each parliamentaryYears
          [db.sequelize.col("parliamentaryYears.parliamentaryTenure"), "ASC"],
          // Finally, by ParliamentaryYears ID
          ["id", "DESC"],
        ],
      });
      const totalPages = Math.ceil(count / pageSize);
      return { count, totalPages, parliamentaryYears: rows };
    } catch (error) {
      throw new Error(
        error.message || "Error Fetching All Parliamentary Years"
      );
    }
  },

  // Get Single Parliamentary Year
  getSingleParliamentaryYear: async (parliamentaryYearId) => {
    try {
      const parliamentaryYear = await ParliamentaryYears.findOne({
        where: { id: parliamentaryYearId },
        include: [
          {
            model: Tenures,
            attributes: ["id", "tenureName", "tenureType"],
          },
          {
            model: db.terms,
            attributes: ["id", "termName"],
          },
        ],
      });
      if (!parliamentaryYear) {
        throw { message: "Parliamentary Year Not Found!" };
      }
      return parliamentaryYear;
    } catch (error) {
      throw new Error(error.message || "Error Fetching Parliamentary Years");
    }
  },

  // Update Parliamentary Year
  updateParliamentaryYear: async (req, parliamentaryYearId) => {
    try {
      await ParliamentaryYears.update(req, {
        where: { id: parliamentaryYearId },
      });
      // Fetch the updated parliamentary year after the update
      const updatedParliamentaryYear = await ParliamentaryYears.findOne({
        where: { id: parliamentaryYearId },
      });
      return updatedParliamentaryYear;
    } catch (error) {
      throw { message: error.message || "Error Updating Parliamentary Year!" };
    }
  },

  // Delete Parliamentary Year
  deleteParliamentaryYear: async (parliamentaryYearId) => {
    try {
      const updatedData = {
        status: "inactive",
      };
      await ParliamentaryYears.update(updatedData, {
        where: { id: parliamentaryYearId },
      });
      // Fetch the updated political party after the update
      const deletedParliamentaryYear = await ParliamentaryYears.findOne({
        where: { id: parliamentaryYearId },
      });
      return deletedParliamentaryYear;
    } catch (error) {
      throw { message: error.message || "Error Deleting Parliamentary Year!" };
    }
  },
  getRecordsByTenureId: async (tenureID) => {
    try {
      // Fetch records where fkTenureId matches the provided tenureID
      const records = await ParliamentaryYears.findAll({
        where: {
          fkTenureId: tenureID,
        },
      });

      // Return the fetched records
      return records;
    } catch (error) {
      // Handle any errors during the database operation
      throw new Error(`Error fetching records by Tenure ID: ${error.message}`);
    }
  },

  getRecordsByTermId: async (termID) => {
    try {
      // Fetch records where fkTermId matches the provided termID
      const records = await ParliamentaryYears.findAll({
        where: {
          fkTermId: termID,
        },
      });

      // Return the fetched records
      return records;
    } catch (error) {
      // Handle any errors during the database operation
      throw new Error(`Error fetching records by Term ID: ${error.message}`);
    }
  },
};

module.exports = parliamentaryYearsService;
