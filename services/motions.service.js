const db = require("../models");
const fs = require('fs-extra');
const motions = db.motions;
const tenures = db.tenures;
const politicalParties = db.politicalParties;
const motionMovers = db.motionMovers;
const motionMinistries = db.motionMinistries;
const motionStatusHistory = db.motionStatusHistories;
const motionStatuses = db.motionStatuses;
const ministries = db.ministries;
const noticeOfficeDairies = db.noticeOfficeDairies;
const motionStatusHistories = db.motionStatusHistories;
const sessions = db.sessions
const Members = db.members
const Branches = db.branches;
const Users = db.users;
const Employees = db.employees;
const { makeRequest } = require('../helper/makeRequest')
const moment = require('moment')

const Op = db.Sequelize.Op;

const motionService = {
    // Create A New Motion
    createMotion: async (req) => {
        try {
            let { fkSessionId, fileNumber, motionType, noticeOfficeDiaryNo, noticeOfficeDiaryDate, noticeOfficeDiaryTime,
                motionWeek, englishText, urduText, fkMotionStatus, moverIds, ministryIds, businessType, description, device, web_id, motionSentStatus, memberPosition } = req;
            let noticeOffice;


            const MotionRequest = await motions.create({
                fkSessionId,
                fileNumber,
                motionType,
                motionWeek,
                englishText,
                urduText,
                fkMotionStatus,
                description,
                device,
                web_id,
                motionSentStatus,
                memberPosition
            });

            if (MotionRequest) {
                noticeOffice = await noticeOfficeDairies.create({
                    noticeOfficeDiaryNo,
                    noticeOfficeDiaryDate: noticeOfficeDiaryDate ? moment(noticeOfficeDiaryDate).format("YYYY-MM-DD") : null,
                    noticeOfficeDiaryTime,
                    businessType,
                    businessId: MotionRequest.dataValues.id
                });
            }
            const fkMotionId = MotionRequest.dataValues.id;


            if (typeof moverIds === 'string') {
                moverIds = moverIds.split(',').map(id => parseInt(id.trim()));


                if (typeof ministryIds === 'string') {
                    ministryIds = ministryIds.split(',').map(id => parseInt(id.trim()));
                }
            }

            if (moverIds && Array.isArray(moverIds)) {
                const motionAssociations = moverIds.map(senatorID => ({
                    fkMotionId: fkMotionId,
                    fkMemberId: senatorID
                }));

                await motionMovers.bulkCreate(motionAssociations);
            }
            if (ministryIds && Array.isArray(ministryIds)) {
                const ministryAssociations = ministryIds.map(ministerId => ({
                    fkMotionId: fkMotionId,
                    fkMinistryId: ministerId
                }));

                await motionMinistries.bulkCreate(ministryAssociations);
            }
            const result = await motions.update(
                {
                    fkDairyNumber: noticeOffice.dataValues.id
                },
                {
                    where: { id: MotionRequest.dataValues.id }
                }
            );
            const statusUpdation = await motionStatusHistories.create({
                fkSessionId,
                fkMotionId: MotionRequest.dataValues.id,
                fkMotionId: MotionRequest.dataValues.id,
                fkMotionStatusId: fkMotionStatus,
                date: db.sequelize.literal('CURRENT_TIMESTAMP')
            });

            return MotionRequest;

        } catch (error) {
            console.error('Error creating Motion request:', error);
            throw error;
        }
    },
    // Update A Motion
    updateMotion: async (id, payload) => {
        try {
            let { fkSessionId, fileNumber, motionType, noticeOfficeDiaryNo, noticeOfficeDiaryDate, noticeOfficeDiaryTime,
                motionWeek, englishText, dateOfMovingHouse, dateOfDiscussion, dateOfReferringToSc, note,
                urduText, fkMotionStatus, moverIds, ministryIds, businessType, description, memberPosition, device } = payload;

            let noticeOffice;

            const result = await motions.findOne({
                raw: false,
                where: {
                    id: id
                }
            });
            // if (file) {
            //     const directoryPath = `.${result.dataValues.file}`;
            //     // Use fs-extra to remove the directory and its contents
            //     if (fs.existsSync(directoryPath)) {
            //         fs.removeSync(directoryPath);
            //         console.log('Directory deleted successfully.');
            //     } else {
            //         console.log('Directory does not exist.');
            //     }
            // }

            if (result.dataValues.fkMotionStatus != fkMotionStatus) {
                const statusUpdation = await motionStatusHistories.create({
                    fkSessionId,
                    fkMotionId: id,
                    fkMotionStatusId: fkMotionStatus,
                    date: db.sequelize.literal('CURRENT_TIMESTAMP')
                });
            }
            const UpdateMotion = await motions.update(
                {
                    fkSessionId,
                    fileNumber,
                    motionType,
                    motionWeek,
                    englishText,
                    urduText,
                    fkMotionStatus,
                    dateOfMovingHouse,
                    dateOfDiscussion,
                    dateOfReferringToSc,
                    note,
                    description,
                    memberPosition,
                    device
                },
                {
                    where: { id: id }
                }
            );
            if (UpdateMotion) {
                noticeOffice = await noticeOfficeDairies.update({
                    noticeOfficeDiaryNo,
                    noticeOfficeDiaryDate: moment(noticeOfficeDiaryDate).format("YYYY-MM-DD"),
                    noticeOfficeDiaryTime,
                    businessType,
                    businessId: id
                },
                    {
                        where: { businessId: id }
                    }
                );
            }


            if (typeof moverIds === 'string') {
                moverIds = moverIds.split(',').map(id => parseInt(id.trim()));


                if (typeof ministryIds === 'string') {
                    ministryIds = ministryIds.split(',').map(id => parseInt(id.trim()));
                }
            }

            if (moverIds && Array.isArray(moverIds)) {
                const destroyMinistryIds = await motionMovers.destroy({
                    where: {
                        fkMotionId: id,
                    }
                });
                const motionAssociations = moverIds.map(senatorID => ({
                    fkMotionId: id,
                    fkMemberId: senatorID
                }));
                await motionMovers.bulkCreate(motionAssociations);
            }
            if (ministryIds && Array.isArray(ministryIds)) {
                const destroyMinistryIds = await motionMinistries.destroy({
                    where: {
                        fkMotionId: id,
                    }
                });
                const ministryAssociations = ministryIds.map(ministerId => ({
                    fkMotionId: id,
                    fkMinistryId: ministerId
                }));
                await motionMinistries.bulkCreate(ministryAssociations);
            }
            if (UpdateMotion > 0) {

                return UpdateMotion;
            } else {
                console.log('No rows were updated. Check if the record with the provided ID exists')
            }
        } catch (error) {
            console.error('Error updating Motion request:', error.message);
        }
    },
    // Get Motion by ID
    getMotionById: async (id) => {
        try {
            const result = await motions.findOne({
                raw: false,
                where: {
                    id: id
                },
                include: [
                    {
                        model: sessions,
                        as: 'sessions',
                        attributes: ['id', 'sessionName']
                    },
                    {
                        model: motionMovers, as: 'motionMovers',
                        attributes: ['fkMemberId', 'fkMotionId', 'id'],
                        include: [
                            {
                                model: Members,
                                as: 'members',
                                attributes: ['id', 'memberName']
                            }
                        ]
                    },
                    {
                        model: motionMinistries, as: 'motionMinistries',
                        attributes: ['fkMinistryId', 'fkMotionId', 'id'],
                        include: [
                            {
                                model: ministries,
                                as: 'ministries',
                                attributes: ['id', 'ministryName']
                            }
                        ]
                    },
                    {
                        model: noticeOfficeDairies,
                        as: 'noticeOfficeDairies',
                        attributes: ['id', 'noticeOfficeDiaryNo', 'noticeOfficeDiaryDate', 'noticeOfficeDiaryTime'],
                    },
                    {
                        model: motionStatuses,
                        as: 'motionStatuses',
                        attributes: ['statusName', 'id']
                    },
                    {
                        model: motionStatusHistories,
                        as: 'motionStatusHistories',
                        attributes: ['fkMotionId', 'fkMotionStatusId', 'id'],
                        include: [{
                            model: motionStatuses,
                            as: 'motionStatuses',
                            attributes: ['statusName', 'id']
                        }],
                        distinct: true
                    },
                ],
            });
            if (result.file && result.file.length) {
                result.file = result.file.map(imageString => JSON.parse(imageString));
            }
            return result
        } catch (error) {
            console.error('Error Fetching Motion request:', error.message);
        }
    },

    getMotionTypes: async () => {
        try {
            const result = await makeRequest(
                'GET',
                'api/motiontypes',
            )
            //   this.winston.info(`motion type api response fetched successfully`)
            return result
        } catch (error) {
            // TODO: will remove later when works smoothly
            return mockMotionType
        }
    },

    // Get Motion by web_id
    findAllMotionsByWebId: async (webId) => {
        try {
            const result = await motions.findAll({
                raw: false,
                where: { web_id: webId },
                include: [
                    {
                        model: sessions,
                        as: 'sessions',
                        attributes: ['id', 'sessionName']
                    },
                    {
                        model: motionMovers, as: 'motionMovers',
                        attributes: ['fkMemberId', 'fkMotionId', 'id'],
                        include: [
                            {
                                model: Members,
                                as: 'members',
                                attributes: ['id', 'memberName']
                            }
                        ]
                    },
                    {
                        model: motionMinistries,
                        as: 'motionMinistries',
                        attributes: ['fkMinistryId', 'fkMotionId', 'id']
                    },
                    {
                        model: noticeOfficeDairies,
                        as: 'noticeOfficeDairies',
                        attributes: ['id', 'noticeOfficeDiaryNo', 'noticeOfficeDiaryDate', 'noticeOfficeDiaryTime'],
                    },
                    {
                        model: motionStatuses,
                        as: 'motionStatuses',
                        attributes: ['statusName', 'id']
                    },
                    {
                        model: motionStatusHistories,
                        as: 'motionStatusHistories',
                        attributes: ['fkMotionId', 'fkMotionStatusId', 'id'],
                        include: [{
                            model: motionStatuses,
                            as: 'motionStatuses',
                            attributes: ['statusName', 'id']
                        }],
                        distinct: true
                    },
                ],
                order: [['createdAt', 'DESC']]
            });
            if (result.file && result.file.length) {
                result.file = result.file.map(imageString => JSON.parse(imageString));
            }
            return result
        } catch (error) {
            console.error('Error Fetching Motion request:', error.message);
        }
    },
    // Get Ministries
    getMinistries: async () => {
        try {
            const result = await ministries.findAll({
                where: {
                    ministryStatus: 'active',
                },
            });
            return result
        } catch (error) {
            console.error('Error Fetching Ministries:', error.message);
        }
    },

    // Get Motion Statuses count summary
    findAllMotionsSummary: async (fromSessionId, toSessionId, motionType, currentPage, pageSize) => {
        try {

            const whereClause = {
                fkSessionId: {
                    [db.Sequelize.Op.between]: [fromSessionId, toSessionId]
                }
            };

            if (motionType) {
                whereClause.motionType = motionType;
            }

            // Fetch the data
            const motionStatusCounts = await db.motions.findAndCountAll({
                where: whereClause,
                attributes: [
                    [db.Sequelize.literal('"motionStatuses"."statusName"'), 'statusName'],
                    [db.Sequelize.fn('COUNT', 'id'), 'statusCount']
                ],
                include: [{
                    model: db.motionStatuses,
                    as: 'motionStatuses',
                    attributes: []
                }],
                group: ['motionStatuses.id'],
                offset: currentPage * pageSize,
                limit: pageSize
            });

            const motionStatusRows = motionStatusCounts.rows;

            // Calculate total count
            let totalCount = 0;
            for (const status of motionStatusCounts.rows) {
                totalCount += parseInt(status.dataValues.statusCount, 10);
            }

            const totalPages = Math.ceil(totalCount / pageSize);

            const modifiedResponse = {
                motionStatusCounts: motionStatusRows.concat({ statusName: "Total Motions", statusCount: totalCount }),
                totalPages
            };

            return { ...modifiedResponse };
        } catch (error) {
            console.error(error);
        }

    },

    // Motion Lits
    createMotionListAndAssociateMotions: async (payload) => {
        try {
            // Create a new entry in the motionLists table
            const newMotionList = await db.motionLists.create({
                fkSessionId: payload.fkSessionId,
                motionType: payload.motionType,
                motionWeek: payload.motionWeek,
                listName: payload.listName,
                listDate: payload.listDate,
                motionListStatus: payload.motionListStatus
            });

            // Retrieve relevant motion records from the motions table
            const motions = await db.motions.findAll({
                where: {
                    fkSessionId: payload.fkSessionId,
                    motionType: payload.motionType,
                    motionWeek: payload.motionWeek
                },
                include: [
                    {
                        model: db.motionMovers,
                        as: 'motionMovers',
                        include: [
                            {
                                model: db.members,
                                as: 'members',
                                attributes: ['id', 'memberName']
                            }
                        ]
                    },
                    {
                        model: motionMinistries,
                        as: 'motionMinistries',
                        include: [
                            {
                                model: db.ministries,
                                as: 'ministries',
                                attributes: ['id', 'ministryName']
                            }
                        ]
                    },
                    {
                        model: db.motionStatuses,
                        as: 'motionStatuses',
                        attributes: ['statusName']
                    }
                ]
            });

            // Associate each motion with the newly created motion list
            for (const motion of motions) {
                await db.motionMotionLists.create({
                    fkMotionId: motion.id,
                    fkMotionListId: newMotionList.id
                });
            }

            const sessionDetails = await db.sessions.findOne({
                where: { id: payload.fkSessionId },
                attributes: ['sessionName']
            });

            const createdMotionList = await db.motionLists.findOne({
                where: { id: newMotionList.id },
                include: [
                    {
                        model: db.motions,
                        as: 'motions',
                        through: {
                            attributes: []
                        },
                        include: [
                            {
                                model: db.motionMovers,
                                as: 'motionMovers',
                                include: [
                                    {
                                        model: db.members,
                                        as: 'members',
                                        attributes: ['id', 'memberName']
                                    }
                                ]
                            },
                            {
                                model: motionMinistries,
                                as: 'motionMinistries',
                                include: [
                                    {
                                        model: db.ministries,
                                        as: 'ministries',
                                        attributes: ['id', 'ministryName']
                                    }
                                ]
                            },
                            {
                                model: db.motionStatuses,
                                as: 'motionStatuses',
                                attributes: ['statusName']
                            }
                        ]
                    }
                ]
            });

            const responseData = {
                ...createdMotionList.toJSON(),
                sessionName: sessionDetails.sessionName
            };

            return responseData;
        } catch (error) {
            console.error('Error creating motion list and associating motions:', error);
        }

    },

    // Get Motion Statuses
    getMotionStatuses: async () => {
        try {
            const result = await motionStatuses.findAll({
                where: {
                    status: true,
                },
            });
            return result
        } catch (error) {
            console.error('Error Fetching Motion Statuses:', error.message);
        }
    },
    // Send For Translation
    sendForTranslation: async (id) => {
        try {
            const UpdateMotion = await motions.update(
                {
                    sentForTranslation: true
                },
                {
                    where: { id: id }
                }
            );
            return UpdateMotion
        } catch (error) {
            console.error('Error Fetching Ministries:', error.message);
        }
    },

    // Send To Motion Branch
    sendToMotion: async (req, motionId) => {
        try {
            const updatedData = {
                motionSentStatus: "toMotion",
                motionSentDate: req.motionSentDate
            }
            await motions.update(updatedData, { where: { id: motionId } });
            // Fetch the updated motion which is sent to motion branch
            const updatedMotion = await motions.findOne({ where: { id: motionId } });
            return updatedMotion;
        } catch (error) {
            throw { message: error.message || "Error Sending Motion To Motion Branch!" };
        }
    }
}

module.exports = motionService