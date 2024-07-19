const { where } = require("sequelize");
const db = require("../models");
const resolution = db.resolutions;
const noticeOfficeDairies = db.noticeOfficeDairy;
const resolutionDiaries = db.resolutionDiaries;
const resolutionMovers = db.resolutionMovers;
const resolutionStatus = db.resolutionStatus;
const sessions = db.sessions;
const sequelize = require('sequelize');
const { Op } = require("sequelize");
const moment = require('moment')
const Branches = db.branches;
const Users = db.users;
const Employees = db.employees;

const resolutionService = {

    // Create Resolution
    createResolution: async (data, url, file) => {
        try {

            // Prepare the data for noticeOfficeDairy table
            const noticeOfficeDairyData = {
                noticeOfficeDiaryNo: data.noticeOfficeDiaryNo,
                noticeOfficeDiaryDate: moment(data.noticeOfficeDiaryDate).format('DD-MM-YYYY'),
                noticeOfficeDiaryTime: data.noticeOfficeDiaryTime,
                businessType: "Resolution",
            };

            // Create the noticeOfficeDairy Data
            const noticeOfficeDairy = await noticeOfficeDairies.create(noticeOfficeDairyData);
            const noticeOfficeDairyId = noticeOfficeDairy.id;

            //create path for file attachment
            const imageUrl = file ? url + "/public/resolution/" + file.filename : null;


            // Prepare data for Resolution table
            const resolutionData = {
                fkSessionNo: data.fkSessionNo,
                fkNoticeOfficeDairyId: noticeOfficeDairyId,
                resolutionType: data.resolutionType,
                fkResolutionStatus: data.fkResolutionStatus,
                attachment: imageUrl, // Assuming 'attachment' is the field name for the file
                englishText: data.englishText,
                urduText: data.urduText
            };


            // Create the Resolution table
            const resolutions = await resolution.create(resolutionData);
            const resolutionId = resolutions.id;

            // Create ResolutionMovers entries
            for (const moverData of data.resolutionMovers) {
                const { fkMemberId } = moverData;



                // Prepare the data for resolutionMovers table
                const resolutionMoversData = {
                    fkResolutionId: resolutionId,
                    fkMemberId: fkMemberId
                };


                const resolutionMover = await resolutionMovers.create(resolutionMoversData);

            }

            // update businessId in noticeOfficeDairy table
            await noticeOfficeDairy.update(
                { businessId: resolutionId },
                { where: { id: noticeOfficeDairyId } }
            );


            // Return the created Resolution
            return resolutions;

        } catch (error) {
            throw { message: error.message || "Error Creating Resolution!" };
        }
    },

    // Retrieve All Resolution
    findAllResolution: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            const count = await resolution.count();
            const totalPages = Math.ceil(count / pageSize);

            const rows = await resolution.findAll({
                include: [
                    {
                        model: sessions,
                        as: 'session',
                        attributes: ['sessionName']
                    },
                    {
                        model: resolutionStatus,
                        as: 'resolutionStatus',
                        attributes: ['resolutionStatus']
                    },
                    {
                        model: resolutionMovers,
                        as: 'resolutionMoversAssociation',
                        attributes: ['fkMemberId'],
                        include: [
                            {
                                model: db.members,
                                as: 'memberAssociation',
                                attributes: ['memberName']
                            }
                        ]
                    },
                    {
                        model: noticeOfficeDairies,
                        as: 'noticeDiary',
                        attributes: ['noticeOfficeDiaryNo', 'noticeOfficeDiaryDate', 'noticeOfficeDiaryTime']
                    },
                    {
                        model: resolutionDiaries,
                        as: 'resolutionDiaries',
                        attributes: ['resolutionId', 'resolutionDiaryNo']
                    },
                    {
                        model: Users,
                        as: 'createdBy',
                        attributes: ['id'],
                        include: [
                            {
                                model: Employees,
                                as: 'employee',
                                attributes: ['id', 'firstName', 'lastName']
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

                attributes: ['id', 'fkSessionNo', 'resolutionType', 'englishText', 'urduText', 'dateOfMovingHouse', 'dateOfDiscussion', 'dateOfPassing', 'sentForTranslation', 'isTranslated', 'resolutionActive'],
                offset,
                limit,
                order: [['id', 'DESC']]
            });

            return { count, totalPages, resolution: rows };

        } catch (error) {
            throw { message: error.message || "Error Fetching All resolutions!" };
        }
    },

    // Get Resolution Statues
    getResolutionStatuses: async () => {
        try {
            const statuses = await resolutionStatus.findAll();
            return statuses;
        } catch (error) {
            throw new Error(error.message || "Error Fetching All Statuses");
        }
    },

    // Update Resolution
    updateResolution: async (req, resolutionId, resolutionData) => {
        try {
            const { body } = req;

            var updatedResolutionDiarie = {};
            var newResolutionId = 0


            if (resolutionData) {

                const resolutonDiary = await resolutionDiaries.findOne({
                    where: { id: resolutionData.fkResolutionDairyId },
                });

                if (resolutonDiary) {
                    const updatedResolutionDiary = {
                        resolutionDiaryNo: body.resolutionDiaryNo,
                    }

                    updatedResolutionDiarie = await resolutionDiaries.update(updatedResolutionDiary, { where: { id: resolutionData.fkResolutionDairyId } })
                }
                else {
                    newResolutionId = await resolutionDiaries.create({
                        resolutionId: resolutionData.id,
                        resolutionDiaryNo: body.resolutionDiaryNo,
                    });
                }
            } else {
                throw ({ message: "resolution not found" })
            }


            const updatedNoticeOffice =
            {
                // noticeOfficeDiaryNo: body.noticeOfficeDiaryNo,
                noticeOfficeDiaryDate: body.noticeOfficeDiaryDate,
                noticeOfficeDiaryTime: body.noticeOfficeDiaryTime
            }

            // Delete existing resolutionMovers entries
            await resolutionMovers.destroy({
                where: { fkResolutionId: resolutionId }
            });

            // Create new resolutionMovers entries
            for (const moverData of body.resolutionMovers) {
                const { fkMemberId } = moverData;

                const resolutionMoverData = {
                    fkResolutionId: resolutionId,
                    fkMemberId: fkMemberId
                };

                await resolutionMovers.create(resolutionMoverData);
            }

            const updatedResolutionData =
            {
                ...body,
                fkResolutionDairyId: newResolutionId.id,
            }

            await resolution.update(updatedResolutionData, { where: { id: resolutionId } });
            await noticeOfficeDairies.update(updatedNoticeOffice, { where: { businessId: resolutionId } });

            // Return the updated Resolution
            const updatedResolution = await resolution.findByPk(resolutionId, {
                include: [
                    {
                        model: resolutionMovers,
                        as: 'resolutionMoversAssociation',
                        attributes: ['fkMemberId'],
                        include: [
                            {
                                model: db.members,
                                as: 'memberAssociation',
                                attributes: ['memberName']
                            }
                        ]
                    },
                    {
                        model: sessions,
                        as: 'session',
                        attributes: ['sessionName']
                    },
                    {
                        model: resolutionStatus,
                        as: 'resolutionStatus',
                        attributes: ['resolutionStatus']
                    },
                    {
                        model: noticeOfficeDairies,
                        as: 'noticeDiary',
                        attributes: ['noticeOfficeDiaryNo', 'noticeOfficeDiaryDate', 'noticeOfficeDiaryTime']
                    },
                    {
                        model: resolutionDiaries,
                        as: 'resolutionDiaries',
                        attributes: ['resolutionId', 'resolutionDiaryNo']
                    },
                ]
            });

            return updatedResolution;

        } catch (error) {
            throw { message: error.message || "Error updating Resolution!" };
        }
    },

    // Retrieve Single Resolution
    findSingleResolution: async (resolutionId) => {
        try {
            const resolutionData = await resolution.findOne({
                where: { id: resolutionId },
                include: [
                    {
                        model: sessions,
                        as: 'session',
                        attributes: ['sessionName']
                    },
                    {
                        model: resolutionStatus,
                        as: 'resolutionStatus',
                        attributes: ['resolutionStatus']
                    },
                    {
                        model: resolutionMovers,
                        as: 'resolutionMoversAssociation',
                        attributes: ['fkMemberId'],
                        include: [
                            {
                                model: db.members,
                                as: 'memberAssociation',
                                attributes: ['memberName']
                            }
                        ]
                    },
                    {
                        model: noticeOfficeDairies,
                        as: 'noticeDiary',
                        attributes: ['noticeOfficeDiaryNo', 'noticeOfficeDiaryDate', 'noticeOfficeDiaryTime']
                    },
                    {
                        model: resolutionDiaries,
                        as: 'resolutionDiaries',
                        attributes: ['resolutionId', 'resolutionDiaryNo']
                    },
                    {
                        model: Users,
                        as: 'createdBy',
                        attributes: ['id'],
                        include: [
                            {
                                model: Employees,
                                as: 'employee',
                                attributes: ['id', 'firstName', 'lastName']
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
                attributes: ['id', 'fkSessionNo', 'resolutionType', 'englishText', 'urduText', 'dateOfMovingHouse', 'dateOfDiscussion', 'dateOfPassing', 'sentForTranslation', 'isTranslated', 'resolutionActive'],
            })

            if (!resolutionData) {
                throw ({ message: "Resolution Not Found!" })
            }
            return resolutionData;
        }
        catch (error) {
            throw { message: error.message || "Error Fetching Single Resolution" };
        }
    },

    // Sent To Translation
    sendTranslation: async (resolutionId) => {
        try {
            const updatedData = {
                sentForTranslation: 1
            }
            await resolution.update(updatedData, { where: { id: resolutionId } });

            // Fetch the updated resolution which is sent for tranlation
            const resolutionData = await resolution.findOne({ where: { id: resolutionId } });
            return resolutionData;
        } catch (error) {
            throw { message: error.message || "Error Sending Resolution To Translation!" };
        }
    },

    // Delete Resolution
    deleteResolution: async (resolutionId) => {
        try {
            const updatedData =
            {
                resolutionActive: "inactive"
            }

            await resolution.update(updatedData, { where: { id: resolutionId } });

            // Fetch the deleted resolution after the update
            const deletedResolution = await resolution.findOne({ where: { id: resolutionId } });

            return deletedResolution;


        } catch (error) {
            throw { message: error.message || "Error Deleting Resolution!" };
        }
    },

    // Search Resolution
    searchResolution: async (queryParams, currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const {
                fkSessionNoFrom,
                fkSessionNoTo,
                resolutionType,
                colourResNo,
                keyword,
                resolutionId,
                resolutionDiaryNo,
                fkResolutionStatus,
                noticeOfficeDiaryNo,
                noticeOfficeDiaryDateFrom,
                noticeOfficeDiaryDateTo,
                resolutionMovers,
            } = queryParams;


            const query = {};

            if (fkSessionNoFrom && fkSessionNoTo) {
                query.fkSessionNo = { [Op.between]: [fkSessionNoFrom, fkSessionNoTo] };
            }

            if (resolutionType) {
                query.resolutionType = resolutionType;
            }

            if (colourResNo) {
                query.colourResNo = colourResNo;
            }

            if (keyword) {
                query[Op.or] = [
                    { englishText: { [Op.iLike]: `%${keyword}%` } },
                    { urduText: { [Op.iLike]: `%${keyword}%` } },
                ];
            }

            if (resolutionId) {
                query["$resolutionDiaries.resolutionId$"] = resolutionId;;
            }

            if (resolutionDiaryNo) {
                query["$resolutionDiaries.resolutionDiaryNo$"] = resolutionDiaryNo;
            }

            if (fkResolutionStatus) {
                query["$resolutionStatus.id$"] = fkResolutionStatus;
            }

            if (noticeOfficeDiaryNo) {
                query["$noticeDiary.noticeOfficeDiaryNo$"] = noticeOfficeDiaryNo;
            }

            if (noticeOfficeDiaryDateFrom && noticeOfficeDiaryDateTo) {
                query["$noticeDiary.noticeOfficeDiaryDate$"] = {
                    [Op.between]: [noticeOfficeDiaryDateFrom, noticeOfficeDiaryDateTo],
                };
            } else if (noticeOfficeDiaryDateFrom) {
                query["$noticeDiary.noticeOfficeDiaryDate$"] = {
                    [Op.gte]: noticeOfficeDiaryDateFrom,
                };
            }

            if (resolutionMovers) {
                query["$resolutionMoversAssociation.fkMemberId$"] = resolutionMovers;
            }

            // Construct Sequelize query
            const { count, rows } = await resolution.findAndCountAll({
                include: [
                    {
                        model: db.sessions,
                        as: 'session',
                        attributes: ['sessionName'],
                    },
                    {
                        model: db.resolutionStatus,
                        as: 'resolutionStatus',
                        attributes: ['resolutionStatus'],
                    },
                    {
                        model: db.resolutionMovers,
                        as: 'resolutionMoversAssociation',
                        attributes: ['fkMemberId'],
                        include: [
                            {
                                model: db.members,
                                as: 'memberAssociation',
                                attributes: ['memberName'],
                            },
                        ],
                    },
                    {
                        model: db.noticeOfficeDairy,
                        as: 'noticeDiary',
                        attributes: ['noticeOfficeDiaryNo', 'noticeOfficeDiaryDate', 'noticeOfficeDiaryTime'],
                    },
                    {
                        model: db.resolutionDiaries,
                        as: 'resolutionDiaries',
                        attributes: ['resolutionId', 'resolutionDiaryNo'],
                    },
                    {
                        model: Users,
                        as: 'createdBy',
                        attributes: ['id'],
                        include: [
                            {
                                model: Employees,
                                as: 'employee',
                                attributes: ['id', 'firstName', 'lastName']
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
                where: query,
                offset,
                limit,
                order: [
                    ['id', 'DESC']
                ],
                attributes: [
                    'id',
                    'fkSessionNo',
                    'resolutionType',
                    'englishText',
                    'urduText',
                    'colourResNo',
                    'dateOfMovingHouse',
                    'dateOfDiscussion',
                    'dateOfPassing',
                    'sentForTranslation',
                    'isTranslated',
                    'resolutionActive'
                ],
            });

            const totalPages = Math.ceil(count / pageSize)
            return { count, totalPages, resolutions: rows };

            //            return resolutionsData;
        } catch (error) {
            throw { message: error.message || "Error searching resolutions!" };
        }
    },



}

module.exports = resolutionService