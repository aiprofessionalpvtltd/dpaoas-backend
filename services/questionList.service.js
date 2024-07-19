const db = require("../models");
const Questions = db.questions;
const NoticeOfficeDairy = db.noticeOfficeDiary
const Sessions = db.sessions;
const Members = db.members;
const QuestionStatus = db.questionStatus;
const QuestionDiary = db.questionDiary
const Divisions = db.divisions;
const Groups = db.groups;
const QuestionList = db.questionLists
const QuestionListJoin = db.questionQuestionLists
const SupplementaryList = db.supplementaryLists
const SupplementaryListJoin = db.questionSupplementaryLists

const questionListService = {

    // Generate A New Question List
    generateQuestionList: async (req) => {
        try {
            const questionList = {
                fkSessionId: req.fkSessionId,
                questionCategory: req.questionCategory,
                fkGroupId: req.fkGroupId,
                startListNo: req.startListNo,
                houseLayDate: req.houseLayDate,
                listName: req.listName,
                defferedQuestions: req.defferedQuestions,
                fkUserId: req.fkUserId
            };
            //Assuming houseLayDate is in the format 'DD-MM-YYYY' as you mentioned '14-1-2024'
            const [day, month, year] = questionList.houseLayDate.split('-').map(num => parseInt(num));
            const houseLayDateObj = new Date(year, month - 1, day); // Month is 0-indexed
            const startDate = new Date(houseLayDateObj);
            startDate.setDate(houseLayDateObj.getDate() - 13);
            // Fetching All Questions in accordance with all conditions
            const questions = await db.sequelize.query(`
                    WITH NumberedQuestions AS (
                            SELECT
                            questions.*,
                            NoticeOfficeDiary."noticeOfficeDiaryNo",
                            NoticeOfficeDiary."noticeOfficeDiaryDate",
                            NoticeOfficeDiary."noticeOfficeDiaryTime",
                            QuestionStatus."questionStatus",
                            sessions."sessionName",
                            groups."groupNameStarred",
                            groups."groupNameUnstarred",
                            members."memberName",
                            QuestionDiary."questionID",
                            QuestionDiary."questionDiaryNo",
                            ROW_NUMBER() OVER (
                                PARTITION BY questions."fkMemberId" 
                                ORDER BY NoticeOfficeDiary."noticeOfficeDiaryDate" ASC,
                                        NoticeOfficeDiary."noticeOfficeDiaryTime" ASC
                            ) AS rn
                        FROM 
                            questions
                        LEFT JOIN "noticeOfficeDairies" AS NoticeOfficeDiary ON NoticeOfficeDiary.id = questions."fkNoticeDiary"
                        LEFT JOIN "questionStatuses" AS QuestionStatus ON QuestionStatus.id = questions."fkQuestionStatus"
                        LEFT JOIN "groups" ON "groups".id = questions."fkGroupId"
                        LEFT JOIN "sessions" ON "sessions".id = questions."fkSessionId"
                        LEFT JOIN "members" ON "members".id = questions."fkMemberId"
                        LEFT JOIN "questionDiaries" AS QuestionDiary ON QuestionDiary.id = questions."fkQuestionDiaryId"
                        LEFT JOIN "questionQuestionLists" ON "questionQuestionLists"."fkQuestionId" = questions.id
                        WHERE 
                            NoticeOfficeDiary."noticeOfficeDiaryDate" >= :startDate
                            AND QuestionStatus."questionStatus" = ANY(ARRAY[:statusList])
                            AND sessions.id = :sessionId
                            AND groups.id = :groupId    
                            AND (questions."questionCategory" = :questionCategory) 
                            AND "questionQuestionLists"."id" IS NULL  -- Exclude questions already in questionQuestionLists
                    )
                    SELECT *
                    FROM NumberedQuestions
                    WHERE 
                        rn <= CASE 
                            WHEN :questionCategory = 'Starred' THEN 3
                            WHEN :questionCategory = 'Un-Starred' THEN 5
                            WHEN :questionCategory = 'Short Notice' THEN 3    
                        END;
                    `, {
                type: db.sequelize.QueryTypes.SELECT,
                replacements: {
                    startDate: startDate.toISOString().split('T')[0],
                    statusList: req.defferedQuestions ? ['Admitted', 'Deferred'] : ['Admitted'],
                    sessionId: req.fkSessionId,
                    groupId: req.fkGroupId,
                    questionCategory: req.questionCategory
                }
            });
            return { questionList, questions };
        } catch (error) {
            throw new Error({ message: error.message || "Error Generating Question List" })
        }
    },

    // Save Question List
    saveQuestionList: async (questionList, questionIds) => {
        try {
            const savedQuestionList = await QuestionList.create({
                fkSessionId: questionList.fkSessionId,
                questionCategory: questionList.questionCategory,
                fkGroupId: questionList.fkGroupId,
                startListNo: questionList.startListNo,
                houseLayDate: questionList.houseLayDate,
                listName: questionList.listName,
                defferedQuestions: questionList.defferedQuestions,
                fkUserId: questionList.fkUserId
            })
            //Check if there are multiple questions
            if (Array.isArray(questionIds) && questionIds.length > 0) {
                // If there are multiple questions, create an entry for each question
                for (const questionId of questionIds) {
                    await QuestionListJoin.create({
                        fkQuestionListId: savedQuestionList.id,
                        fkQuestionId: questionId.id
                    });
                }
            } else if (questionIds) {
                // If there is a single question, create a single entry
                await QuestionListJoin.create({
                    fkQuestionListId: savedQuestionList.id,
                    fkQuestionId: questionIds.id
                });
            }
            return savedQuestionList;
        } catch (error) {
            throw new Error({ message: error.message || "Error Saving Question List" })
        }
    },

    // Get Question List By Session Id
    getQuestionListBySessionId: async (sessionId) => {
        try {
            const questionList = await QuestionList.findAll({
                where: { fkSessionId: sessionId },
                include: [
                    {
                        model: Sessions,
                        attributes: ['sessionName']
                    },
                    {
                        model: Groups,
                        attributes: ['groupNameStarred', 'groupNameUnstarred']
                    }
                ],
                attributes: ['id', 'questionCategory', 'startListNo', 'questionListStatus', 'listName', 'houseLayDate', 'defferedQuestions']
            })
            return questionList
        } catch (error) {
            throw ({ message: error.message || "Error Retrieving Question List" })
        }
    },

    // Get Question List By QuestionListId
    getSingleQuestionList: async (questionListId) => {
        try {

            const question = await QuestionListJoin.findAll({
                where: { fkQuestionListId: questionListId },
                include: [
                    {
                        model: QuestionList,
                        attributes: ['questionCategory', 'fkSessionId', 'fkGroupId', 'startListNo', 'listName', 'houseLayDate', 'defferedQuestions', 'fkUserId', 'questionListStatus']
                    }
                ]
            });
            const questions = question.map(async (question) => {
                const filteredQuestions = await Questions.findAll({
                    where: { id: question.fkQuestionId },
                    include: [
                        {
                            model: Sessions,
                            attributes: ['sessionName'],
                        },
                        {
                            model: QuestionStatus,
                            attributes: ['questionStatus'],
                        },
                        {
                            model: Members,
                            attributes: ['memberName'],
                        },
                        {
                            model: QuestionDiary,
                            attributes: ['questionID', 'questionDiaryNo'],
                        },
                        {
                            model: NoticeOfficeDairy,
                            as: 'noticeOfficeDiary',
                            attributes: ['noticeOfficeDiaryNo', 'noticeOfficeDiaryDate', 'noticeOfficeDiaryTime'],
                        },
                        {
                            model: Divisions,
                            as: 'divisions',
                            attributes: ['divisionName']
                        },
                        {
                            model: Groups,
                            as: 'groups',
                            attributes: ['groupNameStarred', 'groupNameUnstarred']
                        },
                    ],
                });
                return filteredQuestions;
            });
            const allQuestionsData = await Promise.all(questions);
            // Flatten the array of arrays to get a single-level array
            const flattenedQuestions = allQuestionsData.flat();
            return flattenedQuestions;
        } catch (error) {
            throw new Error(error.message || "Error Fetching Question");
        }
    },

    // Delete Question List
    deleteQuestionList: async (questionListId) => {
        try {
            const updatedData =
            {
                questionListStatus: "inactive"
            }
            await QuestionList.update(updatedData, { where: { id: questionListId } });
            // Fetch the updated questionList after the update
            const deletedList = await QuestionList.findOne({ where: { id: questionListId } });
            return deletedList;
        } catch (error) {
            throw { message: error.message || "Error Deleting Question List!" };
        }
    },

    // Generate Supplementary List
    generateSupplementaryList: async (questionListId, req) => {
        try {
            const supplementaryList = {
                fkQuestionListId: questionListId,
                houseLayDate: req.houseLayDate,
                listName: req.listName,
                fkUserId: req.fkUserId
            };
            //Assuming houseLayDate is in the format 'DD-MM-YYYY' as you mentioned '14-1-2024'
            const [day, month, year] = supplementaryList.houseLayDate.split('-').map(num => parseInt(num));
            const houseLayDateObj = new Date(year, month - 1, day); // Month is 0-indexed
            const startDate = new Date(houseLayDateObj);
            startDate.setDate(houseLayDateObj.getDate() - 13);
            const supplementaryQuestions = await db.sequelize.query(`
                WITH AllQuestions AS (
                    SELECT
                        questions.*,
                        NoticeOfficeDiary."noticeOfficeDiaryNo",
                        NoticeOfficeDiary."noticeOfficeDiaryDate",
                        NoticeOfficeDiary."noticeOfficeDiaryTime",
                        members."memberName",
                        QuestionDiary."questionID",
                        QuestionDiary."questionDiaryNo",
                        sessions."sessionName"
                    FROM 
                        questions
                    LEFT JOIN "noticeOfficeDairies" AS NoticeOfficeDiary ON NoticeOfficeDiary.id = questions."fkNoticeDiary"
                    LEFT JOIN "members" ON "members".id = questions."fkMemberId"
                    LEFT JOIN "sessions" on "sessions".id = questions."fkSessionId"
                    LEFT JOIN "questionDiaries" AS QuestionDiary ON QuestionDiary.id = questions."fkQuestionDiaryId"
                    LEFT JOIN "questionSupplementaryLists" ON "questionSupplementaryLists"."fkQuestionId" = questions.id
                    WHERE 
                        NoticeOfficeDiary."noticeOfficeDiaryDate" >= :startDate
                        AND questions.id NOT IN (SELECT "fkQuestionId" FROM "questionQuestionLists" WHERE "fkQuestionListId" = :fkQuestionListId)
                        AND "questionSupplementaryLists"."id" IS NULL  -- Exclude questions already in questionSupplementaryLists
                ),
                ExistingQuestionCounts AS (
                    SELECT 
                        "fkMemberId", 
                        COUNT(*) AS existingCount
                    FROM "questions"
                    WHERE "id" IN (SELECT "fkQuestionId" FROM "questionQuestionLists" WHERE "fkQuestionListId" = :fkQuestionListId)
                    GROUP BY "fkMemberId"
                ),
                PotentialQuestions AS (
                    SELECT 
                        A.*, 
                        COALESCE(E.existingCount, 0) AS existingCount,
                        ROW_NUMBER() OVER (
                            PARTITION BY A."fkMemberId", A."questionCategory"
                            ORDER BY A."noticeOfficeDiaryDate" ASC, A."noticeOfficeDiaryTime" ASC
                        ) AS rn
                    FROM AllQuestions A
                    LEFT JOIN ExistingQuestionCounts E ON A."fkMemberId" = E."fkMemberId"
                ) 
                SELECT *
                FROM PotentialQuestions
                WHERE 
                    ("questionCategory" = 'Starred' AND rn + existingCount <= 3)
                    OR ("questionCategory" = 'Short Notice' AND rn + existingCount <= 3 )
                    OR ("questionCategory" = 'Un-Starred' AND rn + existingCount <= 5)
    `, {
                type: db.sequelize.QueryTypes.SELECT,
                replacements: {
                    startDate: startDate.toISOString().split('T')[0],
                    fkQuestionListId: questionListId
                }
            });
            return { supplementaryList, supplementaryQuestions }
        } catch (error) {
            throw new Error({ message: error.message || "Error Creating Supplementary List!" })
        }
    },

    // Save Supplementary List
    saveSupplementaryList: async (questionListId,supplementaryList, supplementaryQuestionsIds) => {
        try {
            const savedSupplementaryList = await SupplementaryList.create({
                fkQuestionListId: questionListId,
                houseLayDate: supplementaryList.houseLayDate,
                listName: supplementaryList.listName,
                fkUserId: supplementaryList.fkUserId
            })
            // Check if there are multiple supplementary questions
            if (Array.isArray(supplementaryQuestionsIds) && supplementaryQuestionsIds.length > 0) {
                // If there are multiple questions, create an entry for each question
                for (const supplementaryQuestionsId of supplementaryQuestionsIds) {
                    await SupplementaryListJoin.create({
                        fkSupplementaryListId: savedSupplementaryList.id,
                        fkQuestionId: supplementaryQuestionsId.id
                    });
                }
            } else if (supplementaryQuestionsIds) {
                // If there is a single supplementary question, create a single entry
                await SupplementaryListJoin.create({
                    fkSupplementaryListId: savedSupplementaryList.id,
                    fkQuestionId: supplementaryQuestionsIds.id
                });
            }
            return savedSupplementaryList
        } catch (error) {
            throw new Error({ message: error.message || "Error Creating Supplementary List!" })
        }
    },

    // Get Supplementary List By QuestionListId
    getSupplementaryList: async (questionListId) => {
        try {

            const supplementaryList = await SupplementaryList.findAll({
                where: { fkQuestionListId: questionListId },
                attributes: ['id', 'listName', 'houseLayDate']
            })
            return supplementaryList
        } catch (error) {
            throw new Error({ message: error.message || "Error Getting Supplementary List" })
        }
    },

    // Get Single Supplementary List By SupplementaryListId
    getSingleSupplementaryList: async (supplementaryListId) => {
        try {
            const question = await SupplementaryListJoin.findAll({
                where: { fkSupplementaryListId: supplementaryListId },
                include: [
                    {
                        model: SupplementaryList,
                        attributes: ['listName', 'houseLayDate', 'fkUserId', 'supplementaryListStatus']
                    }
                ]
            });
            const questions = question.map(async (question) => {
                const filteredQuestions = await Questions.findAll({
                    where: { id: question.fkQuestionId },
                    include: [
                        {
                            model: Sessions,
                            attributes: ['sessionName'],
                        },
                        {
                            model: QuestionStatus,
                            attributes: ['questionStatus'],
                        },
                        {
                            model: Members,
                            attributes: ['memberName'],
                        },
                        {
                            model: QuestionDiary,
                            attributes: ['questionID', 'questionDiaryNo'],
                        },
                        {
                            model: NoticeOfficeDairy,
                            as: 'noticeOfficeDiary',
                            attributes: ['noticeOfficeDiaryNo', 'noticeOfficeDiaryDate', 'noticeOfficeDiaryTime'],
                        },
                        {
                            model: Divisions,
                            as: 'divisions',
                            attributes: ['divisionName']
                        },
                        {
                            model: Groups,
                            as: 'groups',
                            attributes: ['groupNameStarred', 'groupNameUnstarred']
                        },
                    ],
                });
                return filteredQuestions;
            });
            const allQuestionsData = await Promise.all(questions);
            // Flatten the array of arrays to get a single-level array
            const flattenedQuestions = allQuestionsData.flat();
            return flattenedQuestions;
        } catch (error) {
            throw new Error(error.message || "Error Fetching Question");
        }
    },

    // Delete Supplementary List
    deleteSupplementaryList: async (supplementaryListId) => {
        try {
            const updatedData =
            {
                supplementaryListStatus: "inactive"
            }
            await SupplementaryList.update(updatedData, { where: { id: supplementaryListId } });
            // Fetch the updated supplementaryList after the update
            const deletedList = await SupplementaryList.findOne({ where: { id: supplementaryListId } });
            return deletedList;
        } catch (error) {
            throw { message: error.message || "Error Deleting Supplementary List!" };
        }
    },
}

module.exports = questionListService