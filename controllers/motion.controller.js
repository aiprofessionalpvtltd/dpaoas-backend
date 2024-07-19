const motionService = require("../services/motions.service")
const logger = require('../common/winston');
const { uploadFile } = require('../common/upload')
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

const MotionController = {
    // Motion Listing
    getAllMotions: async (req, res) => {
        const { query } = req
        const { page, pageSize, fileNumber, fkSessionId, noticeOfficeDiaryNo, fkMemberId, fkMinistryId,
            motionId, sessionStartRange, sessionEndRange,
            noticeStartRange, noticeEndRange, englishText, motionWeek, motionType } = query;
        const offset = page * pageSize;
            const limit = pageSize;
        logger.info(`MotionController: getAllMotions query ${JSON.stringify(query)}`)
        let orderType = req.query.order;
        if (orderType == "ascend") {
            orderType = "ASC";
        }
        else {
            orderType = "DESC";
        }
        const defaultSortColumn = 'id';
        const order = [[defaultSortColumn, orderType]];
        let options = {
            raw: false,
            include: [
                {
                    model: sessions,
                    as: 'sessions',
                    attributes: ['sessionName', 'id'],
                },
                {
                    model: motionStatuses,
                    as: 'motionStatuses',
                    attributes: ['statusName', 'id'],
                },
                {
                    model: noticeOfficeDairies,
                    as: 'noticeOfficeDairies',
                    attributes: ['noticeOfficeDiaryNo', 'noticeOfficeDiaryDate', 'noticeOfficeDiaryTime', 'businessType', 'businessId'],
                },
                {
                    model: motionMovers,
                    as: 'motionMovers',
                    attributes: ['fkMemberId', 'id'],
                    include: [{
                        model: members,
                        as: 'members',
                        attributes: ['memberName', 'id']
                    }],
                },
                {
                    model: motionMinistries,
                    as: 'motionMinistries',
                    attributes: ['fkMinistryId', 'id'],
                    include: [{
                        model: ministries,
                        as: 'ministries',
                        attributes: ['ministryName', 'id']
                    }],
                },
                {
                    model: Users,
                    as: 'createdBy',
                    attributes: ['id'],
                    include: [
                    {
                        model: Employees,
                        as:'employee',
                        attributes: ['id','firstName','lastName']
                    }
                ]
                },
                {
                    model: Branches,
                    as: 'initiatedBy',
                    attributes: ['id', 'branchName']
                },
                {
                    model: Branches,
                    as: 'sentTo',
                    attributes: ['id', 'branchName']
                }
            ],
            subQuery: false,
            distinct: true
        }

        let whereClause = {};

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
            whereClause['$motionMovers.fkMemberId$'] = fkMemberId;
        }
        if (fkMinistryId) {
            whereClause['$motionMinistries.fkMinistryId$'] = fkMinistryId;
        }
        if (sessionStartRange) {
            whereClause['$fkSessionId$'] = {
                [Op.between]: [sessionStartRange, sessionEndRange],
            };
        }
        if (noticeStartRange) {
            whereClause['$noticeOfficeDairies.noticeOfficeDiaryDate$'] = {
                [Op.between]: [noticeStartRange, noticeEndRange],
            };
        }
        if (fkSessionId) {
            whereClause.fkSessionId = fkSessionId;
        }
        if (noticeOfficeDiaryNo) {
            whereClause['$noticeOfficeDairies.noticeOfficeDiaryNo$'] = noticeOfficeDiaryNo;
        }

      
        if (page && pageSize) {
            options = {
                ...options,
                limit: parseInt(pageSize),
                offset,
            };
        }

        options.order = order;
        options.where = whereClause;
        try {
            const { rows, count } = await motions.findAndCountAll(options);
            const totalPages = Math.ceil(count / pageSize)
            rows.forEach(motion => {
                if (motion.file && motion.file.length) {
                    motion.file = motion.file.map(imageString => JSON.parse(imageString));
                }
                else{
                    motion.file = []
                }
            });
            return res.status(200).send({
                success: true,
                message: `All Motions Information fetched successfully`,
                data: { totalPages ,rows, count },
            });
        } catch (error) {
            console.error('Error fetching motions:', error.message);
            return res.status(500).send({
                success: false,
                message: 'Error fetching motions',
                error: error.message,
            });
        }
    },
    // Creates A New Motion
    createMotion: async (req, res) => {
        try {
          const { body } = req; 
          logger.info(`MotionController: createMotion body ${JSON.stringify(body)}`);
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
              const path = file.destination.replace('./public/', '/public/') + file.originalname;
              const id = index + 1;
              return JSON.stringify({ id, path });
            });
        }

            const existingMotion = await motions.findOne({ where: { id: result.id } });
            const existingImages = existingMotion ? existingMotion.file || [] : [];
            const updatedImages = [...existingImages, ...imageObjects];
      
            await motions.update(
              { file: updatedImages },
              { where: { id: result.id } }
            );
          
      
          // Fetch the updated motion data to send in the response
          const updatedMotion = await motions.findOne({ where: { id: result.id } });
          if (updatedMotion && updatedMotion.file) {
            updatedMotion.file = updatedImages.map(imageString => JSON.parse(imageString));
          } else if (updatedMotion) {
            updatedMotion.file = [];
          }
      
          logger.info('Motion Request submitted Successfully!');
          return res.status(201).send({
            success: true,
            message: "Motion Request submitted successfully",
            data: updatedMotion , 
          });
      
        } catch (error) {
          logger.error(error.message);
          return res.status(500).send({
            success: false,
            message: error.message || "An error occurred during the motion creation process.",
          });
        }
      },      
    // Update Motion
    updateMotion: async (req, res) => {
        try {
            const { body, params, file } = req
            const { id } = params
            logger.info(
                `MotionController: updateMotionRequest id ${id} and body ${JSON.stringify(
                    body,
                )}`,
            )
            const result = await motionService.updateMotion(id, body, file);
            if (result) {
                if (req.files && req.files.length > 0) {

                    const newAttachmentObjects = req.files.map((file, index) => {
                      const path = file.destination.replace('./public/', '/public/') + file.originalname;
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
                                where: { id: id }
                            }
                        );
                    } catch (error) {
                        console.error("Error updating attachment:", error);
                    }
                }
                const updatedMotions = await motions.findOne({ where: { id: id } });
                if (updatedMotions && updatedMotions.file) {
                    updatedMotions.file = updatedMotions.file.map(imageString => JSON.parse(imageString));
                }
                logger.info('Motion Request Updated Successfully!');
                return res.status(201).send({
                    success: true,
                    message: `Motion Request Updated successfully`,
                    data: { result },
                })
            } else {
                return res.status(400).send({
                    success: false,
                    message: 'No rows were updated. Check if the record with the provided ID exists',
                });
            }
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message,
            })
        }
    },
    // Send For Translation
    sendForTranslation: async (req, res) => {
        try {
            const { body, params } = req
            const { id } = params
            logger.info(
                `MotionController: sendForTranslation id ${id}`,
            )
            const result = await motionService.sendForTranslation(id);
            if (result) {
                logger.info('Send For Translation Successful!');
                return res.status(201).send({
                    success: true,
                    message: `Send For Translation Successful!`,
                    data: { result },
                })
            } else {
                return res.status(400).send({
                    success: false,
                    message: 'No rows were updated. Check if the record with the provided ID exists',
                });
            }
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message,
            })
        }
    },

    // Get Motion BY ID
    getMotionById: async (req, res) => {
        const { params } = req
        const { id } = params
        logger.info(`MotionController: getMotionById ${id}`)
        const motionRecord = await motionService.getMotionById(id)

        return res.status(200).send({
            success: true,
            message: `Motion fetched successfully for id ${id}`,
            data: motionRecord,
        })
    },
    //Get Ministries
    getMinistries: async (req, res) => {
        logger.info(`MotionController: getMinistries`);
        const result = await motionService.getMinistries();
        return res.status(200).send({
            success: true,
            message: 'Ministries fetched successfully',
            data: result,
        });
    },

    //getMotionStatuses
    getMotionStatuses: async (req, res) => {
        logger.info(`MotionController: getMotionStatuses`);
        const result = await motionService.getMotionStatuses();
        return res.status(200).send({
            success: true,
            message: 'Statuses fetched successfully',
            data: result,
        });
    },
}
module.exports = MotionController;