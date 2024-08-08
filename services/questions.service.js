const db = require("../models");
const fs = require('fs-extra');
const Users = db.users;
const Employees = db.employees;
const Questions = db.questions;
const NoticeOfficeDairy = db.noticeOfficeDairies
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
const QuestionList = db.questionLists
const QuestionSuppList = db.supplementaryLists
const QuestionInList = db.questionQuestionLists
const QuestionInSupList = db.questionSupplementaryLists
const Branches = db.branches
const moment = require("moment")
const Op = db.Sequelize.Op;

const questionsService = {
    // Create A New Question
    createQuestion: async (req, url, file) => {
        try {
            const formattedDate = moment(req.noticeOfficeDiaryDate).format('DD-MM-YYYY');
            const fkMemberIdValue = req.fkMemberId ? req.fkMemberId : (req.web_id ? req.web_id : null);
            const question = await Questions.create({
                fkSessionId: req.fkSessionId ? req.fkSessionId : null,
                questionCategory: req.questionCategory ? req.questionCategory : null,
                fkMemberId: fkMemberIdValue,
                memberPosition: req.memberPosition ? req.memberPosition : null,
                englishText: req.englishText ? req.englishText : null,
                urduText: req.urduText ? req.urduText : null,
                fkQuestionStatus: req.fkQuestionStatus ? req.fkQuestionStatus : null,
                initiatedByBranch: req.initiatedByBranch ? req.initiatedByBranch : null,
                sentToBranch: req.sentToBranch ? req.sentToBranch : null,
                device: req.device ? req.device : 'web',
                description: req.description ? req.description : null,
                web_id: req.web_id ? req.web_id : null,
                submittedBy: req.submittedBy ? req.submittedBy : null,
                questionSentStatus: req.questionSentStatus ? req.questionSentStatus : 'inNotice',
            });

            const noticeOfficeDiary = await NoticeOfficeDairy.create({
                noticeOfficeDiaryNo: req.noticeOfficeDiaryNo,
                noticeOfficeDiaryDate: req.noticeOfficeDiaryDate ? moment(req.noticeOfficeDiaryDate).format("YYYY-MM-DD") : null,
                noticeOfficeDiaryTime: req.noticeOfficeDiaryTime,
                businessType: 'Question',
                businessId: question.dataValues.id
            });
            await QuestionStatusHistory.create({
                fkQuestionId: question.id,
                fkSessionId: req.fkSessionId,
                fkQuestionStatus: req.fkQuestionStatus,
                questionStatusDate: db.sequelize.literal('CURRENT_TIMESTAMP')
            });

            await Questions.update(
                { fkNoticeDiary: noticeOfficeDiary.id },
                { where: { id: question.id } }
            );

            return question;

        } catch (error) {
            throw { message: error.message || "Error Creating Question!" };
        }
    },

    // Retrieve All Questions in Notice Branch
    getAllQuestionsInNotice: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const { count, rows } = await Questions.findAndCountAll({
                where: { questionSentStatus: "inNotice" },
                include: [
                    {
                        model: Users,
                        as: 'questionDeletedBy',
                        attributes: ['id'],
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    },
                    {
                        model: Users,
                        as: 'questionSubmittedBy',
                        attributes: ['id'],
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    },
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
                        as: 'questionStatus',
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
                distinct: true,
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

    // Retrieve All Questions in Question Branch
    getAllQuestions: async (currentPage, pageSize, questionSentStatus) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            let whereClause = {};

            // Add questionSentStatus to the where clause only if it's provided
            if (questionSentStatus) {
                whereClause.questionSentStatus = questionSentStatus;
            }
            const { count, rows } = await Questions.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: Users,
                        as: 'questionDeletedBy',
                        attributes: ['id'],
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    },
                    {
                        model: Users,
                        as: 'questionSubmittedBy',
                        attributes: ['id'],
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    },
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
                        as: 'questionStatus',
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
                distinct: true,
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


    getQuestionsByStatus: async (statuses) => {
        try {
            const fetchQuestions = async (status) => {
                return await Questions.findAll({
                    where: {
                        questionSentStatus: status
                    },
                    include: [
                        {
                            model: Users,
                            as: 'questionDeletedBy',
                            attributes: ['id'],
                            include: [{
                                model: Employees,
                                as: 'employee',
                                attributes: ['id', 'firstName', 'lastName']
                            }]
                        },
                        {
                            model: Users,
                            as: 'questionSubmittedBy',
                            attributes: ['id'],
                            include: [{
                                model: Employees,
                                as: 'employee',
                                attributes: ['id', 'firstName', 'lastName']
                            }]
                        },
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
                            as: 'questionStatus',
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
                    order: [
                        ['createdAt', 'DESC']
                    ]
                });
            };

            const inQuestionQuestions = await fetchQuestions('inQuestion');
            const toQuestionQuestions = await fetchQuestions('toQuestion');

            const counts = {
                inQuestion: inQuestionQuestions.length,
                toQuestion: toQuestionQuestions.length
            };

            const result = {
                counts,
                inQuestionQuestions,
                toQuestionQuestions
            };

            return result;

        } catch (error) {
            throw { message: error.message || "Error Fetching Questions by Status!" };
        }
    },


    // Find Single Question
    getSingleQuestion: async (questionId) => {
        try {

            const question = await Questions.findOne({
                where: { id: questionId },
                include: [
                    {
                        model: Users,
                        as: 'questionSubmittedBy',
                        attributes: ['id'],
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    },
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
                        as: 'questionStatus',
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
                    },
                    {
                        model: Users,
                        as: 'questionDeletedBy',
                        attributes: ['id'],
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    },
                    {
                        model: Users,
                        as: 'questionSubmittedBy',
                        attributes: ['id'],
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    }
                ],
            });

            if (question.questionImage && question.questionImage.length) {
                question.questionImage = question.questionImage.map(imageString => JSON.parse(imageString));
            }
            else {
                question.questionImage = []
            }
            return question;
        } catch (error) {
            throw new Error(error.message || "Error Fetching Question");

        }
    },

    // Find all Question by web_id
    findAllQuestionsByWebId: async (webId) => {
        try {

            const question = await Questions.findAll({
                where: { web_id: webId },
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
                        as: 'questionStatus',
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
                order: [['createdAt', 'DESC']]
            });

            if (question.questionImage && question.questionImage.length) {
                question.questionImage = question.questionImage.map(imageString => JSON.parse(imageString));
            }
            else {
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
            const questionStatuses = await QuestionStatus.findAll();
            return questionStatuses;
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
                        model: Users,
                        as: 'questionDeletedBy',
                        attributes: ['id'],
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    },
                    {
                        model: Users,
                        as: 'questionSubmittedBy',
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
                where: {},
                offset,
                limit,
                order: [
                    ['id', 'ASC']
                ]
            };

            //   let whereClause = {
            //     questionSentStatus: searchCriteria.questionSentStatus
            //   }
            // Build the query options based on search criteria
            for (const key in searchCriteria) {
                if (key === 'fromSessionNo') {
                    queryOptions.where['$session.id$'] = { [Op.gte]: searchCriteria[key] };
                }
                if (key === 'toSessionNo') {
                    queryOptions.where['$session.id$'] = { [Op.lte]: searchCriteria[key] };
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
                if (key === 'questionSentStatus') {
                    queryOptions.where['$questionSentStatus$'] = searchCriteria[key];
                }
                if (key === 'questionSentDate') {
                    queryOptions.where['$questionSentDate$'] = { [Op.eq]: searchCriteria[key] };
                }
                if (key === 'memberPosition') {
                    queryOptions.where['$memberPosition$'] = { [Op.eq]: searchCriteria[key] };
                }
            }

            // queryOptions.where = whereClause
            // console.log("Query Options",queryOptions)
            // Fetch the count and rows of questions based on the search criteria
            const { count, rows } = await Questions.findAndCountAll({ ...queryOptions });
            const totalPages = Math.ceil(count / pageSize)
            return { count, totalPages, questions: rows };
        } catch (error) {
            console.log(error)
            throw new Error(error.message || "Error Searching Question");
        }
    },

    // Update Question
    updateQuestion: async (req, question, questionId) => {
        try {
            var updatedQuesDiary = {};
            var updatedQuestionDiaryId = 0;

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
                    updatedQuesDiary = await QuestionDiary.update(updatedQuestionDiary, { where: { id: question.fkQuestionDiaryId } })
                } else {
                    updatedQuestionDiaryId = await QuestionDiary.create({
                        questionID: question.id,
                        questionDiaryNo: req.questionDiaryNo,
                    });
                }
            } else {
                throw ({ message: "Question Not Found!" })
            }

            const updatedNoticeOffice = {
                noticeOfficeDiaryNo: req.noticeOfficeDiaryNo,
                noticeOfficeDiaryDate: moment(req.noticeOfficeDiaryDate).format("YYYY-MM-DD"),
                noticeOfficeDiaryTime: req.noticeOfficeDiaryTime,
                businessType: "Question"
            }
            // console.log(updatedNoticeOffice); return false;

            await NoticeOfficeDairy.update(updatedNoticeOffice, { where: { businessId: questionId } });

            const questionFileData = {
                fkQuestionId: questionId,
                questionId: questionId,
                fkMemberId: req.fkMemberId,
                questionCategory: req.questionCategory,
                memberPosition: req.memberPosition,
                englishText: req.englishText,
                urduText: req.urduText,
                fkSessionId: req.fkSessionId,
                fkQuestionStatus: req.fkQuestionStatus,
                questionSentStatus: req.questionSentStatus,
                initiatedByBranch: req.initiatedByBranch,
                sentToBranch: req.sentToBranch,
                device: req.device,
                web_id: req.web_id,
                description: req.description,
                submittedBy: req.submittedBy,
                questionActive: req.questionActive
            }


            const updatedQuestion = await Questions.update(questionFileData, { where: { id: questionId } });
            if (updatedQuestion) {
                return updatedQuestion
            }
            return null;
        } catch (error) {
            throw ({ message: error.message || "Error Updating Question!" })
        }
    },

    // Change Question Status
    changeQuestionStatus: async (req) => {
        try {
            const status = await QuestionStatus.findOne({
                where: {
                    id: req.questionStatus
                }
            });

            //  console.log("Status",status)

            if (status && status.questionStatus === "Deferred") {
                // Proceed with creating a QuestionDefer record if the status is "Deferred"
                await QuestionDefer.create({
                    fkQuestionId: req.isChecked.map((id) => id),
                    fkSessionId: req.fkSessionId ? req.fkSessionId : null,
                    deferredDate: req.statusDate ? req.statusDate : null,
                    deferredBy: req.deferredBy ? req.deferredBy : null,
                });

                await Questions.update(
                    { fkQuestionStatus: status.id },
                    { where: { id: req.isChecked.map((id) => id) } }
                );

            }
            else {
                await Questions.update(
                    { fkQuestionStatus: status.id },
                    { where: { id: req.isChecked.map((id) => id) } }
                );

            }

            return true
        } catch (error) {
            console.log(error)
            throw new Error({ message: error.message })
        }
    },

    sendToQuestion: async (req, questionId) => {
        try {
            const updatedData = {
                questionSentStatus: "toQuestion",
                questionSentDate: req.questionSentDate
            }
            await Questions.update(updatedData, { where: { id: questionId } });
            // Fetch the updated question which is sent to question branch
            const updatedQuestion = await Questions.findOne({ where: { id: questionId } });
            return updatedQuestion;
        } catch (error) {
            throw { message: error.message || "Error Sending Question To Question Branch!" };
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
                noticeOfficeDiaryDate: moment(req.noticeOfficeDiaryDate).format("YYYY-MM-DD"),
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
                fkSessionId: req.fkSessionId ? req.fkSessionId : null,
                deferredDate: req.deferredDate,
                deferredBy: req.deferredBy,
            });
            // Update Question's isDefered field
            await Questions.update({
                isDefered: true,
                fkQuestionStatus: req.fkQuestionStatus,
                fkSessionId: req.fkSessionId ? req.fkSessionId : null
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
                            as: 'deferredSession',
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
    deleteQuestion: async (req, questionId) => {
        try {
            const updatedData =
            {
                questionActive: "inactive",
                deletedBy: req.deletedBy,
                description: req.description
            }
            await Questions.update(updatedData, { where: { id: questionId } });
            // Fetch the deleted question after the update
            const deletedQuestion = await Questions.findOne({ where: { id: questionId } });
            return deletedQuestion;
        } catch (error) {
            throw { message: error.message || "Error Deleting Session!" };
        }
    },

    // Get Group Diary Of Questions
    getQuestionGroupDiary: async (session, questionCategory, group) => {
        try {
            const { count, rows } = await Questions.findAndCountAll({
                where: {
                    fkSessionId: session ? session : null,
                    questionCategory: questionCategory ? questionCategory : null,
                    fkGroupId: group ? group : null
                },
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
                        as: 'questionStatus',
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
                attributes: [
                    'id',
                    'fkSessionId',
                    'questionCategory',
                    'fkQuestionStatus',
                    'fkNoticeDiary',
                    'fkMemberId',
                    'questionImage',
                    'englishText',
                    'urduText',
                    'questionActive',
                    'sentForTranslation',
                    'isTranslated',
                    'isDefered',
                    'isRevived',
                    'createdAt'
                ],
                order: [['id', 'DESC']]

            });

            const sessionDetails = await Sessions.findOne({
                where: { id: session ? session : null },
                attributes: ['id', 'sessionName']
            });


            const groupDetails = await Groups.findOne({
                where: { id: group ? group : null },
                attributes: ['id', 'groupNameStarred', 'groupNameUnstarred']
            })



            return {
                sessionName: sessionDetails ? sessionDetails.sessionName : null,
                questionCategory: questionCategory ? questionCategory : null,
                groupNameStarred: groupDetails ? groupDetails.groupNameStarred : null,
                groupNameUnstarred: groupDetails ? groupDetails.groupNameUnstarred : null,
                totalQuestions: rows.length,
                questions: rows,
            };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All Questions");
        }
    },

    // Get Under Process Question
    getUnderProcessQuestions: async (session, questionCategory, group) => {
        try {

            const { count, rows } = await Questions.findAndCountAll({
                where: {
                    fkSessionId: session ? session : null,
                    questionCategory: questionCategory ? questionCategory : null,
                    fkGroupId: group ? group : null
                },
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
                        as: 'questionStatus',
                        where: { questionStatus: "Under Process" },
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
                attributes: [
                    'id',
                    'fkSessionId',
                    'questionCategory',
                    'fkQuestionStatus',
                    'fkNoticeDiary',
                    'fkMemberId',
                    'questionImage',
                    'englishText',
                    'urduText',
                    'questionActive',
                    'sentForTranslation',
                    'isTranslated',
                    'isDefered',
                    'isRevived',
                    'createdAt'
                ],
                order: [['id', 'DESC']]

            });

            const sessionDetails = await Sessions.findOne({
                where: { id: session ? session : null },
                attributes: ['id', 'sessionName']
            });


            const groupDetails = await Groups.findOne({
                where: { id: group ? group : null },
                attributes: ['id', 'groupNameStarred', 'groupNameUnstarred']
            })



            return {
                sessionName: sessionDetails ? sessionDetails.sessionName : null,
                questionCategory: questionCategory ? questionCategory : null,
                groupNameStarred: groupDetails ? groupDetails.groupNameStarred : null,
                groupNameUnstarred: groupDetails ? groupDetails.groupNameUnstarred : null,
                questions: rows
            };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All Questions");
        }
    },

    // Get Questions Summary
    getQuestionsSummary: async (fromSession, toSession) => {
        try {

            const whereClause = {
                fkSessionId: {
                    [db.Sequelize.Op.between]: [fromSession, toSession]
                }
            };

            // Fetch the data
            const questionStatusCounts = await Questions.findAndCountAll({
                where: whereClause,
                attributes: [
                    // Ensure you are pulling an attribute that can be grouped
                    [db.Sequelize.literal('"questionStatus"."questionStatus"'), 'status'],
                    [db.Sequelize.fn('COUNT', 'id'), 'statusCount']
                ],
                include: [{
                    model: QuestionStatus,
                    as: 'questionStatus',
                    attributes: []
                }],
                group: ['questionStatus.id']
            });

            // console.log(questionStatusCounts.rows)

            const questionStatusRows = questionStatusCounts.rows;
            //console.log(questionStatusRows)
            let totalCount = 0;
            for (const status of questionStatusRows) {
                totalCount += parseInt(status.dataValues.statusCount, 10);
            }
            const modifiedResponse = {
                questionStatusCounts: questionStatusRows.concat({ status: "Total Questions", statusCount: totalCount }),
            };

            return { ...modifiedResponse };

        } catch (error) {
            throw new Error(error.message || "Error Fetching All Questions");
        }
    },

    // Get Deferred Questions
    getDeferredQuestions: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const { count, rows } = await QuestionDefer.findAndCountAll({
                include: [
                    {
                        model: Sessions,
                        as: 'deferredSession',
                        attributes: ['id', 'sessionName']
                    },
                    {
                        model: Users,
                        as: 'deferredByUser',
                        attributes: ['id'],
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    },
                    {
                        model: Questions,
                        as: 'deferQuestion',
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
                                as: 'questionStatus',
                                where: { questionStatus: 'Deferred' },
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
                                model: QuestionInList,
                                as: 'questionQuestionList',
                                include: [{
                                    model: QuestionList,
                                    as: 'questionList'
                                }]
                            },
                            {
                                model: QuestionInSupList,
                                as: 'questionQuestionSuppList',
                                include: [{
                                    model: QuestionSuppList,
                                    as: 'questionSuppList'
                                }]
                            },

                        ]
                    }
                ],
                attributes: ['id', 'fkSessionId', 'deferredDate', 'deferredBy'],
                offset,
                limit,
                distinct: true,
                order: [['id', 'DESC']]
            });

            const totalPages = Math.ceil(count / pageSize)
            return {
                count: rows.length,
                totalPages,
                questions: rows
            };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All Questions");
        }
    },

    // Get Deleted Questions
    getDeletedQuestions: async (searchCriteria, currentPage, pageSize) => {
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
                        model: Users,
                        as: 'questionDeletedBy',
                        attributes: ['id'],
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    },
                    {
                        model: Users,
                        as: 'questionSubmittedBy',
                        attributes: ['id'],
                        include: [{
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName']
                        }]
                    },

                ],
                distinct: true,
                where: {
                    questionActive: "inactive"
                },
                offset,
                limit,
                order: [['id', 'DESC']]
            };

            // Dynamically add search criteria to query options
            for (const key in searchCriteria) {
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

            // Fetch questions based on the combined query options
            const { count, rows } = await Questions.findAndCountAll(queryOptions);
            const totalPages = Math.ceil(count / pageSize)
            return {
                count,
                totalPages,
                questions: rows
            };
        } catch (error) {
            throw new Error(error.message || "Error Fetching Deleted Questions");
        }
    },

    // Remove Questions From List
    removeQuestionsFromList: async (questionId) => {
        try {

            await QuestionInList.destroy({
                where: { fkQuestionId: questionId }
            })

            await QuestionInSupList.destroy({
                where: { fkQuestionId: questionId }
            })

        } catch (error) {
            console.log(error)
        }
    }
}


module.exports = questionsService