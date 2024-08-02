const FileService = require("../services/file.service");
const logger = require("../common/winston");
const { uploadFile } = require("../common/upload");
const db = require("../models");
const File = db.files;
const newFiles = db.newFiles;
const fileAttachments = db.fileAttachments;
const ministries = db.ministries;
const departments = db.departments;
const branches = db.branches;
const employees = db.employees;
const Op = db.Sequelize.Op;

const fileController = {
  // Create and Save a new File
  createFile: async (req, res) => {
    try {
      const fileRegisterId = req.params.id;
      logger.info(
        `fileController: createFile body ${JSON.stringify(req.body)}`
      );
      const Files = await FileService.createFile(req.body, fileRegisterId);
      // if (file) {
      //     const path = file.destination.replace('./public/', '/public/')
      //     try {
      //         // Your code to update the database
      //         await File.update(
      //             {
      //                 attachment: `${path}/${file.originalname}`,
      //             },
      //             {
      //                 where: { id: Files.dataValues.id }
      //             }
      //         );
      //     } catch (error) {
      //         console.error("Error updating attachment:", error);
      //     }
      // }
      return res.status(200).send({
        success: true,
        message: "File Created Successfully!",
        data: Files,
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  // Retrieve All Files on the basis of File Register Id
  findFilesByRegisterId: async (req, res) => {
    try {
      logger.info(
        `fileController: findFilesByRegisterId with parameters ${JSON.stringify(
          req.params
        )} and query ${JSON.stringify(req.query)}`
      );
      const fileRegisterId = req.query.fileRegisterId;
      const mainHeadingNumber = req.query.mainHeadingNumber;
      const branchId = req.query.branchId;
      const currentPage = req.query.currentPage;
      const pageSize = req.query.pageSize;

      const { count, totalPages, files } =
        await FileService.findFilesByRegisterId(
          fileRegisterId,
          mainHeadingNumber,
          branchId,
          currentPage,
          pageSize
        );

      if (files.length === 0) {
        return res.status(200).send({
          success: true,
          message: "No Data Found!",
          data: [],
        });
      } else {
        return res.status(200).send({
          success: true,
          message: `Files fetched successfully`,
          data: { files, totalPages, count },
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

  // Make years as 2024 and then 2024-25 a list of all the years
  retrieveFormattedYears: async (req, res) => {
    try {
      logger.info(`fileController: retrieveFormattedYears`);
      const years = await FileService.retrieveFormattedYears();
      return res.status(200).send({
        success: true,
        message: `Years Retrieved Successfully!`,
        data: years,
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  // Retrieve All File
  findAllFiles: async (req, res) => {
    logger.info(`fileController: findAllFiles`);
    const { query } = req;
    const { page, pageSize, userId } = query;
    const offset = page * pageSize;
    let orderType = req.query.order;
    if (orderType == "ascend") {
      orderType = "ASC";
    } else {
      orderType = "DESC";
    }
    const defaultSortColumn = "id";
    const order = [[defaultSortColumn, orderType]];

    let whereClause = {};

    // Add the condition for filtering by assignedTo
    if (userId) {
      whereClause = {
        assignedTo: userId,
      };
    }

    let options = {
      raw: false,
      include: [
        // {
        //     model: ministries,
        //     as: 'ministries',
        //     attributes: ['ministryName', 'id'],
        // },
        // {
        //     model: departments,
        //     as: 'departments',
        //     attributes: ['departmentName', 'id'],
        // },
        {
          model: branches,
          as: "branches",
          attributes: ["branchName", "id"],
        },
        // {
        //     model: employees,
        //     as: 'employees',
        //     attributes: ['firstName', 'lastName', 'id'],
        // },
      ],
      // subQuery: false,
      // distinct: true
    };
    if (page && pageSize) {
      options = {
        ...options,
        limit: parseInt(pageSize),
        offset,
      };
    }

    options.where = whereClause;
    options.order = order;

    try {
      const { rows, count } = await newFiles.findAndCountAll(options);
      return res.status(200).send({
        success: true,
        message: `All Files Information fetched successfully`,
        data: { rows, count },
      });
    } catch (error) {
      console.error("Error fetching Files:", error.message);
      return res.status(400).send({
        success: false,
        message: "Error fetching Files",
        error: error.message,
      });
    }
  },

  // Retrieve Single File
  findSingleFile: async (req, res) => {
    const { params } = req;
    const { id } = params;
    logger.info(`fileController: findSingleFile for Id ${id}`);
    const fileRecord = await FileService.findSingleFile(id);
    if (fileRecord) {
      return res.status(200).send({
        success: true,
        message: `File fetched successfully for id ${id}`,
        data: fileRecord,
      });
    }
    return res.status(400).send({
      success: false,
      message: `No record found for id ${id}`,
      data: {},
    });
  },
  
  // Retrieve Single File
  updateCorrespondingFile: async (req, res) => {
    const { params, file } = req;
    console.log("Params", req.params);
    console.log("File", req.file);
    const { fileNumber, fileId } = params;
    logger.info(`fileController: updateCorrespondingFile for Id ${fileId}`);
    if (file) {
      const path = file.destination.replace("./public/", "/public/");
      try {
        // Your code to update the database
        await fileAttachments.create({
          filename: `${path}/${file.originalname}`,
          fkFileId: fileId,
        });
      } catch (error) {
        console.error("Error updating attachment:", error);
      }
      return res.status(200).send({
        success: true,
        message: `File Attached successfully for file ${fileId}`,
        data: [],
      });
    }
    return res.status(400).send({
      success: false,
      message: `No record found for id ${id}`,
      data: {},
    });
  },

  deleteCorrespondingFile: async (req, res) => {
    const { params } = req;
    const { id } = params;
    logger.info(`fileController: deleteCorrespondingFile for Id ${id}`);

    if (id) {
      try {
        // Your code to delete the record from the database
        const deletedRows = await fileAttachments.destroy({
          where: {
            id: id,
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
            message: `No record found for id ${id}`,
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
        message: "Invalid request. Missing id parameter.",
        data: {},
      });
    }
  },

  // Updates the File
  // updateFile: async (req, res) => {
  //     try {

  //         const { body, params } = req
  //         const { id } = params
  //         logger.info(`fileController: updateFile body ${JSON.stringify(body)}`)
  //         const FileRecord = await FileService.updateFile(id, body);
  //         if (FileRecord) {
  //             return res.status(200).send({
  //                 success: true,
  //                 message: "File Updated Successfully!",
  //                 data: FileRecord,
  //             })
  //         }

  //     } catch (error) {
  //         logger.error(error.message)
  //         return res.status(400).send({
  //             success: false,
  //             message: error.message
  //         })
  //     }
  // },

  // Update the File
  updateFile: async (req, res) => {
    try {
      const { params, body } = req;
      const { id } = params;
      logger.info(`fileController: updateFile for Id ${id}`);
      const updatedFile = await FileService.updateFile(id, body);
      return res.status(200).send({
        success: true,
        message: "File Updated Successfully!",
        data: updatedFile,
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  // Delete/Suspend the File
  suspendFile: async (req, res) => {
    try {
      const { params } = req;
      const { id } = params;
      logger.info(`fileController: suspendFile for Id ${id}`);
      const Files = await FileService.suspendFile(req);
      return res.status(200).send({
        success: true,
        message: "File Suspend/Deleted Successfully!",
        data: Files,
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  // Delete/Suspend the File
  deleteFile: async (req, res) => {
    try {
      const { params } = req;
      const { id } = params;
      logger.info(`fileController: deleteFile for Id ${id}`);
      const file = await FileService.deleteFile(id);
      return res.status(200).send({
        success: true,
        message: "File Suspended/Deleted Successfully!",
        data: file,
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },
};

module.exports = fileController;
