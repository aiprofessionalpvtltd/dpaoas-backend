const { where } = require("sequelize");
const db = require("../models");
const resolution = db.resolutions;
const noticeOfficeDairies = db.noticeOfficeDairies;
const resolutionDiaries = db.resolutionDiaries;
const resolutionMovers = db.resolutionMovers;
const resolutionStatus = db.resolutionStatus;
const Questions = db.questions;
const members = db.members;
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
                noticeOfficeDiaryDate: data.noticeOfficeDiaryDate ? moment(data.noticeOfficeDiaryDate).format('YYYY-MM-DD') : null,
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
                urduText: data.urduText,
                device: data.device,
                description: data.description,
                web_id: data.web_id,
                resolutionSentStatus: data.resolutionSentStatus ? data.resolutionSentStatus : 'inNotice',
                createdByUser: data.createdByUser ? data.createdByUser : null,
                memberPosition: data.memberPosition ? data.memberPosition : null
            };


            // Create the Resolution table
            const resolutions = await resolution.create(resolutionData);
            // console.log("Resolutions", resolutions)
            const resolutionId = resolutions.id;
            // console.log("resolution id", resolutionId)

            if (Array.isArray(data.resolutionMovers)) {

                for (const moverData of data.resolutionMovers) {
                    const fkMemberId = moverData.fkMemberId;

                    // Determine the fkMemberId value
                    const fkMemberIdValue = moverData.fkMemberId ? moverData.fkMemberId : (data.web_id ? data.web_id : null);
                    console.log("fkMemberIdValue=------", fkMemberIdValue)



                    // Prepare the data for resolutionMovers table
                    const resolutionMoversData = {
                        fkResolutionId: resolutionId,
                        fkMemberId: fkMemberIdValue
                    };

                    const resolutionMover = await resolutionMovers.create(resolutionMoversData);
                    console.log("resolutionMover------", resolutionMover)

                }
            } else {
                // Handle the case when resolutionMovers does not exist
                const fkMemberIdValue = data.web_id ? data.web_id : null;
                console.log("fkMemberIdValue when resolutionMovers is not present=------", fkMemberIdValue);

                // If fkMemberIdValue is not null, create a resolution mover entry
                if (fkMemberIdValue !== null) {
                    const resolutionMoversData = {
                        fkResolutionId: resolutionId,
                        fkMemberId: fkMemberIdValue
                    };

                    const resolutionMover = await resolutionMovers.create(resolutionMoversData);
                    console.log("resolutionMover when resolutionMovers is not present------", resolutionMover);
                } else {
                    console.log("No fkMemberId or web_id provided for resolutionMover.");
                }
            }

            // update businessId in noticeOfficeDairy table
            await noticeOfficeDairy.update(
                { businessId: resolutionId },
                { where: { id: noticeOfficeDairyId } }
            );


            // Return the created Resolution
            return resolutions;

        } catch (error) {
            console.log(error)
            throw { message: error.message || "Error Creating Resolution!" };
        }
    },

    // Retrieve All Resolution
    findAllResolution: async (currentPage, pageSize, resolutionSentStatus) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            let whereClause = {};

            // Add questionSentStatus to the where clause only if it's provided
            if (resolutionSentStatus) {
                whereClause.resolutionSentStatus = resolutionSentStatus;
            }


            const { count, rows } = await resolution.findAndCountAll({
                where: whereClause,
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
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    },
                    {
                        model: Users,
                        as: 'deletedBy',
                        attributes: ['id'],
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    }

                ],

                // attributes: ['id', 'fkSessionNo', 'resolutionType', 'englishText', 'urduText', 'colourResNo', 'dateOfMovingHouse', 'dateOfDiscussion', 'dateOfPassing', 'sentForTranslation', 'isTranslated', 'resolutionActive', 'attachment', 'description', 'device', 'resolutionSentStatus','resolutionSentDate'],
                offset,
                limit,
                order: [
                    ['id', 'DESC']
                ]
                // order: [['id', 'ASC']]
            });
            const totalPages = Math.ceil(count / pageSize);
            return { count, totalPages, resolution: rows };

        } catch (error) {
            throw { message: error.message || "Error Fetching All resolutions!" };
        }
    },

    // Retrieve Resolutions with Status 'Balloting'
    findAllBallotingResolutions: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            // Construct where clause using literal for subquery
            let whereClause = {
                fkResolutionStatus: {
                    [Op.in]: db.sequelize.literal(`(SELECT "id" FROM "resolutionStatuses" WHERE "resolutionStatus" = 'balloting')`)
                }
            };


            const { count, rows } = await resolution.findAndCountAll({
                where: whereClause,
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
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    },
                    {
                        model: Users,
                        as: 'deletedBy',
                        attributes: ['id'],
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    }
                ],
                offset,
                limit,
                order: [
                    ['id', 'DESC']
                ]
            });

            const totalPages = Math.ceil(count / pageSize);
            return { count, totalPages, resolution: rows };

        } catch (error) {
            throw { message: error.message || "Error Fetching Balloting Resolutions!" };
        }
    },

    // Update Resolutions Status of 'Balloting'
    updateResolutionsStatus: async (resolutionIds, fkResolutionStatus) => {
        try {
            await resolution.update(
                { fkResolutionStatus },
                { where: { id: resolutionIds } }
            );

            return { message: "Resolutions status updated successfully!" };
        } catch (error) {
            throw { message: error.message || "Error updating resolutions status!" };
        }
    },


    // Retrieve Resolutions by IDs
    pdfResolutionList: async (resolutionIds) => {
        try {

            const orderCases = resolutionIds.map((id, index) => {
                return `WHEN resolutions.id = ${id} THEN ${index}`;
            }).join(' ');

            const resolutions = await resolution.findAll({
                where: {
                    id: resolutionIds
                },
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
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    },
                    {
                        model: Users,
                        as: 'deletedBy',
                        attributes: ['id'],
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    }
                ],
                order: [
                    [sequelize.literal(`CASE ${orderCases} END`)]
                ]
            });

            // Check if all requested resolutionIds are present in the fetched resolutions
            const fetchedResolutionIds = resolutions.map(res => res.id);
            const missingIds = resolutionIds.filter(id => !fetchedResolutionIds.includes(id));

            if (missingIds.length > 0) {
                throw { message: `Resolutions not found for IDs: ${missingIds.join(', ')}` };
            }
            // Fetch the ID of the 'balloting' status
            const ballotingStatus = await resolutionStatus.findOne({
                where: { resolutionStatus: 'balloting' },
                attributes: ['id']
            });

            if (!ballotingStatus) {
                throw { message: 'Resolution status "balloting" not found' };
            }

            // Update the fkResolutionStatus to 'balloting' status ID
            await resolution.update(
                { fkResolutionStatus: ballotingStatus.id },
                { where: { id: resolutionIds } }
            );

            return resolutions;


        } catch (error) {
            throw { message: error.message || "Error Fetching Resolutions by IDs!" };
        }
    },

    getResolutionsByStatus: async (statuses) => {
        try {
            const inResolutionResolutions = await resolution.findAll({
                where: {
                    resolutionSentStatus: 'inResolution'
                },
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
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    },
                    {
                        model: Users,
                        as: 'deletedBy',
                        attributes: ['id'],
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    }
                ],
                order: [
                    ['createdAt', 'DESC']
                ]
            });

            const toResolutionResolutions = await resolution.findAll({
                where: {
                    resolutionSentStatus: 'toResolution'
                },
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
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    },
                    {
                        model: Users,
                        as: 'deletedBy',
                        attributes: ['id'],
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    }
                ],
                order: [
                    ['createdAt', 'DESC']
                ]
            });

            const counts = {
                inResolution: inResolutionResolutions.length,
                toResolution: toResolutionResolutions.length
            };

            // Structure the result
            const result = {
                counts,
                inResolutionResolutions,
                toResolutionResolutions
            };

            return result;


        } catch (error) {
            throw { message: error.message || "Error Fetching Resolutions by Status!" };
        }
    },

    // Retrieve All Resolution in Notice
    findAllResolutionInNotice: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            //const count = await resolution.count();

            const { count, rows } = await resolution.findAndCountAll({
                where: { resolutionSentStatus: "inNotice" },
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
                        as: 'deletedBy',
                        attributes: ['id'],
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    },
                    {
                        model: Users,
                        as: 'createdBy',
                        attributes: ['id'],
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    },

                ],

                // attributes: ['id', 'fkSessionNo', 'resolutionType', 'englishText', 'urduText', 'colourResNo', 'dateOfMovingHouse', 'dateOfDiscussion', 'dateOfPassing', 'sentForTranslation', 'isTranslated', 'resolutionActive', 'attachment', 'description', 'device','resolutionSentStatus','resolutionSentDate'],
                offset,
                limit,
                order: [
                    ['id', 'ASC']
                ]
                // order: [['id', 'ASC']]
            });
            const totalPages = Math.ceil(count / pageSize);

            return { count, totalPages, resolution: rows };

        } catch (error) {
            throw { message: error.message || "Error Fetching All resolutions in notice!" };
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
                noticeOfficeDiaryNo: body.noticeOfficeDiaryNo,
                noticeOfficeDiaryDate: moment(body.noticeOfficeDiaryDate).format("YYYY-MM-DD"),
                noticeOfficeDiaryTime: body.noticeOfficeDiaryTime
            }

            if (body.resolutionMovers) {
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
                        attributes: ['id', 'fkMemberId'],
                        include: [
                            {
                                model: db.members,
                                as: 'memberAssociation',
                                attributes: ['id', 'memberName']
                            }
                        ]
                    },
                    {
                        model: sessions,
                        as: 'session',
                        attributes: ['id', 'sessionName']
                    },
                    {
                        model: resolutionStatus,
                        as: 'resolutionStatus',
                        attributes: ['id', 'resolutionStatus']
                    },
                    {
                        model: noticeOfficeDairies,
                        as: 'noticeDiary',
                        attributes: ['id', 'noticeOfficeDiaryNo', 'noticeOfficeDiaryDate', 'noticeOfficeDiaryTime']
                    },
                    {
                        model: resolutionDiaries,
                        as: 'resolutionDiaries',
                        attributes: ['id', 'resolutionId', 'resolutionDiaryNo']
                    },
                    {
                        model: Users,
                        as: 'deletedBy',
                        attributes: ['id'],
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    },
                    {
                        model: Users,
                        as: 'createdBy',
                        attributes: ['id'],
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
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
                        attributes: ['id', 'sessionName']
                    },
                    {
                        model: resolutionStatus,
                        as: 'resolutionStatus',
                        attributes: ['id', 'resolutionStatus']
                    },
                    {
                        model: resolutionMovers,
                        as: 'resolutionMoversAssociation',
                        attributes: ['id', 'fkMemberId'],
                        include: [
                            {
                                model: db.members,
                                as: 'memberAssociation',
                                attributes: ['id', 'memberName']
                            }
                        ]
                    },
                    {
                        model: noticeOfficeDairies,
                        as: 'noticeDiary',
                        attributes: ['id', 'noticeOfficeDiaryNo', 'noticeOfficeDiaryDate', 'noticeOfficeDiaryTime']
                    },
                    {
                        model: resolutionDiaries,
                        as: 'resolutionDiaries',
                        attributes: ['id', 'resolutionId', 'resolutionDiaryNo']
                    },
                    {
                        model: Users,
                        as: 'deletedBy',
                        attributes: ['id'],
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    },
                    {
                        model: Users,
                        as: 'createdBy',
                        attributes: ['id'],
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    },

                ],
                attributes: ['id', 'fkSessionNo', 'resolutionType', 'englishText', 'urduText', 'colourResNo', 'dateOfMovingHouse', 'dateOfDiscussion', 'dateOfPassing', 'sentForTranslation', 'isTranslated', 'resolutionActive', 'attachment', 'description', 'device', 'memberPosition'],
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

    // Get Resolution Statuses count summary
    findAllResolutionsSummary: async (fromSessionId, toSessionId, currentPage, pageSize) => {
        try {

            const whereClause = {
                fkSessionNo: {
                    [db.Sequelize.Op.between]: [fromSessionId, toSessionId]
                }
            };

            // Fetch the data
            const resolutionStatusCounts = await db.resolutions.findAndCountAll({
                where: whereClause,
                attributes: [
                    [db.Sequelize.literal('"resolutionStatus"."resolutionStatus"'), 'statusName'],
                    [db.Sequelize.fn('COUNT', 'id'), 'statusCount']
                ],
                include: [{
                    model: db.resolutionStatus,
                    as: 'resolutionStatus',
                    attributes: []
                }],
                group: ['resolutionStatus.id'],
                offset: currentPage * pageSize,
                limit: pageSize
            });

            const resolutionStatusRows = resolutionStatusCounts.rows;

            // Calculate total count
            let totalCount = 0;
            for (const status of resolutionStatusCounts.rows) {
                totalCount += parseInt(status.dataValues.statusCount, 10);
            }

            const totalPages = Math.ceil(totalCount / pageSize);

            const modifiedResponse = {
                resolutionStatusCounts: resolutionStatusRows.concat({ statusName: "Total Resolution", statusCount: totalCount }),
                totalPages
            };

            return { ...modifiedResponse };
        } catch (error) {
            console.error(error);
        }

    },

    // Get Resolution, Motion, and Question Statuses count summary
    findAllSummary: async (fromSessionId, toSessionId) => {
        try {
            // Query to fetch session names for fromSessionId and toSessionId
            const sessions = await db.sessions.findAll({
                where: {
                    id: {
                        [db.Sequelize.Op.in]: [fromSessionId, toSessionId]
                    }
                },
                attributes: ['id', 'sessionName']
            });

            // Map the session IDs to their names
            const sessionMap = {};
            sessions.forEach(session => {
                sessionMap[session.id] = session.sessionName;
            });

            const whereClauseResolution = {
                fkSessionNo: {
                    [db.Sequelize.Op.between]: [fromSessionId, toSessionId]
                }
            };

            const whereClause = {
                fkSessionId: {
                    [db.Sequelize.Op.between]: [fromSessionId, toSessionId]
                }
            };

            // Fetch the resolution data
            const resolutionStatusCounts = await db.resolutions.findAll({
                where: whereClauseResolution,
                attributes: [
                    [db.Sequelize.literal('"resolutionStatus"."resolutionStatus"'), 'statusName'],
                    [db.Sequelize.fn('COUNT', 'id'), 'statusCount']
                ],
                include: [{
                    model: db.resolutionStatus,
                    as: 'resolutionStatus',
                    attributes: []
                }],
                group: ['resolutionStatus.id']
            });

            // Fetch the data
            const motionStatusCounts = await db.motions.findAndCountAll({
                where: whereClause,
                attributes: [
                    [db.Sequelize.literal('"motionStatuses"."statusName"'), "statusName"],
                    [db.Sequelize.fn("COUNT", "id"), "statusCount"],
                ],
                include: [
                    {
                        model: db.motionStatuses,
                        as: "motionStatuses",
                        attributes: [],
                    },
                ],
                group: ["motionStatuses.id"],
                // offset: currentPage * pageSize,
                // limit: pageSize,
            });

            // Fetch the data for "Motion Under Rule 60"
            const motionTypeCounts = await db.motions.findAndCountAll({
                where: {
                    ...whereClause,
                    motionType: 'Motion Under Rule 60'
                },
                attributes: [
                    [db.Sequelize.literal('"motionStatuses"."statusName"'), "statusName"],
                    [db.Sequelize.fn("COUNT", "id"), "statusCount"],
                ],
                include: [
                    {
                        model: db.motionStatuses,
                        as: "motionStatuses",
                        attributes: [],
                    },
                ],
                group: ["motionStatuses.id"],
            });

            // Fetch the question data by category
            const questionCategories = ['Starred', 'Un-Starred'];
            const questionCategoryCounts = {};

            for (const category of questionCategories) {
                const questionStatusCounts = await Questions.findAndCountAll({
                    where: {
                        ...whereClause,
                        questionCategory: category
                    },
                    attributes: [
                        [db.Sequelize.literal('"questionStatus"."questionStatus"'), 'status'],
                        [db.Sequelize.fn('COUNT', 'id'), 'statusCount']
                    ],
                    include: [{
                        model: db.questionStatus,
                        as: 'questionStatus',
                        attributes: []
                    }],
                    group: ['questionStatus.id']
                });

                let totalQuestionCount = 0;
                for (const status of questionStatusCounts.rows) {
                    totalQuestionCount += parseInt(status.dataValues.statusCount, 10);
                }

                questionCategoryCounts[category] = {
                    questionStatusCounts: questionStatusCounts.rows.concat({ statusName: "Total Questions", statusCount: totalQuestionCount })
                };
            }

            // Calculate total counts
            let totalResolutionCount = 0;
            let totalMotionCount = 0;
            let totalMotionTypeCount = 0;


            // Sum the counts for resolutions
            for (const status of resolutionStatusCounts) {
                totalResolutionCount += parseInt(status.dataValues.statusCount, 10);
            }

            // Sum the counts for motions
            for (const status of motionStatusCounts.rows) {
                totalMotionCount += parseInt(status.dataValues.statusCount, 10);
            }

            // Sum the counts for "Motion Under Rule 60"
            for (const status of motionTypeCounts.rows) {
                totalMotionTypeCount += parseInt(status.dataValues.statusCount, 10);
            }

            const modifiedResponse = {
                sessionNames: {
                    fromSessionName: sessionMap[fromSessionId] || 'Unknown',
                    toSessionName: sessionMap[toSessionId] || 'Unknown'
                },
                resolutionStatusCounts: resolutionStatusCounts.concat({ statusName: "Total Resolutions", statusCount: totalResolutionCount }),
                // motionStatusCounts: motionStatusCounts.rows.concat({ statusName: "Total Motions", statusCount: totalMotionCount }),
                motionTypeCounts: motionTypeCounts.rows.concat({ statusName: "Total Motions Under Rule 60", statusCount: totalMotionTypeCount }),
                questionCategoryCounts: questionCategoryCounts
            };

            return { ...modifiedResponse };
        } catch (error) {
            console.error(error);
        }
    },

    // generateDynamicHtml: async (data) => {
    //     return `
    //     <!DOCTYPE html>
    //     <html lang="en">
    //       <head>
    //         <meta charset="utf-8" />
    //         <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    //         <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    //         <title></title>
    //       </head>

    //       <body style="background: #fff; font-family: Arial, Helvetica, sans-serif">
    //         <div class="template" style="width: 940px; margin: 0 auto">
    //           <div class="template-head">
    //             <h1 style="text-align: center; font-size: 20px; text-decoration: underline">SENATE SECRETARIAT</h1>
    //             <p style="text-align: center; font-size: 20px; margin-top: 10px; margin-bottom: 10px">(Questions Branch)</p>
    //             <p style="text-align: center">*****</p>
    //             <p style="font-weight: bold; text-decoration: underline">
    //               STATEMENT SHOWING THE POSITION OF STARRED AND UN-STARRED QUESTIONS AND RESOLUTIONS DURING THE 21<sup>st</sup>
    //               PARLIAMENTARY YEAR (326<sup>th</sup> TO 335<sup>th</sup> SESSIONS) TILLDATE.
    //             </p>
    //           </div>
    //           <div class="template-detail">
    //             <p style="text-align: center; font-weight: bold; margin-top: 25px; text-decoration: underline">
    //               STARRED QUESTIONS
    //             </p>
    //             <div style="margin: 0 25px">
    //               <p style="float: left; width: 60%; margin: 10px 0">
    //                 Total Questions <span style="float: right; margin-right: 25px; font-weight: bold">:</span>
    //               </p>
    //               <p style="float: right; text-align: right; margin: 10px 0">${data.starred.totalQuestions}</p>
    //               <div style="clear: both"></div>
    //               <p style="float: left; width: 60%; margin: 10px 0">
    //                 Admitted <span style="float: right; margin-right: 25px; font-weight: bold">:</span>
    //               </p>
    //               <p style="float: right; text-align: right; margin: 10px 0">${data.starred.admitted}</p>
    //               <!-- Add more fields similarly -->
    //               <div style="clear: both"></div>
    //             </div>
    //           </div>
    //           <!-- Add similar sections for un-starred questions, resolutions, etc. -->
    //         </div>
    //       </body>
    //     </html>
    //     `;
    // },

    // generatePdf: async (htmlContent) => {
    //     const browser = await puppeteer.launch();
    //     const page = await browser.newPage();
    //     await page.setContent(htmlContent);
    //     const pdfPath = path.join(__dirname, 'pdfs', `summary-${Date.now()}.pdf`);
    //     await page.pdf({ path: pdfPath, format: 'A4' });
    //     await browser.close();
    //     return pdfPath;
    // },






    // Get all resolutions list
    getAllResolutionLists: async (currentPage, pageSize) => {
        try {

            const offset = currentPage * pageSize;
            const limit = pageSize;


            // Retrieve all resolution lists
            const { count, rows } = await db.resolutionLists.findAndCountAll({
                where: { resolutionListStatus: "active" },
                include: [
                    {
                        model: db.sessions,
                        as: 'sessionName',
                        attributes: ['id', 'sessionName']
                    }
                ],
                offset,
                limit,
                order: [
                    ['id', 'DESC']
                ]
            });


            const totalPages = Math.ceil(count / pageSize);
            return { count, totalPages, resolutionList: rows };
        } catch (error) {
            console.error('Error fetching all resolution lists:', error);
            throw error;
        }
    },

    // Update resolution list status to inactive (soft delete)
    deleteResolutionList: async (resolutionListId) => {
        try {
            // Find the resolution list by id
            const resolutionList = await db.resolutionLists.findByPk(resolutionListId);
            if (!resolutionList) {
                throw new Error('Resolution list not found');
            }

            // Update the status to inactive
            resolutionList.resolutionListStatus = 'inactive';
            await resolutionList.save();

            return { message: 'Resolution list deleted successfully' };
        } catch (error) {
            console.error('Error updating resolution list status:', error);
            throw error;
        }
    },

    // // Resolution Lits
    // createResolutionListAndAssociateResolutions: async (payload) => {
    //     try {
    //         // Create a new entry in the resolutionLists table
    //         const newResolutionList = await db.resolutionLists.create({
    //             fkSessionId: payload.fkSessionId,
    //             listName: payload.listName,
    //             listDate: payload.listDate,
    //             resolutionListStatus: payload.resolutionListStatus
    //         });

    //         // Retrieve relevant resolution records from the resolutions table
    //         const resolutions = await resolution.findAll({
    //             where: {
    //                 fkSessionNo: payload.fkSessionId
    //             },
    //             include: [
    //                 {
    //                     model: resolutionStatus,
    //                     as: 'resolutionStatus',
    //                     attributes: ['id', 'resolutionStatus']
    //                 },
    //                 {
    //                     model: resolutionMovers,
    //                     as: 'resolutionMoversAssociation',
    //                     attributes: ['id', 'fkMemberId'],
    //                     include: [
    //                         {
    //                             model: db.members,
    //                             as: 'memberAssociation',
    //                             attributes: ['id', 'memberName']
    //                         }
    //                     ]
    //                 }
    //             ]
    //         });

    //         // console.log("resolutions----->>", resolutions);

    //         // Associate each resolution with the newly created resolution list
    //         for (const resolution of resolutions) {
    //             await db.resolutionResolutionLists.create({
    //                 fkResolutionId: resolution.id,
    //                 fkResolutionListId: newResolutionList.id
    //             });
    //         }

    //         const sessionDetails = await db.sessions.findOne({
    //             where: { id: payload.fkSessionId },
    //             attributes: ['sessionName']
    //         });

    //         const createdResolutionList = await db.resolutionLists.findOne({
    //             where: { id: newResolutionList.id },
    //             include: [{
    //                 model: resolution,
    //                 as: 'resolutions',
    //                 through: { attributes: [] },
    //                 include: [
    //                     {
    //                         model: resolutionStatus,
    //                         as: 'resolutionStatus',
    //                         attributes: ['id', 'resolutionStatus']
    //                     },
    //                     {
    //                         model: resolutionMovers,
    //                         as: 'resolutionMoversAssociation',
    //                         attributes: ['id', 'fkMemberId'],
    //                         include: [
    //                             {
    //                                 model: db.members,
    //                                 as: 'memberAssociation',
    //                                 attributes: ['id', 'memberName']
    //                             }
    //                         ]
    //                     }
    //                 ]
    //             }]
    //         });


    //         //console.log("created resolution list ---->>", createdResolutionList.toJSON());


    //         // const responseData = {
    //         //     ...createdResolutionList.toJSON(),
    //         //     sessionName: sessionDetails.sessionName
    //         // };
    //         // Mapping resolutions with member names
    //         // Mapping resolutions with member names as objects
    //         const resolutionsWithMemberNames = resolutions.map(resolution => {
    //             const resolutionData = resolution.toJSON();
    //             if (resolutionData.resolutionMoversAssociation && resolutionData.resolutionMoversAssociation.length > 0) {
    //                 resolutionData.memberNames = resolutionData.resolutionMoversAssociation.map(mover => {
    //                     return mover.memberAssociation ? { memberName: mover.memberAssociation.memberName } : null;
    //                 }).filter(member => member);
    //             } else {
    //                 resolutionData.memberNames = [];
    //             }
    //             delete resolutionData.resolutionMoversAssociation; // Remove unnecessary association data
    //             return resolutionData;
    //         });

    //         // Assigning resolutions with member names to responseData
    //         const responseData = {
    //             ...createdResolutionList.toJSON(),
    //             sessionName: sessionDetails.sessionName,
    //             resolutions: resolutionsWithMemberNames
    //         };

    //         return responseData;

    //     } catch (error) {
    //         console.error('Error creating resolution list and associating resolutions:', error);
    //     }

    // },

    // Create Resolution List and get all Resolutions
    createResolutionListAndAssociateResolutions: async (payload) => {
        try {
            // Create a new entry in the resolutionLists table
            const newResolutionList = await db.resolutionLists.create({
                fkSessionId: payload.fkSessionId,
                listName: payload.listName,
                listDate: payload.listDate,
                resolutionListStatus: payload.resolutionListStatus
            });

            // Retrieve relevant resolution records from the resolutions table
            const resolutions = await db.resolutions.findAll({
                where: {
                    fkSessionNo: payload.fkSessionId
                },
                include: [
                    {
                        model: db.resolutionStatus,
                        as: 'resolutionStatus',
                        attributes: ['id', 'resolutionStatus']
                    },
                    {
                        model: db.resolutionMovers,
                        as: 'resolutionMoversAssociation',
                        attributes: ['id', 'fkMemberId'],
                        include: [
                            {
                                model: db.members,
                                as: 'memberAssociation',
                                attributes: ['id', 'memberName']
                            }
                        ]
                    }
                ]
            });

            // Associate each resolution with the newly created resolution list
            for (const resolution of resolutions) {
                await db.resolutionResolutionLists.create({
                    fkResolutionId: resolution.id,
                    fkResolutionListId: newResolutionList.id
                });
            }

            const sessionDetails = await db.sessions.findOne({
                where: { id: payload.fkSessionId },
                attributes: ['id', 'sessionName']
            });

            const createdResolutionList = await db.resolutionLists.findOne({
                where: { id: newResolutionList.id },
                include: [{
                    model: db.resolutions,
                    as: 'resolutions',
                    through: { attributes: [] },
                    include: [
                        {
                            model: db.resolutionStatus,
                            as: 'resolutionStatus',
                            attributes: ['id', 'resolutionStatus']
                        },
                        {
                            model: db.resolutionMovers,
                            as: 'resolutionMoversAssociation',
                            attributes: ['id', 'fkMemberId'],
                            include: [
                                {
                                    model: db.members,
                                    as: 'memberAssociation',
                                    attributes: ['id', 'memberName']
                                }
                            ]
                        }
                    ]
                }]
            });

            // Mapping resolutions with member names
            const resolutionsWithMemberNames = resolutions.map(resolution => {
                const resolutionData = resolution.toJSON();
                if (resolutionData.resolutionMoversAssociation && resolutionData.resolutionMoversAssociation.length > 0) {
                    resolutionData.memberNames = resolutionData.resolutionMoversAssociation.map(mover => {
                        return mover.memberAssociation ? { memberName: mover.memberAssociation.memberName } : null;
                    }).filter(member => member);
                } else {
                    resolutionData.memberNames = [];
                }
                delete resolutionData.resolutionMoversAssociation; // Remove unnecessary association data
                return resolutionData;
            });

            // Assigning resolutions with member names to responseData
            const responseData = {
                ...createdResolutionList.toJSON(),
                sessionName: sessionDetails,
                resolutions: resolutionsWithMemberNames
            };

            return responseData;

        } catch (error) {
            console.error('Error creating resolution list and associating resolutions:', error);
            throw error;
        }
    },

    // Update Resolution List and get all Resolutions
    updateResolutionListAndAssociations: async (payload) => {
        try {
            // Find the existing resolution list by ID
            const existingResolutionList = await db.resolutionLists.findOne({
                where: { id: payload.id }
            });

            if (!existingResolutionList) {
                throw new Error('Resolution list not found');
            }

            // Update the resolution list
            await existingResolutionList.update({
                fkSessionId: payload.fkSessionId,
                listName: payload.listName,
                listDate: payload.listDate,
                resolutionListStatus: payload.resolutionListStatus
            });

            // Retrieve relevant resolution records from the resolutions table
            const resolutions = await db.resolutions.findAll({
                where: {
                    fkSessionNo: payload.fkSessionId
                },
                include: [
                    {
                        model: db.resolutionStatus,
                        as: 'resolutionStatus',
                        attributes: ['id', 'resolutionStatus']
                    },
                    {
                        model: db.resolutionMovers,
                        as: 'resolutionMoversAssociation',
                        attributes: ['id', 'fkMemberId'],
                        include: [
                            {
                                model: db.members,
                                as: 'memberAssociation',
                                attributes: ['id', 'memberName']
                            }
                        ]
                    }
                ]
            });

            // Delete existing associations
            await db.resolutionResolutionLists.destroy({
                where: { fkResolutionListId: payload.id }
            });

            // Associate each resolution with the updated resolution list
            for (const resolution of resolutions) {
                await db.resolutionResolutionLists.create({
                    fkResolutionId: resolution.id,
                    fkResolutionListId: payload.id
                });
            }

            const sessionDetails = await db.sessions.findOne({
                where: { id: payload.fkSessionId },
                attributes: ['id', 'sessionName']
            });

            const updatedResolutionList = await db.resolutionLists.findOne({
                where: { id: payload.id },
                include: [{
                    model: db.resolutions,
                    as: 'resolutions',
                    through: { attributes: [] },
                    include: [
                        {
                            model: db.resolutionStatus,
                            as: 'resolutionStatus',
                            attributes: ['id', 'resolutionStatus']
                        },
                        {
                            model: db.resolutionMovers,
                            as: 'resolutionMoversAssociation',
                            attributes: ['id', 'fkMemberId'],
                            include: [
                                {
                                    model: db.members,
                                    as: 'memberAssociation',
                                    attributes: ['id', 'memberName']
                                }
                            ]
                        }
                    ]
                }]
            });

            // Mapping resolutions with member names
            const resolutionsWithMemberNames = resolutions.map(resolution => {
                const resolutionData = resolution.toJSON();
                if (resolutionData.resolutionMoversAssociation && resolutionData.resolutionMoversAssociation.length > 0) {
                    resolutionData.memberNames = resolutionData.resolutionMoversAssociation.map(mover => {
                        return mover.memberAssociation ? { memberName: mover.memberAssociation.memberName } : null;
                    }).filter(member => member);
                } else {
                    resolutionData.memberNames = [];
                }
                delete resolutionData.resolutionMoversAssociation;
                return resolutionData;
            });

            // Assigning resolutions with member names to responseData
            const responseData = {
                ...updatedResolutionList.toJSON(),
                sessionName: sessionDetails,
                resolutions: resolutionsWithMemberNames
            };

            return responseData;

        } catch (error) {
            console.error('Error updating resolution list and associating resolutions:', error);
            throw error;
        }
    },

    // ResolutionService.js
    generateResolutionListData: async (payload) => {
        try {
            console.log("payload----->>> ", payload);
            // Retrieve relevant resolution records from the resolutions table
            const resolutions = await db.resolutions.findAll({
                where: {
                    fkSessionNo: payload.fkSessionId
                },
                include: [
                    {
                        model: db.resolutionStatus,
                        as: 'resolutionStatus',
                        attributes: ['id', 'resolutionStatus']
                    },
                    {
                        model: db.resolutionMovers,
                        as: 'resolutionMoversAssociation',
                        attributes: ['id', 'fkMemberId'],
                        include: [
                            {
                                model: db.members,
                                as: 'memberAssociation',
                                attributes: ['id', 'memberName']
                            }
                        ]
                    }
                ]
            });

            const sessionDetails = await db.sessions.findOne({
                where: { id: payload.fkSessionId },
                attributes: ['id', 'sessionName']
            });

            // Mapping resolutions with member names
            const resolutionsWithMemberNames = resolutions.map(resolution => {
                const resolutionData = resolution.toJSON();
                if (resolutionData.resolutionMoversAssociation && resolutionData.resolutionMoversAssociation.length > 0) {
                    resolutionData.memberNames = resolutionData.resolutionMoversAssociation.map(mover => {
                        return mover.memberAssociation ? { memberName: mover.memberAssociation.memberName } : null;
                    }).filter(member => member);
                } else {
                    resolutionData.memberNames = [];
                }
                delete resolutionData.resolutionMoversAssociation; // Remove unnecessary association data
                return resolutionData;
            });

            // Constructing response data
            const responseData = {
                //fkSessionId: payload.fkSessionId,
                listName: payload.listName,
                listDate: payload.listDate,
                sessionName: sessionDetails,
                resolutions: resolutionsWithMemberNames
            };

            return responseData;

        } catch (error) {
            console.error('Error generating resolution list data:', error);
            throw error;
        }
    },


    // get Single Resolution Data
    getSingleResolutionData: async (resolutionListId) => {
        try {

            // Fetch the resolution list by ID
            const resolutionList = await db.resolutionLists.findOne({
                where: { id: resolutionListId },
                include: [{
                    model: db.resolutions,
                    as: 'resolutions',
                    through: { attributes: [] },
                    include: [
                        {
                            model: db.resolutionStatus,
                            as: 'resolutionStatus',
                            attributes: ['id', 'resolutionStatus']
                        },
                        {
                            model: db.resolutionMovers,
                            as: 'resolutionMoversAssociation',
                            attributes: ['id', 'fkMemberId'],
                            include: [
                                {
                                    model: db.members,
                                    as: 'memberAssociation',
                                    attributes: ['id', 'memberName']
                                }
                            ]
                        }
                    ]
                }]
            });



            if (!resolutionList) {
                throw new Error('Resolution list not found');
            }

            const resolutions = await db.resolutions.findAll({
                where: {
                    fkSessionNo: resolutionList.fkSessionId,
                    '$resolutionStatus.resolutionStatus$': {
                        [db.Sequelize.Op.in]: ['Deferred', 'Admitted']
                    }
                },
                include: [
                    {
                        model: db.resolutionStatus,
                        as: 'resolutionStatus',
                        attributes: ['id', 'resolutionStatus']
                    },
                    {
                        model: db.resolutionMovers,
                        as: 'resolutionMoversAssociation',
                        attributes: ['id', 'fkMemberId'],
                        include: [
                            {
                                model: db.members,
                                as: 'memberAssociation',
                                attributes: ['id', 'memberName']
                            }
                        ]
                    }
                ],
                order: [
                    [db.sequelize.literal(`CASE WHEN "resolutionStatus"."resolutionStatus" = 'Deferred' THEN 1 WHEN "resolutionStatus"."resolutionStatus" = 'Admitted' THEN 2 END`), 'ASC']
                ]
            });

            // Map the resolutions to include member names
            const resolutionsWithMemberNames = resolutions.map(resolution => {
                const resolutionData = resolution.toJSON();
                if (resolutionData.resolutionMoversAssociation && resolutionData.resolutionMoversAssociation.length > 0) {
                    resolutionData.memberNames = resolutionData.resolutionMoversAssociation.map(mover => {
                        return mover.memberAssociation ? { memberName: mover.memberAssociation.memberName } : null;
                    }).filter(member => member);
                } else {
                    resolutionData.memberNames = [];
                }
                delete resolutionData.resolutionMoversAssociation;
                return resolutionData;
            });

            console.log("resolutionsWithMemberNames", resolutionsWithMemberNames)

            // Prepare the response data
            const responseData = {
                ...resolutionList.toJSON(),
                resolutions: resolutionsWithMemberNames
            };

            return responseData;

        } catch (error) {
            console.error('Error generating resolution list data:', error);
            throw error;
        }
    },


    // Retrieve Resolutions by web_id
    findAllResolutionsByWebId: async (webId) => {
        try {
            const resolutionData = await resolution.findAll({
                where: { web_id: webId },
                include: [
                    {
                        model: sessions,
                        as: 'session',
                        attributes: ['id', 'sessionName']
                    },
                    {
                        model: resolutionStatus,
                        as: 'resolutionStatus',
                        attributes: ['id', 'resolutionStatus']
                    },
                    {
                        model: resolutionMovers,
                        as: 'resolutionMoversAssociation',
                        attributes: ['id', 'fkMemberId'],
                        include: [
                            {
                                model: db.members,
                                as: 'memberAssociation',
                                attributes: ['id', 'memberName']
                            }
                        ]
                    },
                    {
                        model: noticeOfficeDairies,
                        as: 'noticeDiary',
                        attributes: ['id', 'noticeOfficeDiaryNo', 'noticeOfficeDiaryDate', 'noticeOfficeDiaryTime']
                    },
                    {
                        model: resolutionDiaries,
                        as: 'resolutionDiaries',
                        attributes: ['id', 'resolutionId', 'resolutionDiaryNo']
                    },

                ],
                attributes: ['id', 'fkSessionNo', 'resolutionType', 'englishText', 'urduText', 'colourResNo', 'dateOfMovingHouse', 'dateOfDiscussion', 'dateOfPassing', 'sentForTranslation', 'isTranslated', 'resolutionActive', 'attachment', 'description', 'device', 'web_id'],
                order: [['createdAt', 'DESC']]
            });

            return resolutionData;
        }
        catch (error) {
            throw { message: error.message || "Error Fetching Resolutions by web_id" };
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

    // Send To Resolution
    sendToResolution: async (req, resolutionId) => {
        try {
            const updatedData = {
                resolutionSentStatus: "toResolution",
                resolutionSentDate: req.resolutionSentDate
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
    deleteResolution: async (resolutionId, description, deletedByUser) => {
        try {
            const updatedData =
            {
                resolutionActive: "inactive",
                description: description ? description : null,
                deletedByUser: deletedByUser ? deletedByUser : null
            }

            await resolution.update(updatedData, { where: { id: resolutionId } });

            // Fetch the deleted resolution after the update
            const deletedResolution = await resolution.findOne({ where: { id: resolutionId } });

            return deletedResolution;


        } catch (error) {
            throw { message: error.message || "Error Deleting Resolution!" };
        }
    },

    // Re-Active Resolution
    reActiveResolution: async (resolutionId) => {
        try {
            const updatedData =
            {
                resolutionActive: "active"
            }

            await resolution.update(updatedData, { where: { id: resolutionId } });

            // Fetch the deleted resolution after the update
            const reActiveResolution = await resolution.findOne({ where: { id: resolutionId } });

            return reActiveResolution;


        } catch (error) {
            throw { message: error.message || "Error Re-activate Resolution!" };
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
                resolutionSentStatus,
                resolutionSentDate,
                memberPosition
            } = queryParams;

            const query = {
                resolutionActive: 'active' // Ensure only active resolutions are included
            };

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
            if (resolutionSentStatus) {
                query["$resolutionSentStatus$"] = resolutionSentStatus;
            }
            if (resolutionSentDate) {
                query["$resolutionSentDate$"] = resolutionSentDate;
            }
            if (memberPosition) {
                if (memberPosition === "Joint Resolution") {
                    query["$memberPosition$"] = { [Op.in]: ["Treasury", "Opposition", "Independent", "Anyside"] };
                } else {
                    query["$memberPosition$"] = memberPosition;
                }
            }

            // Construct Sequelize query
            const { count, rows } = await resolution.findAndCountAll({
                include: [
                    {
                        model: db.sessions,
                        as: 'session',
                        attributes: ['id', 'sessionName'],
                    },
                    {
                        model: db.resolutionStatus,
                        as: 'resolutionStatus',
                        attributes: ['id', 'resolutionStatus'],
                    },
                    {
                        model: db.resolutionMovers,
                        as: 'resolutionMoversAssociation',
                        attributes: ['id', 'fkMemberId'],
                        include: [
                            {
                                model: db.members,
                                as: 'memberAssociation',
                                attributes: ['id', 'memberName'],
                            },
                        ],
                    },
                    {
                        model: db.noticeOfficeDairies,
                        as: 'noticeDiary',
                        attributes: ['id', 'noticeOfficeDiaryNo', 'noticeOfficeDiaryDate', 'noticeOfficeDiaryTime'],
                    },
                    {
                        model: db.resolutionDiaries,
                        as: 'resolutionDiaries',
                        attributes: ['id', 'resolutionId', 'resolutionDiaryNo'],
                    },
                    {
                        model: Users,
                        as: 'createdBy',
                        attributes: ['id'],
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    },
                    {
                        model: Users,
                        as: 'deletedBy',
                        attributes: ['id'],
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    },


                ],
                subQuery: false,
                distinct: true,
                where: query,
                offset,
                limit,
                order: [
                    ['id', 'ASC']
                ],

            });

            const totalPages = Math.ceil(count / pageSize)
            return { count: rows.length, totalPages, resolutions: rows };

            //            return resolutionsData;
        } catch (error) {
            throw { message: error.message || "Error searching resolutions!" };
        }
    },

    // Search Resolution
    selectColumnsResolution: async (queryParams, selectedColumns) => {
        try {
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
                resolutionSentStatus,
                resolutionSentDate,
                memberPosition
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
                query["$resolutionDiaries.resolutionId$"] = resolutionId;
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
            if (resolutionSentStatus) {
                query["$resolutionSentStatus$"] = resolutionSentStatus;
            }
            if (resolutionSentDate) {
                query["$resolutionSentDate$"] = resolutionSentDate;
            }
            if (memberPosition) {
                if (memberPosition === "Joint Resolution") {
                    query["$memberPosition$"] = { [Op.in]: ["Treasury", "Opposition", "Independent", "Anyside"] };
                } else {
                    query["$memberPosition$"] = memberPosition;
                }
            }

            // Construct Sequelize query with selected attributes
            const resolutionData = await resolution.findAll({
                attributes: selectedColumns.filter(col => ![
                    'sessionName', 'resolutionStatus', 'memberName',
                    'noticeOfficeDiaryNo', 'resolutionDiaryNo',
                    'createdByUser', 'deletedByUser', 'description'
                ].includes(col)).concat('id', ...(selectedColumns.includes('description') ? ['description'] : [])),
                include: [
                    {
                        model: db.sessions,
                        as: 'session',
                        attributes: selectedColumns.includes('sessionName') ? ['sessionName'] : [],
                    },
                    {
                        model: db.resolutionStatus,
                        as: 'resolutionStatus',
                        attributes: selectedColumns.includes('resolutionStatus') ? ['resolutionStatus'] : [],
                    },
                    {
                        model: db.resolutionMovers,
                        as: 'resolutionMoversAssociation',
                        attributes: selectedColumns.includes('memberName') ? ['id'] : [],
                        include: [
                            {
                                model: db.members,
                                as: 'memberAssociation',
                                attributes: selectedColumns.includes('memberName') ? ['memberName'] : [],
                            },
                        ],
                    },
                    {
                        model: db.noticeOfficeDairies,
                        as: 'noticeDiary',
                        attributes: selectedColumns.includes('noticeOfficeDiaryNo') ? ['noticeOfficeDiaryNo', 'noticeOfficeDiaryDate', 'noticeOfficeDiaryTime'] : [],
                    },
                    {
                        model: db.resolutionDiaries,
                        as: 'resolutionDiaries',
                        attributes: selectedColumns.includes('resolutionDiaryNo') ? ['resolutionDiaryNo'] : [],
                    },
                    {
                        model: Users,
                        as: 'createdBy',
                        attributes: selectedColumns.includes('createdByUser') ? ['id'] : [],
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: selectedColumns.includes('createdByUser') ? ['firstName', 'lastName'] : [],
                        }]
                    },
                    {
                        model: Users,
                        as: 'deletedBy',
                        attributes: selectedColumns.includes('deletedByUser') ? ['id'] : [],
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: selectedColumns.includes('deletedByUser') ? ['firstName', 'lastName'] : [],
                        }]
                    },
                ],
                subQuery: false,
                distinct: true,
                where: query,
                order: [
                    ['id', 'ASC']
                ],
            });

            return resolutionData;
        } catch (error) {
            throw { message: error.message || "Error searching resolutions!" };
        }
    },


    // Search Resolution Annual Service
    searchResolutionAnnualReportService: async (queryParams, currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize; // Adjust offset calculation
            const limit = pageSize;
            const currentYear = moment().year(); // Get the current year

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
                resolutionSentStatus,
                resolutionSentDate,
                memberPosition
            } = queryParams;

            const query = {};

            // Filter for the current year
            query.createdAt = {
                [Op.between]: [
                    moment().startOf('year').toDate(),
                    moment().endOf('year').toDate()
                ]
            };

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
                query["$resolutionDiaries.resolutionId$"] = resolutionId;
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
            if (resolutionSentStatus) {
                query["$resolutionSentStatus$"] = resolutionSentStatus;
            }
            if (resolutionSentDate) {
                query["$resolutionSentDate$"] = resolutionSentDate;
            }
            if (memberPosition) {
                query["$memberPosition$"] = memberPosition;
            }

            // Construct Sequelize query
            const { count, rows } = await resolution.findAndCountAll({
                include: [
                    {
                        model: db.sessions,
                        as: 'session',
                        attributes: ['id', 'sessionName'],
                    },
                    {
                        model: db.resolutionStatus,
                        as: 'resolutionStatus',
                        attributes: ['id', 'resolutionStatus'],
                    },
                    {
                        model: db.resolutionMovers,
                        as: 'resolutionMoversAssociation',
                        attributes: ['id', 'fkMemberId'],
                        include: [
                            {
                                model: db.members,
                                as: 'memberAssociation',
                                attributes: ['id', 'memberName'],
                            },
                        ],
                    },
                    {
                        model: db.noticeOfficeDairies,
                        as: 'noticeDiary',
                        attributes: ['id', 'noticeOfficeDiaryNo', 'noticeOfficeDiaryDate', 'noticeOfficeDiaryTime'],
                    },
                    {
                        model: db.resolutionDiaries,
                        as: 'resolutionDiaries',
                        attributes: ['id', 'resolutionId', 'resolutionDiaryNo'],
                    },
                    {
                        model: Users,
                        as: 'createdBy',
                        attributes: ['id'],
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    },
                    {
                        model: Users,
                        as: 'deletedBy',
                        attributes: ['id'],
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    },
                ],
                subQuery: false,
                distinct: true,
                where: query,
                offset,
                limit,
                order: [
                    ['id', 'ASC']
                ],
            });

            const totalPages = Math.ceil(count / pageSize);
            return { count: rows.length, totalPages, resolutions: rows };

        } catch (error) {
            throw { message: error.message || "Error searching resolutions!" };
        }
    },

    //search inactive resolutions
    searchInactiveResolution: async (queryParams, currentPage, pageSize) => {
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
                memberPosition
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

            if (memberPosition) {
                query["$memberPosition$"] = memberPosition;
            }

            query.resolutionActive = 'inactive';

            // Construct Sequelize query
            const { count, rows } = await resolution.findAndCountAll({
                include: [
                    {
                        model: db.sessions,
                        as: 'session',
                        attributes: ['id', 'sessionName'],
                    },
                    {
                        model: db.resolutionStatus,
                        as: 'resolutionStatus',
                        attributes: ['id', 'resolutionStatus'],
                    },
                    {
                        model: db.resolutionMovers,
                        as: 'resolutionMoversAssociation',
                        attributes: ['id', 'fkMemberId'],
                        include: [
                            {
                                model: db.members,
                                as: 'memberAssociation',
                                attributes: ['id', 'memberName'],
                            },
                        ],
                    },
                    {
                        model: db.noticeOfficeDairies,
                        as: 'noticeDiary',
                        attributes: ['id', 'noticeOfficeDiaryNo', 'noticeOfficeDiaryDate', 'noticeOfficeDiaryTime'],
                    },
                    {
                        model: db.resolutionDiaries,
                        as: 'resolutionDiaries',
                        attributes: ['id', 'resolutionId', 'resolutionDiaryNo'],
                    },
                    {
                        model: Users,
                        as: 'createdBy',
                        attributes: ['id'],
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    },
                    {
                        model: Users,
                        as: 'deletedBy',
                        attributes: ['id'],
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    }


                ],
                subQuery: false,
                distinct: true,
                where: query,
                offset,
                limit,
                order: [
                    ['id', 'ASC']
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
                    'resolutionActive',
                    'description',
                    'device',
                    'memberPosition'
                ],
            });

            const totalPages = Math.ceil(count / pageSize)
            return { count: rows.length, totalPages, resolutions: rows };

            //            return resolutionsData;
        } catch (error) {
            throw { message: error.message || "Error searching resolutions!" };
        }
    },

    // Get all resolutions filtered by session range 
    findAllResolutionsBySessionRange: async (fromSessionId, toSessionId, currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            // Create the base where clause
            let whereClause = {};
            if (fromSessionId && toSessionId) {
                whereClause = {
                    fkSessionNo: {
                        [db.Sequelize.Op.between]: [fromSessionId, toSessionId]
                    }
                };
            } else if (fromSessionId) {
                whereClause = {
                    fkSessionNo: {
                        [db.Sequelize.Op.gte]: fromSessionId
                    }
                };
            }

            console.log("whereClause--------", whereClause)

            // Fetch the data
            const { count, rows } = await resolution.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: db.sessions,
                        as: 'session',
                        attributes: ['sessionName']
                    },
                    {
                        model: db.resolutionStatus,
                        as: 'resolutionStatus',
                        attributes: ['resolutionStatus']
                    },
                    {
                        model: db.resolutionMovers,
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
                        model: db.noticeOfficeDairies,
                        as: 'noticeDiary',
                        attributes: ['noticeOfficeDiaryNo', 'noticeOfficeDiaryDate', 'noticeOfficeDiaryTime']
                    },
                    {
                        model: db.resolutionDiaries,
                        as: 'resolutionDiaries',
                        attributes: ['resolutionId', 'resolutionDiaryNo']
                    },
                    {
                        model: db.users,
                        as: 'createdBy',
                        attributes: ['id'],
                        include: [{
                            model: db.employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    },
                    {
                        model: db.users,
                        as: 'deletedBy',
                        attributes: ['id'],
                        include: [{
                            model: db.employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    }
                ],
                offset,
                limit,
                order: [['id', 'DESC']]
            });

            const totalPages = Math.ceil(count / pageSize);
            return { count, totalPages, resolutions: rows };

        } catch (error) {
            throw { message: error.message || "Error Fetching All resolutions by session range!" };
        }
    },

    resolutionDiaryNumberGenerate: async () => {
        try {
            // Determine the current session year
            const currentDate = moment();
            const currentYear = currentDate.year();
            const sessionStartDate = moment(`${currentYear}-03-12`);
            const nextYear = currentYear + 1;
            const sessionEndDate = moment(`${nextYear}-03-11`);
    
            // Fetch the latest resolution
            const latestResolution = await resolution.findOne({
                include: [
                    {
                        model: db.noticeOfficeDairies,
                        as: 'noticeDiary',
                        attributes: ['noticeOfficeDiaryNo', 'noticeOfficeDiaryDate', 'noticeOfficeDiaryTime']
                    },
                ],
                order: [["createdAt", "DESC"]],
            });
    
            let newNoticeOfficeDiaryNo;
    
            if (latestResolution && latestResolution.noticeDiary) {
                const latestDiaryDateMoment = moment(latestResolution.noticeDiary.noticeOfficeDiaryDate).startOf('day');
                const sessionEndDateMoment = sessionEndDate.startOf('day');
    
                console.log('sessionEndDate', sessionEndDateMoment.format('YYYY-MM-DD'));
                console.log('latestDiaryDate', latestDiaryDateMoment.format('YYYY-MM-DD'));
    
                // Check if the current date is after the session end date
                if (latestDiaryDateMoment.isAfter(sessionEndDateMoment, 'day')) {
                    // If noticeOfficeDiaryDate is after sessionEndDate, start from "01"
                    newNoticeOfficeDiaryNo = "01";
                } else {
                    // If noticeOfficeDiaryDate is on or before sessionEndDate, increment the number
                    const latestNo = parseInt(latestResolution.noticeDiary.noticeOfficeDiaryNo, 10);
                    newNoticeOfficeDiaryNo = String(latestNo + 1).padStart(2, "0");
                }
            } else {
                // If no noticeOfficeDiaryNo is found, start from "01"
                newNoticeOfficeDiaryNo = "01";
            }
    
            console.log('newNoticeOfficeDiaryNo', newNoticeOfficeDiaryNo);
    
            const result = {
                noticeOfficeDiaryNo: newNoticeOfficeDiaryNo, // Include the new noticeOfficeDiaryNo
            };
    
            return result;
        } catch (error) {
            throw { message: error.message || "Error Fetching Resolutions by Status!" };
        }
    },
    



}

module.exports = resolutionService