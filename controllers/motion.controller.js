const motionService = require("../services/motions.service");
const logger = require("../common/winston");
const { uploadFile } = require("../common/upload");
const db = require("../models");
const members = db.members;
const motions = db.motions;
const tenures = db.tenures;
const ministries = db.ministries;
const sessions = db.sessions;
const motionMovers = db.motionMovers;
const motionMinistries = db.motionMinistries;
const motionStatuses = db.motionStatuses;
const noticeOfficeDairies = db.noticeOfficeDairies;
const politicalParties = db.politicalParties;
const Branches = db.branches;
const Users = db.users;
const Employees = db.employees;
const Op = db.Sequelize.Op;
const {
  validationErrorResponse,
  validResponse,
  errorResponse,
} = require("../common/validation-responses");

const MotionController = {
  // Motion Listing In Notice Branch
  getAllMotionsInNotice: async (req, res) => {
    const { query } = req;
    const {
      page,
      pageSize,
      fileNumber,
      fkSessionId,
      noticeOfficeDiaryNo,
      fkMemberId,
      fkMinistryId,
      motionId,
      sessionStartRange,
      sessionEndRange,
      fkMotionStatus,
      noticeStartRange,
      noticeEndRange,
      englishText,
      motionWeek,
      motionType,
      motionSentStatus,
      motionSentDate,
    } = query;

    const offset = page * pageSize;
    const limit = pageSize;
    logger.info(
      `MotionController: getAllMotionsInNotice query ${JSON.stringify(query)}`
    );
    const defaultSortColumn = "id";
    // const order = [['id', 'DESC']];
    let options = {
      raw: false,
      include: [
        {
          model: sessions,
          as: "sessions",
          attributes: ["sessionName", "id"],
        },
        {
          model: motionStatuses,
          as: "motionStatuses",
          attributes: ["statusName", "id"],
        },
        {
          model: noticeOfficeDairies,
          as: "noticeOfficeDairies",
          attributes: [
            "noticeOfficeDiaryNo",
            "noticeOfficeDiaryDate",
            "noticeOfficeDiaryTime",
            "businessType",
            "businessId",
          ],
        },
        {
          model: motionMovers,
          as: "motionMovers",
          attributes: ["fkMemberId", "id"],
          include: [
            {
              model: members,
              as: "members",
              attributes: ["memberName", "id"],
            },
          ],
        },
        {
          model: motionStatuses,
          as: "motionStatuses",
          attributes: ["statusName", "id"],
        },
        {
          model: motionMinistries,
          as: "motionMinistries",
          attributes: ["fkMinistryId", "id"],
          include: [
            {
              model: ministries,
              as: "ministries",
              attributes: ["ministryName", "id"],
            },
          ],
        },
      ],
      subQuery: false,
      distinct: true,
      limit,
      offset,
      order: [["id", "DESC"]],
    };

    let whereClause = {
      motionSentStatus: motionSentStatus,
    };

    if (fileNumber) {
      whereClause.fileNumber = fileNumber;
    }
    if (motionWeek) {
      whereClause.motionWeek = motionWeek;
    }
    if (motionType) {
      whereClause.motionType = motionType;
    }
    if (motionId) {
      whereClause.id = motionId;
    }
    if (englishText) {
      whereClause.englishText = { [Op.like]: `%${englishText}%` };
    }
    if (fkMemberId) {
      whereClause["$motionMovers.fkMemberId$"] = fkMemberId;
    }
    if (fkMinistryId) {
      whereClause["$motionMinistries.fkMinistryId$"] = fkMinistryId;
    }
    if (sessionStartRange && sessionEndRange) {
      whereClause["$sessions.id$"] = {
        [Op.between]: [sessionStartRange, sessionEndRange],
      };
    } else if (sessionStartRange) {
      whereClause["$sessions.id$"] = {
        [Op.gte]: sessionStartRange,
      };
    } else if (sessionEndRange) {
      whereClause["$sessions.id$"] = {
        [Op.lte]: sessionEndRange,
      };
    }
    if (noticeStartRange && noticeEndRange) {
      whereClause["$noticeOfficeDairies.noticeOfficeDiaryDate$"] = {
        [Op.between]: [noticeStartRange, noticeEndRange],
      };
    } else if (noticeStartRange) {
      whereClause["$noticeOfficeDairies.noticeOfficeDiaryDate$"] = {
        [Op.gte]: noticeStartRange,
      };
    } else if (noticeEndRange) {
      whereClause["$noticeOfficeDiary.noticeOfficeDiaryDate$"] = {
        [Op.lte]: noticeEndRange,
      };
    }
    if (noticeOfficeDiaryNo) {
      whereClause["$noticeOfficeDairies.noticeOfficeDiaryNo$"] =
        noticeOfficeDiaryNo;
    }
    if (motionSentStatus) {
      whereClause["$motionSentStatus$"] = motionSentStatus;
    }
    if (motionSentDate) {
      whereClause["$motionSentDate$"] = motionSentDate;
    }

    if (fkMotionStatus) {
      whereClause["$motionStatuses.id$"] = fkMotionStatus;
    }
    options.where = whereClause;
    try {
      const { rows, count } = await motions.findAndCountAll({
        ...options,
      });
      const totalPages = Math.ceil(count / pageSize);
      rows.forEach((motion) => {
        if (motion.file && motion.file.length) {
          motion.file = motion.file.map((imageString) =>
            JSON.parse(imageString)
          );
        } else {
          motion.file = [];
        }
      });
      if (rows.length > 0) {
        return res.status(200).send({
          success: true,
          message: `All Motions Information fetched successfully`,
          data: { totalPages, rows, count },
        });
      } else {
        return res.status(200).send({
          success: true,
          message: `Data Not Found`,
          data: { rows },
        });
      }
    } catch (error) {
      console.error("Error fetching motions:", error.message);
      return res.status(500).send({
        success: false,
        message: "Error fetching motions",
        error: error.message,
      });
    }
  },

  // Motion Listing In Motion Branch
  getAllMotions: async (req, res) => {
    const { query } = req;
    const {
      page,
      pageSize,
      fileNumber,
      fkSessionId,
      noticeOfficeDiaryNo,
      fkMemberId,
      fkMinistryId,
      motionId,
      sessionStartRange,
      sessionEndRange,
      fkMotionStatus,
      noticeStartRange,
      noticeEndRange,
      englishText,
      motionWeek,
      motionType,
      motionSentStatus,
      motionSentDate,
      memberPosition,
    } = query;

    const offset = page * pageSize;
    const limit = pageSize;
    logger.info(
      `MotionController: getAllMotions query ${JSON.stringify(query)}`
    );
    const defaultSortColumn = "id";
    // const order = [['id', 'DESC']];
    let options = {
      raw: false,
      include: [
        {
          model: sessions,
          as: "sessions",
          attributes: ["sessionName", "id"],
        },
        {
          model: motionStatuses,
          as: "motionStatuses",
          attributes: ["statusName", "id"],
        },
        {
          model: noticeOfficeDairies,
          as: "noticeOfficeDairies",
          attributes: [
            "noticeOfficeDiaryNo",
            "noticeOfficeDiaryDate",
            "noticeOfficeDiaryTime",
            "businessType",
            "businessId",
          ],
        },
        {
          model: motionMovers,
          as: "motionMovers",
          attributes: ["fkMemberId", "id"],
          include: [
            {
              model: members,
              as: "members",
              attributes: ["memberName", "id"],
            },
          ],
        },
        {
          model: motionStatuses,
          as: "motionStatuses",
          attributes: ["statusName", "id"],
        },
        {
          model: motionMinistries,
          as: "motionMinistries",
          attributes: ["fkMinistryId", "id"],
          include: [
            {
              model: ministries,
              as: "ministries",
              attributes: ["ministryName", "id"],
            },
          ],
        },
      ],
      subQuery: false,
      distinct: true,
      limit,
      offset,
      // order,
      order: [["id", "DESC"]],
      // order: [['id','DESC']]
    };

    // let whereClause = {};
    let whereClause = {
      motionSentStatus: motionSentStatus,
    };

    if (fileNumber) {
      whereClause["$fileNumber"] = fileNumber;
    }
    if (motionWeek) {
      whereClause["$motionWeek"] = motionWeek;
    }
    if (motionType) {
      whereClause["$motionType$"] = motionType;
      // whereClause.motionType = motionType;
    }
    if (motionId) {
      whereClause.id = motionId;
    }
    if (englishText) {
      whereClause["$englishText"] = { [Op.like]: `%${englishText}%` };
    }
    if (fkMemberId) {
      whereClause["$motionMovers.fkMemberId$"] = fkMemberId;
    }
    if (fkMinistryId) {
      whereClause["$motionMinistries.fkMinistryId$"] = fkMinistryId;
    }
    if (sessionStartRange && sessionEndRange) {
      whereClause["$sessions.id$"] = {
        [Op.between]: [sessionStartRange, sessionEndRange],
      };
    } else if (sessionStartRange) {
      whereClause["$sessions.id$"] = {
        [Op.gte]: sessionStartRange,
      };
    } else if (sessionEndRange) {
      whereClause["$sessions.id$"] = {
        [Op.lte]: sessionEndRange,
      };
    }
    if (noticeStartRange && noticeEndRange) {
      whereClause["$noticeOfficeDairies.noticeOfficeDiaryDate$"] = {
        [Op.between]: [noticeStartRange, noticeEndRange],
      };
    } else if (noticeStartRange) {
      whereClause["$noticeOfficeDairies.noticeOfficeDiaryDate$"] = {
        [Op.gte]: noticeStartRange,
      };
    } else if (noticeEndRange) {
      whereClause["$noticeOfficeDiary.noticeOfficeDiaryDate$"] = {
        [Op.lte]: noticeEndRange,
      };
    }
    if (noticeOfficeDiaryNo) {
      whereClause["$noticeOfficeDairies.noticeOfficeDiaryNo$"] =
        noticeOfficeDiaryNo;
    }
    if (motionSentStatus) {
      whereClause["$motionSentStatus$"] = motionSentStatus;
    }
    if (motionSentDate) {
      whereClause["$motionSentDate$"] = motionSentDate;
    }
    if (fkMotionStatus) {
      whereClause["$motionStatuses.id$"] = fkMotionStatus;
    }
    if (memberPosition) {
      whereClause["$memberPosition$"] = memberPosition;
    }

    options.where = whereClause;

    try {
      if (whereClause.length > 0) {
        options.where[Op.or] = whereClause;
      }
      const { rows, count } = await motions.findAndCountAll({
        ...options,
        //where: { motionSentStatus: "toMotion" }
      });

      const totalPages = Math.ceil(count / pageSize);
      rows.forEach((motion) => {
        if (motion.file && motion.file.length) {
          motion.file = motion.file.map((imageString) =>
            JSON.parse(imageString)
          );
        } else {
          motion.file = [];
        }
      });
      if (rows.length > 0) {
        return res.status(200).send({
          success: true,
          message: `All Motions Information fetched successfully`,
          data: { totalPages, rows, count },
        });
      } else {
        return res.status(200).send({
          success: true,
          message: `Data Not Found`,
          data: { rows },
        });
      }
    } catch (error) {
      console.error("Error fetching motions:", error.message);
      return res.status(500).send({
        success: false,
        message: "Error fetching motions",
        error: error.message,
      });
    }
  },

  generateMotionListData: async (req, res) => {
    try {
      const payload = req.body;
      const motionListData = await motionService.generateMotionListData(
        payload
      );
      logger.info("Motion list data generated successfully!");
      return res.status(200).send({
        success: true,
        message: "Motion list data generated successfully!",
        data: [motionListData],
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },
  // Update Motion List and get all Motion
  updateMotionListAndAssociations: async (req, res) => {
    try {
      const payload = req.body;
      const updatedMotionListData =
        await motionService.updateMotionListAndAssociations(payload);
      logger.info("Motion list updated and Motions associated successfully!");
      return res.status(200).send({
        success: true,
        message: "Motion list updated and Motions associated successfully!",
        data: [updatedMotionListData],
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  getAllMotionLists: async (req, res) => {
    try {
      const currentPage = parseInt(req.query.currentPage);
      const pageSize = parseInt(req.query.pageSize);

      const { count, totalPages, motionList } =
        await motionService.getAllMotionLists(currentPage, pageSize);

      if (motionList.length === 0) {
        logger.info("No data found on this page!");
        return res.status(200).send({
          success: true,
          message: "No data found on this page!",
          data: { motionList },
        });
      } else {
        logger.info("All Motion List Fetched Successfully!");
        return res.status(200).send({
          success: true,
          message: "All Motion list fetched successfully!",
          data: { motionList, totalPages, count },
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

  // delete Motion List
  deleteMotionList: async (req, res) => {
    try {
      const motionListId = req.params.id;
      const result = await motionService.deleteMotionList(motionListId);
      logger.info("Motion list deleted successfully!");
      return res.status(200).send({
        success: true,
        message: "Motion list deleted successfully!",
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  getSingleMotionData: async (req, res) => {
    try {
      const motionListId = req.params.id;
      const motionListData = await motionService.getSingleMotionData(
        motionListId
      );
      logger.info("Single Motion list data generated successfully!");
      return res.status(200).send({
        success: true,
        message: "Single Motion list data generated successfully!",
        data: [motionListData],
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },
  // Retrieves Motions by IDs
  pdfMotionList: async (req, res) => {
    try {
      const { motionsIds, motionListId } = req.body;

      // Now you have motionsIds and motionListId as separate constants
      // console.log('motionsIds:', motionsIds);
      // console.log('motionListId:', motionListId);

      // return false;
      if (!Array.isArray(motionsIds) || motionsIds.length === 0) {
        return res.status(400).send({
          success: false,
          message: "Invalid motion IDs array!",
        });
      }

      const motions = await motionService.pdfMotionList(
        motionsIds,
        motionListId
      );

      if (motions.length === 0) {
        logger.info("No data found for the provided motion IDs!");
        return res.status(200).send({
          success: true,
          message: "No data found for the provided motion IDs!",
          data: { motions },
        });
      } else {
        logger.info("Motions fetched successfully by IDs!");
        return res.status(200).send({
          success: true,
          message: "Motions fetched successfully by IDs!",
          data: { motions },
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

  // Retrieve Motions with Status 'Balloting'
  findAllBallotingMotions: async (req, res) => {
    try {
      const currentPage = parseInt(req.query.currentPage);
      const pageSize = parseInt(req.query.pageSize);
      const { count, totalPages, motions } = await motionService.findAllBallotingMotions(currentPage, pageSize);

      if (motions.length === 0) {
        logger.info("No data found on this page!")
        return res.status(200).send({
          success: true,
          message: 'No data found on this page!',
          data: { motions }
        });
      }
      else {
        logger.info("All Balloting motion Fetched Successfully!")
        return res.status(200).send({
          success: true,
          message: "All Balloting motion fetched successfully!",
          data: { motions, totalPages, count }
        })
      }

    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message,

      })
    }
  },

  updateMotionsStatus: async (req, res) => {
    try {
      const { motionIds, fkMotionStatus } = req.body; // Expecting motionIds array and fkMotionStatus
      const result = await motionService.updateMotionsStatus(motionIds, fkMotionStatus);
      if (result) {
        return res.status(200).send({
          success: true,
          message: "Motions status updated successfully!",
        })
      }
    } catch (error) {
      return res.status(400).send({
        success: false,
        message: error.message
      });
    }
  },

  getMotionTypes: async (req, res) => {
    logger.info(`SenateLegislativeController: getMotionTypes `);
    try {
      const result = await motionService.getMotionTypes();
      return validResponse(
        res,
        200,
        "All motion types fetched successfully",
        result
      );
    } catch (error) {
      logger.error(
        `Error occurred on SenateLegislativeController: getMotionTypes ${error}`
      );
      return errorResponse(res, error);
    }
  },

  // Retrieve all Motion by web_id
  findAllMotionsByWebId: async (req, res) => {
    try {
      const webId = req.query.web_id;
      console.log("sds", webId);
      const motion = await motionService.findAllMotionsByWebId(webId);
      motion.forEach((motion) => {
        if (motion.file && motion.file[0]) {
          motion.file = JSON.parse(motion.file[0]);
        } else {
          motion.file = null;
        }
      });
      logger.info("Motions fetched successfully!");
      return res.status(200).send({
        success: true,
        message: "Motions fetched successfully!",
        data: { motion },
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  // Retrieve all Motion status summary
  findAllMotionsSummary: async (req, res) => {
    try {
      const { fromSessionId, toSessionId, motionType, currentPage, pageSize } =
        req.query;
      const motionStatusCounts = await motionService.findAllMotionsSummary(
        fromSessionId,
        toSessionId,
        motionType,
        currentPage,
        pageSize
      );
      logger.info("motion Status Counts Fetched Successfully!");
      return res.status(200).send({
        success: true,
        message: "motion status count fetched successfully!",
        data: motionStatusCounts,
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  // Create Motion List and get all motions
  createMotionListAndAssociateMotions: async (req, res) => {
    try {
      const payload = req.body;
      const createdMotionList =
        await motionService.createMotionListAndAssociateMotions(payload);
      logger.info("Motion list created and motions associated successfully!");
      return res.status(200).send({
        success: true,
        message: "Motion list created and motions associated successfully!",
        data: [createdMotionList],
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  // Creates A New Motion
  createMotion: async (req, res) => {
    try {
      const { body } = req;
      logger.info(
        `MotionController: createMotion body ${JSON.stringify(body)}`
      );
      const result = await motionService.createMotion(body);

      if (!result) {
        // If motion creation failed, send an error response immediately
        return res.status(400).send({
          success: false,
          message: "Error Creating Motion!",
        });
      }

      let imageObjects = [];

      if (req.files && req.files.length > 0) {
        imageObjects = req.files.map((file, index) => {
          const path =
            file.destination.replace("./public/", "/public/") +
            file.originalname;
          const id = index + 1;
          return JSON.stringify({ id, path });
        });
      }

      const existingMotion = await motions.findOne({
        where: { id: result.id },
      });
      const existingImages = existingMotion ? existingMotion.file || [] : [];
      const updatedImages = [...existingImages, ...imageObjects];

      await motions.update(
        { file: updatedImages },
        { where: { id: result.id } }
      );

      // Fetch the updated motion data to send in the response
      const updatedMotion = await motions.findOne({ where: { id: result.id } });
      if (updatedMotion && updatedMotion.file) {
        updatedMotion.file = updatedImages.map((imageString) =>
          JSON.parse(imageString)
        );
      } else if (updatedMotion) {
        updatedMotion.file = [];
      }

      logger.info("Motion submitted!");
      return res.status(201).send({
        success: true,
        message: "Submitted",
        data: updatedMotion,
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(500).send({
        success: false,
        message:
          error.message ||
          "An error occurred during the motion creation process.",
      });
    }
  },
  // Update Motion
  updateMotion: async (req, res) => {
    try {
      const motionId = req.params.id;
      console.log("Motion Id", motionId);
      logger.info(
        `MotionController: updateMotionRequest id ${motionId} and body ${JSON.stringify(
          req.body
        )}`
      );
      const result = await motionService.updateMotion(motionId, req.body);
      if (result) {
        if (req.files && req.files.length > 0) {
          const newAttachmentObjects = req.files.map((file, index) => {
            const path =
              file.destination.replace("./public/", "/public/") +
              file.originalname;
            const id = index + 1;
            return JSON.stringify({ id, path });
          });

          const updatedImages = [...newAttachmentObjects];
          try {
            // Your code to update the database
            await motions.update(
              {
                file: updatedImages,
              },
              {
                where: { id: motionId },
              }
            );
          } catch (error) {
            console.error("Error updating attachment:", error);
          }
        }
        const updatedMotions = await motions.findOne({
          where: { id: motionId },
        });
        if (updatedMotions && updatedMotions.file) {
          updatedMotions.file = updatedMotions.file.map((imageString) =>
            JSON.parse(imageString)
          );
        }
        logger.info("Motion Request Updated Successfully!");
        return res.status(201).send({
          success: true,
          message: `Motion updated successfully!`,
          data: { result },
        });
      } else {
        return res.status(400).send({
          success: false,
          message:
            "No rows were updated. Check if the record with the provided ID exists",
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
  // Send For Translation
  sendForTranslation: async (req, res) => {
    try {
      const { body, params } = req;
      const { id } = params;
      logger.info(`MotionController: sendForTranslation id ${id}`);
      const result = await motionService.sendForTranslation(id);
      if (result) {
        logger.info("Send For Translation Successful!");
        return res.status(201).send({
          success: true,
          message: `Send for translation successful!`,
          data: { result },
        });
      } else {
        return res.status(400).send({
          success: false,
          message:
            "No rows were updated. Check if the record with the provided ID exists",
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

  // Send To Motion Branch
  sendToMotion: async (req, res) => {
    try {
      logger.info(
        `MotionController: sendToMotion id ${JSON.stringify(
          req.params.id
        )} and body ${JSON.stringify(req.body)}`
      );
      const motionId = req.params.id;
      const updatedMotion = await motionService.sendToMotion(
        req.body,
        motionId
      );
      logger.info("Motion sent to motion branch!");
      return res.status(200).send({
        success: true,
        message: "Motion sent to motion branch!",
        data: updatedMotion,
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  // Get Motion BY ID
  getMotionById: async (req, res) => {
    const { params } = req;
    const { id } = params;
    logger.info(`MotionController: getMotionById ${id}`);
    const motionRecord = await motionService.getMotionById(id);

    return res.status(200).send({
      success: true,
      message: `Motion fetched successfully for id`,
      data: motionRecord,
    });
  },

  // Revived Motion API
  reviveMotions: async (req, res) => {
    try {
      const { motionIds, fkSessionId } = req.body;
      logger.info(`MotionController: reviveMotions ${motionIds}, fkSessionId: ${fkSessionId}`);

      // Call the service method to update the fkSessionId for the provided motionIds
      const updatedMotions = await motionService.reviveMotions(motionIds, fkSessionId);

      return res.status(200).send({
        success: true,
        message: `Motions revived successfully`,
        data: updatedMotions,
      });
    } catch (error) {
      logger.error(`MotionController: Error in reviveMotions: ${error.message}`);
      return res.status(400).send({
        success: false,
        error: error.message,
      });
    }
  },

  searchMotions: async (req, res) => {
    const { query } = req;
    const {
      page,
      pageSize,
      fkMemberId,
      sessionStartRange,
      sessionEndRange,
      fkMotionStatus,
      memberPosition,
      motionType,
      politicalParty,
      governmentType,
    } = query;

    try {
      const response = await motionService.searchMotions({
        page,
        pageSize,
        fkMemberId,
        sessionStartRange,
        sessionEndRange,
        fkMotionStatus,
        memberPosition,
        motionType,
        politicalParty,
        governmentType,
      });

      if (response.rows.length > 0) {
        return res.status(200).send({
          success: true,
          message: `Motions Information fetched successfully`,
          data: response,
        });
      } else {
        return res.status(200).send({
          success: true,
          message: `Data Not Found`,
          data: { rows: [] },
        });
      }
    } catch (error) {
      console.error("Error fetching motions:", error.message);
      return res.status(500).send({
        success: false,
        message: "Error fetching motions",
        error: error.message,
      });
    }
  },


  //Get Ministries
  getMinistries: async (req, res) => {
    logger.info(`MotionController: getMinistries`);
    const result = await motionService.getMinistries();
    return res.status(200).send({
      success: true,
      message: "Ministries fetched successfully",
      data: result,
    });
  },

  //getMotionStatuses
  getMotionStatuses: async (req, res) => {
    logger.info(`MotionController: getMotionStatuses`);
    const result = await motionService.getMotionStatuses();
    return res.status(200).send({
      success: true,
      message: "Statuses fetched successfully",
      data: result,
    });
  },

  //motionDashboardStats
  motionDashboardStats: async (req, res) => {

    logger.info("MotionController: motionDashboardStats");
    try {
      const result = await motionService.motionDashboardStats();
      return res.status(200).send({
        success: true,
        message: "Motion Statuses Fetched",
        data: result,
      });
    } catch (error) {
      logger.error(`Error in motionDashboardStats: ${error.message}`);
      return res.status(500).send({
        success: false,
        message: "Error Fetching Motion Statuses",
      });
    }
  },


  // Retrieves counts and data of motions by status
  motionDiaryNumberGenerate: async (req, res) => {
    try {
      const result = await motionService.motionDiaryNumberGenerate();

      return res.status(200).send({
        success: true,
        message: "Motions new noticeOfficeDiaryNo fetched successfully!",
        data: result
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message
      });
    }
  },
};
module.exports = MotionController;
