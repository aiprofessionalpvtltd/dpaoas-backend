const casesService = require("../services/cases.service");
const logger = require("../common/winston");
const { uploadFile } = require("../common/upload");
const db = require("../models");
const File = db.files;
const newFiles = db.newFiles;
const FreshReceipts = db.freshReceipts;
const FreshReceiptAttachments = db.freshReceiptsAttachments;
const FileDiaries = db.fileDiaries;
const CaseAttachments = db.caseAttachments;
const CaseNotes = db.caseNotes;
const Op = db.Sequelize.Op;

const casesController = {
  // Create Case For The File
  createCase: async (req, res) => {
    try {
      logger.info(
        `casesController: createCase query ${JSON.stringify(
          req.query
        )} and body ${JSON.stringify(req.body)}`
      );
      const fileId = req.params.fileId;
      const createdBy = req.params.createdBy;
      const freshReceiptId = req.params.fkFreshReceiptId
        ? parseInt(req.params.fkFreshReceiptId)
        : null;
      const cases = await casesService.createCase(
        req.body,
        fileId,
        createdBy,
        freshReceiptId
      );
      return res.status(200).send({
        success: true,
        message: "Case Created Successfully!",
        data: cases,
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  // Update Case
  updateCase: async (req, res) => {
    try {
      logger.info(
        `casesController: updateCase id ${JSON.stringify(
          req.params.id
        )} and body ${JSON.stringify(req.body)}`
      );
      // const fileId = req.params.fileId;
      // const caseId = req.params.caseId;
      const caseNoteId = req.params.caseNoteId;
      const cases = await casesService.updateCase(req.body, caseNoteId);
      return res.status(200).send({
        success: true,
        message: "Case Updated Successfully!",
        data: cases,
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  updateCaseStatus: async (req, res) => {
    try {
      const { caseId, newStatus } = req.body;
      console.log(caseId, newStatus);
      const result = await casesService.updateCaseStatus(caseId, newStatus);
      res.status(200).send({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  // Get Signature By User Id
  getSignatureById: async (req, res) => {
    try {
      logger.info(
        `casesController: getSignatureById id ${JSON.stringify(req.params.id)}`
      );
      const userId = req.params.id;
      const signature = await casesService.getSignatureById(userId);
      return res.status(200).send({
        success: true,
        message: "Signature Fetched Successfully!",
        data: signature,
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  // Assign Case
  assignCase: async (req, res) => {
    try {
      logger.info(
        `casesController: assignCase FileId ${JSON.stringify(
          req.params.fileId
        )}, CaseId ${JSON.stringify(
          req.params.caseId
        )} and body ${JSON.stringify(req.body)} and files ${JSON.stringify(
          req.files
        )}`
      );
      const fileId = req.params.fileId;
      const caseId = req.params.caseId;
      const cases = await casesService.assignCase(
        fileId,
        caseId,
        req.files,
        req.body
      );
      return res.status(200).send({
        success: true,
        message: "Case Assigned Successfully!",
        data: cases,
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  // Get Cases On the basis of File Id
  getCasesByFileId: async (req, res) => {
    try {
      logger.info(
        `casesController: getCasesByFileId query ${JSON.stringify(req.query)}`
      );
      const fileId = req.query.fileId;
      const userId = req.query.userId;
      const currentPage = req.query.currentPage;
      const pageSize = req.query.pageSize;
      const { count, totalPages, cases } = await casesService.getCasesByFileId(
        fileId,
        userId,
        currentPage,
        pageSize
      );
      if (cases.length === 0) {
        return res.status(200).send({
          success: true,
          message: "No Data Found!",
          data: {cases: cases},
        });
      } else {
        return res.status(200).send({
          success: true,
          message: `Cases Fetched Successfully!`,
          data: { cases, count, totalPages },
        });
      }
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  // Get Cases On the basis of File Id
  //   getCasesByFileId: async (req, res) => {
  //     try {
  //         logger.info(`casesController: getCasesByFileId query ${JSON.stringify(req.query)}`)
  //         const fileId = req.query.fileId;
  //         const userId = req.query.userId
  //         const  cases  = await casesService.getCasesByFileId(fileId, userId)
  //         if (cases.length === 0) {
  //             return res.status(200).send({
  //                 success: true,
  //                 message: "No Data Found!",
  //                 data: []
  //             })
  //         }
  //         else {
  //             return res.status(200).send({
  //                 success: true,
  //                 message: `Cases Fetched Successfully!`,
  //                 data:  cases ,
  //             })
  //         }
  //     }
  //     catch (error) {
  //         logger.error(error.message);
  //         return res.status(400).send({
  //             success: false,
  //             message: error.message
  //         });

  //     }
  // },

  // Get Case History On The Basis of Created User
  getCasesHistory: async (req, res) => {
    try {
      logger.info(
        `casesController: getCasesHistory id ${JSON.stringify(
          req.params
        )} and query ${JSON.stringify(req.query)}`
      );
      const fileId = req.params.fileId;
      const userId = req.params.userId;
      const branchId = req.params.branchId;
      const currentPage = req.query.currentPage;
      const pageSize = req.query.pageSize;
      const { cases, count, totalPages } = await casesService.getCasesHistory(
        // fileId,
        userId,
        branchId,
        currentPage,
        pageSize
      );
      if (cases.length === 0) {
        return res.status(200).send({
          success: true,
          message: "No Data Found!",
          data: [],
        });
      } else {
        return res.status(200).send({
          success: true,
          message: `Cases History Fetched Successfully!`,
          data: { cases, count, totalPages },
        });
      }
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  getAllCasesHistory: async (req, res) => {
    try {
      const fileId = req.params.fileId;
      const userId = req.params.userId;
      const branchId = req.params.branchId;
      const currentPage = req.query.currentPage;
      const pageSize = req.query.pageSize;
      const { cases, count, totalPages } =
        await casesService.getAllCasesHistory(
          // fileId,
          userId,
          branchId,
          currentPage,
          pageSize
        );
      if (cases.length === 0) {
        return res.status(200).send({
          success: true,
          message: "No Data Found!",
          data: [],
        });
      } else {
        return res.status(200).send({
          success: true,
          message: `Cases History Fetched Successfully!`,
          data: { cases, count, totalPages },
        });
      }
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  getPendingCases: async (req, res) => {
    try {
      console.log("sdfsdfsdfsd")
      const userId = req.query.userId;
      const branchId = req.query.branchId;
      const currentPage = req.query.currentPage;
      const pageSize = req.query.pageSize;
      const { cases, count, totalPages } =
        await casesService.getPendingCases(
          userId,
          branchId,
          currentPage,
          pageSize
        );
      if (cases.length === 0) {
        return res.status(200).send({
          success: true,
          message: "No Data Found!",
          data: {cases: cases},
        });
      } else {
        return res.status(200).send({
          success: true,
          message: `Cases Fetched Successfully!`,
          data: { cases, count, totalPages },
        });
      }
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  // Get Approved Case History
  getApprovedCasesHistory: async (req, res) => {
    try {
      logger.info(
        `casesController: getApprovedCasesHistory query ${JSON.stringify(
          req.query
        )}`
      );
      const fileId = req.query.fileId;
      const userId = req.query.userId;
      const branchId = req.query.branchId;
      const currentPage = req.query.currentPage;
      const pageSize = req.query.pageSize;
      const { cases, count, totalPages } =
        await casesService.getApprovedCasesHistory(
          fileId,
          userId,
          branchId,
          currentPage,
          pageSize
        );

      if (cases.length === 0) {
        return res.status(200).send({
          success: true,
          message: "No Data Found!",
          data: [],
        });
      } else {
        return res.status(200).send({
          success: true,
          message: `Cases Fetched Successfully!`,
          data: { cases, count, totalPages },
        });
      }
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  // Get Single Case
  getSingleCase: async (req, res) => {
    try {
      logger.info(
        `casesController: getSingleCase id ${JSON.stringify(req.params.id)}`
      );
      const fileId = req.params.fileId;
      const caseId = req.params.caseId;
      const cases = await casesService.getSingleCase(fileId, caseId);
      logger.info("Single Case Retrieved Successfully!");
      return res.status(200).send({
        success: true,
        message: "Single Case Retrieved Successfully!",
        data: cases,
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  // Get Single Case Details
  getSingleCaseDetails: async (req, res) => {
    try {
      logger.info(
        `casesController: getSingleCaseDetails id ${JSON.stringify(req.params)}`
      );
      const fileId = req.params.fileId;
      const caseId = req.params.caseId;
      const orderBy = req.params.orderBy;

      const cases = await casesService.getSingleCaseDetails(fileId, caseId , orderBy);
      logger.info("Single Case Details Retrieved Successfully!");
      return res.status(200).send({
        success: true,
        message: "Single Case Details Retrieved Successfully!",
        data: cases,
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  // Delete Attachment of Case Attachment
  deleteCaseAttachment: async (req, res) => {
    try {
      logger.info(
        `casesController: deleteCaseAttachment for Id ${JSON.stringify(
          req.params.id
        )}`
      );
      const caseAttachmentId = req.params.id;
      if (caseAttachmentId) {
        try {
          const deletedRows = await CaseAttachments.destroy({
            where: {
              id: caseAttachmentId,
            },
          });
          if (deletedRows > 0) {
            return res.status(200).send({
              success: true,
              message: `File attachment successfully deleted`,
              data: [],
            });
          } else {
            return res.status(404).send({
              success: false,
              message: `No record found for id ${caseAttachmentId}`, // Corrected variable name
              data: {},
            });
          }
        } catch (error) {
          console.error("Error deleting attachment:", error);
          return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message,
          });
        }
      } else {
        return res.status(400).send({
          success: false,
          message: "Invalid attachment ID",
          data: {},
        });
      }
    } catch (error) {
      console.error("Error deleting attachment:", error);
      return res.status(500).send({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Get Employees on Lower Level By User's Login
  getLowerLevelDesignations: async (req, res) => {
    try {
      logger.info(
        `casesController: getLowerLevelDesignations id ${JSON.stringify(
          req.params.id
        )}`
      );
      const userId = req.params.id;
      const cases = await casesService.getLowerLevelDesignations(userId);
      logger.info("Employees Retrieved Successfully!");
      return res.status(200).send({
        success: true,
        message: "Employees Retrieved Successfully!",
        data: cases,
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  // Get Employees on Higher Level By User's Login
  getHigherLevelDesignations: async (req, res) => {
    try {
      logger.info(
        `casesController: getHigherLevelDesignations id ${JSON.stringify(
          req.params.id
        )}`
      );
      const userId = req.params.id;
      const cases = await casesService.getHigherLevelDesignations(userId);
      logger.info("Employees Retrieved Successfully!");
      return res.status(200).send({
        success: true,
        message: "Employees Retrieved Successfully!",
        data: cases,
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  // Get Branches By User's Login
  getBranchesByUserLogin: async (req, res) => {
    try {
      logger.info(
        `casesController: getBranchesByUserLogin id ${JSON.stringify(
          req.params.id
        )}`
      );
      const userId = req.params.id;
      const cases = await casesService.getBranchesByUserLogin(userId);
      logger.info("Branches Retrieved Successfully!");
      return res.status(200).send({
        success: true,
        message: "Branches Retrieved Successfully!",
        data: cases,
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  // delete single correspondence
  deleteSingleCorrespondence: async (req, res) => {
    try {
      logger.info(
        `casesController: deleteSingleCorrespondence query ${JSON.stringify(
          req.query
        )}`
      );
      const caseId = req.query.caseId;
      const correspondenceID = req.query.correspondenceID;
      const paraID = req.query.paraID;

      if (!caseId || !paraID) {
        return res.status(400).send({
          success: false,
          message: "caseId and paraID are required",
          data: {},
        });
      }

      const result = await casesService.deleteSingleCorrespondence(
        caseId,
        paraID,
        correspondenceID
      );

      res.status(200).send({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error("Error deleting attachment:", error);
      return res.status(500).send({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  //  delete  Correspondence Attachment
  deleteCorrespondenceAttachment: async (req, res) => {
    try {
      logger.info(
        `casesController: deleteSingleCorrespondence query ${JSON.stringify(
          req.query
        )}`
      );
      const caseId = req.query.caseId;
      const correspondenceID = req.query.correspondenceID;
      const paraID = req.query.paraID;
      if (!caseId || !correspondenceID) {
        return res.status(400).send({
          success: false,
          message: "caseId and correspondenceID are required",
          data: {},
        });
      }

      const result = await casesService.deleteCorrespondenceAttachment(
        caseId,
        correspondenceID,
        paraID
      );

      res.status(200).send({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error("Error deleting attachment:", error);
      return res.status(500).send({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};

module.exports = casesController;
