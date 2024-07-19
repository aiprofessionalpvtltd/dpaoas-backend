const db = require("../models");
const fs = require('fs-extra');
const motions = db.motions;
const tenures = db.tenures;
const politicalParties = db.politicalParties;
const motionMovers = db.motionMovers;
const motionMinistries = db.motionMinistries;
const motionStatusHistory = db.motionStatusHistory;
const motionStatuses = db.motionStatuses;
const ministries = db.ministries;
const noticeOfficeDairies = db.noticeOfficeDairies;
const motionStatusHistories = db.motionStatusHistories;
const sessions = db.sessions
const Members = db.members
const Branches = db.branches;
const Users = db.users;
const Employees = db.employees;
const moment = require('moment')

const Op = db.Sequelize.Op;

const motionService = {
    // Create A New Motion
    createMotion: async (req) => {
        try {
            let { fkSessionId, fileNumber, motionType, noticeOfficeDiaryNo, noticeOfficeDiaryDate, noticeOfficeDiaryTime,
                motionWeek, englishText, urduText, fkMotionStatus, moverIds, ministryIds, businessType, motionSentStatus } = req;
            let noticeOffice;
            console.log("MIDS",ministryIds)
           // console.log(noticeOfficeDiaryDate)
           // const formattedDate= moment(noticeOfficeDiaryDate).format('DD-MM-YYYY')
          //  console.log(formattedDate)

            const MotionRequest = await motions.create({
                fkSessionId,
                fileNumber,
                motionType,
                motionWeek,
                englishText,
                urduText,
                fkMotionStatus,
                motionSentStatus
            });

            if (MotionRequest) {
                noticeOffice = await noticeOfficeDairies.create({
                    noticeOfficeDiaryNo,
                    noticeOfficeDiaryDate: moment(noticeOfficeDiaryDate).format('DD-MM-YYYY'),
                    noticeOfficeDiaryTime,
                    businessType,
                    businessId: MotionRequest.dataValues.id
                });
            }
            const fkMotionId = MotionRequest.dataValues.id;
            if (Array.isArray(moverIds)) {
                const motionAssociations = moverIds.map(senatorID => ({
                    fkMotionId: fkMotionId,
                    fkMemberId: senatorID
                }));
                await motionMovers.bulkCreate(motionAssociations);
            }
            if (Array.isArray(ministryIds)) {
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
            // console.log("statusUpdation",statusUpdation)
            return MotionRequest;

        } catch (error) {
            console.error('Error creating Motion request:', error);
            throw error;
        }
    },
    // Update A Motion
    updateMotion: async (id, payload, file) => {
        try {
            let { fkSessionId, fileNumber, motionType, noticeOfficeDiaryNo, noticeOfficeDiaryDate, noticeOfficeDiaryTime,
                motionWeek, englishText, dateOfMovingHouse, dateOfDiscussion, dateOfReferringToSc, note,
                urduText, fkMotionStatus, moverIds, ministryIds, businessType } = payload;

            let noticeOffice;

            const result = await motions.findOne({
                raw: false,
                where: {
                    id: id
                }
            });
            if (file) {
                const directoryPath = `.${result.dataValues.file}`;
                // Use fs-extra to remove the directory and its contents
                if (fs.existsSync(directoryPath)) {
                    fs.removeSync(directoryPath);
                    console.log('Directory deleted successfully.');
                } else {
                    console.log('Directory does not exist.');
                }
            }

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
                    note
                },
                {
                    where: { id: id }
                }
            );
            if (UpdateMotion) {
                noticeOffice = await noticeOfficeDairies.update({
                    noticeOfficeDiaryNo,
                    noticeOfficeDiaryDate: moment(noticeOfficeDiaryDate).format('DD-MM-YYYY'),
                    noticeOfficeDiaryTime,
                    businessType,
                    businessId: id
                },
                    {
                        where: { businessId: id }
                    }
                );
            }
            if (moverIds) {
                const destroyMoverIds = await motionMovers.destroy({
                    where: {
                        fkMotionId: id,
                    }
                });

                const fkMotionId = id;
                const motionAssociations = moverIds.map(senatorID => ({
                    fkMotionId: fkMotionId,
                    fkMemberId: senatorID
                }));
                await motionMovers.bulkCreate(motionAssociations);
            }
            if (ministryIds) {
                const destroyMinistryIds = await motionMinistries.destroy({
                    where: {
                        fkMotionId: id,
                    }
                });
                const fkMotionId = id;
                const ministryAssociations = ministryIds.map(ministerId => ({
                    fkMotionId: fkMotionId,
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
                        attributes: ['id','sessionName']
                    },
                    {
                        model: motionMovers, as: 'motionMovers',
                        attributes: ['fkMemberId', 'fkMotionId', 'id'],
                        include: [
                            {
                                model: Members,
                                as: 'members',
                                attributes: ['id','memberName']
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
}

module.exports = motionService