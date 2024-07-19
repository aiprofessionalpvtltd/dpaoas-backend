const db = require("../models");
const fs = require('fs-extra');
const Questions = db.questions;
const NoticeOfficeDairy = db.noticeOfficeDiary
const Sessions = db.sessions;
const Members = db.members;
const QuestionStatus = db.questionStatus;
const QuestionDiary = db.questionDiary
const Divisions = db.divisions;
const Groups = db.groups;
const QuestionFile = db.questionFile
const QuestionRevival = db.questionRevival
const QuestionDefer = db.questionDefer
const QuestionStatusHistory = db.questionStatusHistory
const Branches = db.branches
const Users = db.users
const Employees = db.employees
const moment = require('moment')
const Op = db.Sequelize.Op;

const questionsService = {
    // Create A New Question
    createQuestion: async (req, url, file) => {
        try {
            const formattedDate = moment(req.noticeOfficeDiaryDate).format('DD-MM-YYYY');
            //const imageUrl = file ? url + "/public/questions/" + file.filename : null;
            // Create a new Question
            const question = await Questions.create({
                fkSessionId: req.fkSessionId,
                questionCategory: req.questionCategory,
                fkMemberId: req.fkMemberId,
                // questionImage: imageUrl,
                englishText: req.englishText,
                urduText: req.urduText,
                fkQuestionStatus: req.fkQuestionStatus, // Assuming a default value
                createdByUser: req.createdByUser,
                initiatedByBranch: req.initiatedByBranch,
                sentToBranch: req.sentToBranch,
                questionSentStatus: req.questionSentStatus

            });

            const noticeOfficeDiary = await NoticeOfficeDairy.create({
                noticeOfficeDiaryNo: req.noticeOfficeDiaryNo,
                noticeOfficeDiaryDate: moment(req.noticeOfficeDiaryDate).format('DD-MM-YYYY'),
                noticeOfficeDiaryTime: req.noticeOfficeDiaryTime,
                businessType: 'Question',
                businessId: question.dataValues.id
            });
            // Creating An Entry in Question Status History
            await QuestionStatusHistory.create({
                fkQuestionId: question.id,
                fkSessionId: req.fkSessionId,
                fkQuestionStatus: req.fkQuestionStatus,
                questionStatusDate: db.sequelize.literal('CURRENT_TIMESTAMP')

            });

            // Update the Questions with the ID of the notice office diary id
            await Questions.update(
                { fkNoticeDiary: noticeOfficeDiary.id },
                { where: { id: question.id } }
            );


            // const updatedQuestions = await Questions.findOne({ where: { id: question.id } });
            return question;

        } catch (error) {
            throw { message: error.message || "Error Creating Question!" };

        }

    },

    // Retrieve All Questions
    getAllQuestions: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const { count, rows } = await Questions.findAndCountAll({
                include: [
                    {
                        model: QuestionRevival,
                        as: 'questionRevival',
                        include: [
                            {
                                model: Sessions,
                                as: 'ToSession',
                                attributes: ['id', 'sessionName'],
                            },
                            {
                                model: Sessions,
                                as: 'FromSession',
                                attributes: ['id', 'sessionName']
                            }
                        ],
                        attributes: ['id', 'fkFromSessionId', 'fkToSessionId']
                    },
                    {
                        model: Sessions,
                        attributes: ['id', 'sessionName'],
                    },
                    {
                        model: QuestionStatus,
                        attributes: ['id', 'questionStatus'],
                    },
                    {
                        model: Members,
                        attributes: ['id', 'memberName'],
                    },
                    {
                        model: QuestionDiary,
                        attributes: ['id', 'questionID', 'questionDiaryNo'],
                    },
                    {
                        model: NoticeOfficeDairy,
                        as: 'noticeOfficeDiary',
                        attributes: ['id', 'noticeOfficeDiaryNo', 'noticeOfficeDiaryDate', 'noticeOfficeDiaryTime'],
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
                ],
                offset,
                limit,
                order: [
                    ['id', 'DESC']
                ]
            });
            // Parse questionImage attribute if present
            rows.forEach(question => {
                if (question.questionImage && question.questionImage.length) {
                    question.questionImage = question.questionImage.map(imageString => JSON.parse(imageString));
                }
                else {
                    question.questionImage = []
                }
            });
            const totalPages = Math.ceil(count / pageSize)
            return { count, totalPages, questions: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All Questions");
        }
    },

    // Find Single Question
    getSingleQuestion: async (questionId) => {
        try {

            const question = await Questions.findOne({
                where: { id: questionId },
                include: [
                    {
                        model: QuestionRevival,
                        as: 'questionRevival',
                        include: [
                            {
                                model: Sessions,
                                as: 'ToSession',
                                attributes: ['id', 'sessionName'],

                                model: Sessions,
                                as: 'FromSession',
                                attributes: ['id', 'sessionName']
                            }
                        ],
                        attributes: ['id', 'fkFromSessionId', 'fkToSessionId']
                    },
                    {
                        model: Sessions,
                        attributes: ['id', 'sessionName'],
                    },
                    {
                        model: QuestionStatus,
                        attributes: ['id', 'questionStatus'],
                    },
                    {
                        model: Members,
                        attributes: ['id', 'memberName'],
                    },
                    {
                        model: QuestionDiary,
                        attributes: ['id', 'questionID', 'questionDiaryNo'],
                    },
                    {
                        model: NoticeOfficeDairy,
                        as: 'noticeOfficeDiary',
                        attributes: ['id', 'noticeOfficeDiaryNo', 'noticeOfficeDiaryDate', 'noticeOfficeDiaryTime'],
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

                if (question.questionImage && question.questionImage.length) {
                    question.questionImage = question.questionImage.map(imageString => JSON.parse(imageString));
                }
                else 
                {
                    question.questionImage = []
                }
            return question;
        } catch (error) {
            throw new Error(error.message || "Error Fetching Question");

        }
    },

    // Get Question Statues
    getQuestionStatuses: async () => {
        try {
            const sessions = await QuestionStatus.findAll();
            return sessions;
        } catch (error) {
            throw new Error(error.message || "Error Fetching All Sessions");
        }
    },

    // Search Question
    searchQuestion: async (searchCriteria, currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            let queryOptions = {
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
                distinct: true,
                where: {},
                offset,
                limit,
                order: [
                    ['id', 'DESC']
                ]
            };

            // Build the query options based on search criteria
            for (const key in searchCriteria) {
                // Adjust the query based on your model and search requirements
                // Example:
                if (key === 'fromSessionNo') {
                    queryOptions.where['$session.id$'] = { [Op.gte]: searchCriteria[key] };
                }
                if (key === 'toSessionNo') {
                    queryOptions.where['$session.id$'][Op.lte] = searchCriteria[key];
                }
                if (key === 'questionID') {
                    queryOptions.where['$questionDiary.questionID$'] = { [Op.eq]: searchCriteria[key] };
                }
                if (key === 'questionDiaryNo') {
                    queryOptions.where['$questionDiary.questionDiaryNo$'] = { [Op.eq]: searchCriteria[key] };
                }
                if (key === 'keyword') {
                    queryOptions.where[Op.or] = [
                        { englishText: { [Op.iLike]: `%${searchCriteria.keyword}%` } },
                        { urduText: { [Op.iLike]: `%${searchCriteria.keyword}%` } },
                    ];
                }
                if (key === 'memberName') {
                    queryOptions.where['$member.id$'] = { [Op.eq]: searchCriteria[key] };
                }
                if (key === 'questionCategory') {
                    queryOptions.where['$questionCategory$'] = { [Op.eq]: searchCriteria[key] };
                }
                if (key === 'divisions') {
                    queryOptions.where['$divisions.id$'] = { [Op.eq]: searchCriteria[key] };
                }
                if (key === 'groups') {
                    queryOptions.where['$groups.id$'] = { [Op.eq]: searchCriteria[key] };
                }
                if (key === 'noticeOfficeDiaryNo') {
                    queryOptions.where['$noticeOfficeDiary.noticeOfficeDiaryNo$'] = { [Op.eq]: searchCriteria[key] };
                }
                if (searchCriteria.noticeOfficeDiaryDateFrom && searchCriteria.noticeOfficeDiaryDateTo) {
                    queryOptions.where['$noticeOfficeDiary.noticeOfficeDiaryDate$'] = {
                        [Op.between]: [searchCriteria.noticeOfficeDiaryDateFrom, searchCriteria.noticeOfficeDiaryDateTo],
                    };
                } else if (searchCriteria.noticeOfficeDiaryDateFrom) {
                    queryOptions.where['$noticeOfficeDiary.noticeOfficeDiaryDate$'] = {
                        [Op.gte]: searchCriteria.noticeOfficeDiaryDateFrom,
                    };
                } else if (searchCriteria.noticeOfficeDiaryDateTo) {
                    queryOptions.where['$noticeOfficeDiary.noticeOfficeDiaryDate$'] = {
                        [Op.lte]: searchCriteria.noticeOfficeDiaryDateTo,
                    };
                }
                if (key === 'questionStatus') {
                    queryOptions.where['$questionStatus.id$'] = { [Op.eq]: searchCriteria[key] };
                }
                if (key === 'fileStatus') {
                    queryOptions.where['$fileStatus$'] = { [Op.eq]: searchCriteria[key] };
                }
            }

            // Fetch the count and rows of questions based on the search criteria
            const { count, rows } = await Questions.findAndCountAll(queryOptions);
            const totalPages = Math.ceil(count / pageSize)
            return { count, totalPages, questions: rows };

            // return { count, questions };
        } catch (error) {
            throw new Error(error.message || "Error Searching Question");
        }
    },

    // Update Question
    updateQuestion: async (req, question, questionId) => {
        try {
            var updatedQuesDiary = {};
            var updatedQuestionDiaryId = 0;

            // Updating Question Status History
            if (req.fkQuestionStatus) {
                const oldQuestionStatus = question.fkQuestionStatus;
                const newQuestionStatus = req.fkQuestionStatus;
                const currentDate = new Date();
                if (oldQuestionStatus !== newQuestionStatus) {
                    await QuestionStatusHistory.create({
                        fkQuestionId: questionId,
                        fkSessionId: question.fkSessionId,
                        fkQuestionStatus: newQuestionStatus,
                        questionStatusDate: currentDate.toISOString()

                    });
                }
            }

            if (question) {

                const questionDiary = await QuestionDiary.findOne({
                    where: { id: question.fkQuestionDiaryId },
                });

                if (questionDiary) {

                    const updatedQuestionDiary = {
                        questionDiaryNo: req.questionDiaryNo,
                    }
                    //Updating the Question Diary if it exists
                    updatedQuesDiary = await QuestionDiary.update(updatedQuestionDiary, { where: { id: question.fkQuestionDiaryId } })
                }
                else {
                    // Creating The Question Diary if its not created
                    updatedQuestionDiaryId = await QuestionDiary.create({
                        questionID: question.id,
                        questionDiaryNo: req.questionDiaryNo,
                    });
                }
            } else {
                throw ({ message: "Question Not Found!" })
            }

            // For Updating Notice Office Data
            const updatedNoticeOffice =
            {
                noticeOfficeDiaryNo: req.noticeOfficeDiaryNo,
                noticeOfficeDiaryDate: moment(req.noticeOfficeDiaryDate).format("DD-MM-YYYY"),
                noticeOfficeDiaryTime: req.noticeOfficeDiaryTime,
            }
            // Updating Notice Office
            await NoticeOfficeDairy.update(updatedNoticeOffice, { where: { businessId: questionId } });

            // For Creating Question File Data         
            const questionFileData = {
                fkQuestionId: questionId,
                fileStatus: req.fileStatus,
                fileStatusDate: db.sequelize.literal('CURRENT_TIMESTAMP')
            }

            // Adding Data into Question File History 
            if (req.fileStatus) {
                await QuestionFile.create(questionFileData)
            }

            // Updating Question Table
            const updatedQuestion =
            {
                ...req,
                fkQuestionDiaryId: updatedQuestionDiaryId.id,

            }
            // Updating Question
            const updatedQuestions = await Questions.update(updatedQuestion, { where: { id: questionId } });
            return updatedQuestions

        } catch (error) {
            throw { message: error.message || "Error Updating Question!" };
        }
    },

    // Revived Question
    reviveQuestion: async (req, question) => {
        try {
            // Create Revived Question
            const revivedQuestion = await QuestionRevival.create({
                fkQuestionId: question.id,
                fkFromSessionId: req.fkFromSessionId,
                fkToSessionId: req.fkToSessionId,
                fkGroupId: req.fkGroupId,
                fkDivisionId: req.fkDivisionId,
                fkQuestionStatus: req.fkQuestionStatus,
            });

            // For Updating Notice Office Data
            const updatedNoticeOffice =
            {
                noticeOfficeDiaryNo: req.noticeOfficeDiaryNo,
                noticeOfficeDiaryDate: req.noticeOfficeDiaryDate,
                noticeOfficeDiaryTime: req.noticeOfficeDiaryTime,
            }
            // Updating Notice Office
            const noticeDiary = await NoticeOfficeDairy.update(updatedNoticeOffice, { where: { businessId: question.id } });

            const updatedQuestionDiary = {
                questionDiaryNo: req.questionDiaryNo,
            }
            //Updating the Question Diary if it exists
            const updatedQuesDiary = await QuestionDiary.update(updatedQuestionDiary, { where: { id: question.fkQuestionDiaryId } })

            // Updating Question Revival
            await QuestionRevival.update({
                fkNoticeDiaryId: noticeDiary,
                fkQuestionDiaryId: updatedQuesDiary,
            },
                {
                    where: { id: revivedQuestion.id }
                })

            // Update Question's isRevived field
            await Questions.update({
                isRevived: true,
                fkQuestionStatus: req.quesfkQuestionStatus,
                fkSessionId: req.fkToSessionId
            },
                {
                    where: { id: question.id }
                })
            return revivedQuestion;
        } catch (error) {
            throw { message: error.message || "Error Creating Revived Question!" };
        }
    },

    // Defer Question
    deferQuestion: async (req, question) => {
        try {
            // Create Deferred Question
            const deferredQuestion = await QuestionDefer.create({
                fkQuestionId: question.id,
                fkSessionId: req.fkSessionId,
                deferredDate: req.deferredDate,
                deferredBy: req.deferredBy,
            });
            // Update Question's isDefered field
            await Questions.update({
                isDefered: true,
                fkQuestionStatus: req.fkQuestionStatus,
                fkSessionId: req.fkSessionId
            },
                {
                    where: { id: question.id }
                })
            return deferredQuestion;
        } catch (error) {
            throw { message: error.message || "Error Creating Deferred Question!" };

        }

    },

    // Send For Translation
    sendForTranslation: async (questionId) => {
        try {
            const updatedData = {
                sentForTranslation: true
            }
            await Questions.update(updatedData, { where: { id: questionId } });
            // Fetch the updated question which is sent for tranlation
            const updatedQuestion = await Questions.findOne({ where: { id: questionId } });
            return updatedQuestion;
        } catch (error) {
            throw { message: error.message || "Error Sending Question For Translation!" };
        }
    },

    // Retrieve Question Histories
    getQuestionHistories: async (questionId) => {
        try {
            // Use Promise.all to run queries in parallel
            const [questionStatusHistory, questionRevival, questionDefer, questionFileHistory] = await Promise.all([

                // Refactored QuestionStatusHistory query
                QuestionStatusHistory.findAll({
                    where: { fkQuestionId: questionId },
                    attributes: ['id', 'questionStatusDate'],
                    include: [
                        {
                            model: Sessions,
                            attributes: ['id', 'sessionName'],
                        },
                        {
                            model: QuestionStatus,
                            attributes: ['id', 'questionStatus'],
                        },
                    ],

                }),

                // Refactored QuestionRevival query
                QuestionRevival.findAll({
                    where: { fkQuestionId: questionId },
                    include: [
                        {
                            model: Sessions,
                            as: 'FromSession',
                            attributes: ['id', 'sessionName'],
                        },

                        {
                            model: Sessions,
                            as: 'ToSession',
                            attributes: ['id', 'sessionName'],
                        },
                        {
                            model: QuestionStatus,
                            attributes: ['id', 'questionStatus'],
                        },
                        {
                            model: QuestionDiary,
                            attributes: ['id', 'questionID', 'questionDiaryNo'],
                        },
                        {
                            model: NoticeOfficeDairy,
                            as: 'noticeOfficeDiary',
                            attributes: ['id', 'noticeOfficeDiaryNo', 'noticeOfficeDiaryDate', 'noticeOfficeDiaryTime'],
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
                    ],
                }),

                // Refactored QuestionDefer query
                QuestionDefer.findAll({
                    where: { fkQuestionId: questionId },

                    include: [
                        {
                            model: Sessions,
                            attributes: ['id', 'sessionName'],
                        },
                    ],
                }),


                // Refactored QuestionFile query
                QuestionFile.findAll({
                    where: { fkQuestionId: questionId },
                    attributes: ['id', 'fileStatusDate', 'fileStatus'],
                }),
            ]);

            // Check for no data found in each query and prepare the response
            const response = {
                questionStatusHistory: questionStatusHistory.length > 0 ? questionStatusHistory : 'No status history data found',
                questionRevival: questionRevival.length > 0 ? questionRevival : 'No revival data found',
                questionDefer: questionDefer.length > 0 ? questionDefer : 'No defer data found',
                questionFileHistory: questionFileHistory.length > 0 ? questionFileHistory : 'No file history data found',
            };

            return response;
        } catch (error) {
            throw new Error(error.message || "Error Fetching Question Histories");
        }
    },

    // Delete Question
    deleteQuestion: async (questionId) => {
        try {
            const updatedData =
            {
                questionActive: "inactive"
            }
            await Questions.update(updatedData, { where: { id: questionId } });
            // Fetch the deleted question after the update
            const deletedQuestion = await Questions.findOne({ where: { id: questionId } });
            return deletedQuestion;
        } catch (error) {
            throw { message: error.message || "Error Deleting Session!" };
        }
    }
}


module.exports = questionsService