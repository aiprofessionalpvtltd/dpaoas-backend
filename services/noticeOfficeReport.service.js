const db = require("../models");
const Sessions = db.sessions
const Motions = db.motions
const Questions = db.questions
const NoticeOfficeDairy = db.noticeOfficeDiary
const resolutionDiaries = db.resolutionDiaries;
const resolutionMovers = db.resolutionMovers;
const resolutionStatus = db.resolutionStatus;
const Resolutions = db.resolutions
const Members = db.members;
const QuestionStatus = db.questionStatus;
const QuestionDiary = db.questionDiary
const Divisions = db.divisions;
const motionMovers = db.motionMovers;
const motionMinistries = db.motionMinistries;
const motionStatuses = db.motionStatuses;
const ministries = db.ministries;
const Groups = db.groups;
const politicalParties = db.politicalParties;
const tenures = db.tenures;
const moment = require('moment');
const Op = db.Sequelize.Op;
const { where, fn, cast, col } = require('sequelize');

const noticeOfficeReportService = {

    // Retrieve Questions, Motions and Resolutions on the basis of Notice Diary Date
    getNoticeOfficeReports: async (searchCriteria) => {
        try {
            let dateFilter = {};
            if (searchCriteria.noticeOfficeDiaryDateFrom && searchCriteria.noticeOfficeDiaryDateTo) {
                dateFilter = {
                    [Op.between]: [searchCriteria.noticeOfficeDiaryDateFrom, searchCriteria.noticeOfficeDiaryDateTo],
                };
            } else if (searchCriteria.noticeOfficeDiaryDateFrom) {
                dateFilter = {
                    [Op.gte]: searchCriteria.noticeOfficeDiaryDateFrom,
                };
            }
            else if (searchCriteria.noticeOfficeDiaryDateTo) {
                dateFilter = {
                    [Op.lte]: searchCriteria.noticeOfficeDiaryDateTo,
                };
            }
            // Query options for Questions
            let questionsQueryOptions = {
                include: [
                    {
                        model: Sessions,
                        as: 'session',
                        attributes: ['id', 'sessionName']
                    },
                    {
                        model: QuestionStatus,
                        as: 'questionStatus',
                        attributes: ['id', 'questionStatus'],
                    },
                    {
                        model: Divisions,
                        as: 'divisions',
                        attributes: ['id', 'divisionName']
                    },
                    {
                        model: Groups,
                        as: 'groups',
                        attributes: ['id', 'groupNameStarred', 'groupNameUnstarred']
                    },
                    {
                        model: NoticeOfficeDairy,
                        as: 'noticeOfficeDiary',
                        attributes: ['id', 'noticeOfficeDiaryNo', 'noticeOfficeDiaryDate', 'noticeOfficeDiaryTime']
                    },
                    {
                        model: QuestionDiary,
                        as: 'questionDiary',
                        attributes: ['id', 'questionID', 'questionDiaryNo'],
                    },
                    {
                        model: Members,
                        as: 'member',
                        attributes: ['id', 'memberName'],
                    },

                ],
                subQuery: false,
                distinct: true,
                where: {},
                order: [
                    ['id', 'DESC']
                ],
                where: {
                    "$noticeOfficeDiary.noticeOfficeDiaryDate$": dateFilter,
                },
            };
            // Query options for Resolutions 
            let resolutionsQueryOptions = {
                include: [
                    {
                        model: Sessions,
                        as: 'session',
                        attributes: ['id', 'sessionName'],
                    },
                    {
                        model: resolutionStatus,
                        as: 'resolutionStatus',
                        attributes: ['id', 'resolutionStatus'],
                    },
                    {
                        model: resolutionMovers,
                        as: 'resolutionMoversAssociation',
                        attributes: ['id', 'fkMemberId'],
                        include: [
                            {
                                model: Members,
                                as: 'memberAssociation',
                                attributes: ['id', 'memberName'],
                            },
                        ],
                    },
                    {
                        model: NoticeOfficeDairy,
                        as: 'noticeDiary',
                        attributes: ['id', 'noticeOfficeDiaryNo', 'noticeOfficeDiaryDate', 'noticeOfficeDiaryTime'],
                    },
                    {
                        model: resolutionDiaries,
                        as: 'resolutionDiaries',
                        attributes: ['id', 'resolutionId', 'resolutionDiaryNo'],
                    },
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
                subQuery: false,
                distinct: true,
                where: {},
                order: [
                    ['id', 'DESC']
                ],
                where: {
                    "$noticeDiary.noticeOfficeDiaryDate$": dateFilter,
                },
            };
            // Query options for Motions
            let motionsQueryOptions = {
                include: [
                    {
                        model: Sessions,
                        as: 'sessions',
                        attributes: ['sessionName', 'id'],
                    },
                    {
                        model: motionStatuses,
                        as: 'motionStatuses',
                        attributes: ['statusName', 'id'],
                    },
                    {
                        model: NoticeOfficeDairy,
                        as: 'noticeOfficeDairies',
                        attributes: ['noticeOfficeDiaryNo', 'noticeOfficeDiaryDate', 'noticeOfficeDiaryTime', 'businessType', 'businessId'],
                    },
                    {
                        model: motionMovers,
                        as: 'motionMovers',
                        attributes: ['fkMemberId', 'id'],
                        include: [{
                            model: Members,
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
                ],
                subQuery: false,
                distinct: true,
                where: {},
                order: [
                    ['id', 'DESC']
                ],
                where: {
                    "$noticeOfficeDairies.noticeOfficeDiaryDate$": dateFilter,
                },
            };
            // Fetch questions
            const questions = await Questions.findAll(questionsQueryOptions);

            // Fetch resolutions
            const resolutions = await Resolutions.findAll(resolutionsQueryOptions);

            // Fetch Motions
            const motions = await Motions.findAll(motionsQueryOptions)
            return {
                questions,
                resolutions,
                motions
            };
        } catch (error) {
            throw new Error(error.message || "Error Fetching Reports");
        }
    },


    // // Total And Individual Stats for Questions,Motions and Resoultions
    getNoticeOfficeStats: async () => {
        try {
            // Get today's date in the format YYYY-MM-DD
            const today = moment().format('YYYY-MM-DD');

            // Count Send Questions from Notice to Question Branch
            const dailySendQuestions = await Questions.count({
                where: {
                    questionSentStatus: "fromNotice",
                    createdAt: {
                        [Op.between]: [`${today} 00:00:00`, `${today} 23:59:59`]
                    }
                },

            })

            // Count Recieved Question from Question Branch to Notice Office
            const dailyRecievedQuestions = await Questions.count({
                where: {
                    questionSentStatus: "toNotice",
                    createdAt: {
                        [Op.between]: [`${today} 00:00:00`, `${today} 23:59:59`]
                    }
                },
            })

            // Count Send Motions from Notice To Motion Branch
            const dailySendMotions = await Motions.count({
                where: {
                    motionSentStatus: "fromNotice",
                    createdAt: {
                        [Op.between]: [`${today} 00:00:00`, `${today} 23:59:59`]
                    }
                },

            })

            // Count Recieved Question from Question Branch to Notice Office
            const dailyRecievedMotions = await Motions.count({
                where: {
                    motionSentStatus: "toNotice",
                    createdAt: {
                        [Op.between]: [`${today} 00:00:00`, `${today} 23:59:59`]
                    }
                },

            })


            const totalSendQuestions = await Questions.count({
                where: {
                    questionSentStatus: "fromNotice"
                },
            })

            const totalReceivedQuestions = await Questions.count({
                where: {
                    questionSentStatus: "toNotice"
                },
            })


            const totalSendMotions = await Motions.count({
                where: {
                    motionSentStatus: 'fromNotice'
                }
            })

            const totalReceivedMotions = await Motions.count({
                where: {
                    motionSentStatus: 'toNotice'
                }
            })


            const totalQuestions = totalSendQuestions + totalReceivedQuestions
            const totalMotions = totalSendMotions + totalReceivedMotions

            const questions = { dailySendQuestions, dailyRecievedQuestions }
            const motions = { dailySendMotions, dailyRecievedMotions, }


            // Combine the counts into a single object
            const stats = {
                questions,
                motions,
                totalQuestions,
                totalMotions
            };

            return stats;

        } catch (error) {
            throw new Error(error.message || "Error Fetching Stats");
        }
    }



}

module.exports = noticeOfficeReportService