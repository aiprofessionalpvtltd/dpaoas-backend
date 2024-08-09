const db = require("../models");
const Questions = db.questions;
const NoticeOfficeDairy = db.noticeOfficeDiary;
const Sessions = db.sessions;
const Members = db.members;
const QuestionStatus = db.questionStatus;
const QuestionDiary = db.questionDiary;
const Divisions = db.divisions;
const Groups = db.groups;
const QuestionList = db.questionLists;
const QuestionListJoin = db.questionQuestionLists;
const SupplementaryList = db.supplementaryLists;
const SupplementaryListJoin = db.questionSupplementaryLists;
const moment = require("moment");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const { parseString } = require("xml2js");

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
        fkUserId: req.fkUserId,
      };

      //  console.log(questionList)
      //Assuming houseLayDate is in the format 'DD-MM-YYYY' as you mentioned '14-1-2024'
      // const [day, month, year] = questionList.houseLayDate.split('-').map(num => parseInt(num));
      // const houseLayDateObj = new Date(year, month - 1, day); // Month is 0-indexed
      // const startDate = new Date(houseLayDateObj);
      // startDate.setDate(houseLayDateObj.getDate() - 13);
      // console.log("House Lay Date", questionList.houseLayDate)
      const [year, month, day] = questionList.houseLayDate
        .split("-")
        .map((num) => parseInt(num));

      const houseLayDateObj = new Date(year, month - 1, day); // Month is 0-indexed
      //  console.log("House Lay Object", houseLayDateObj)
      // const startDate = new Date(houseLayDateObj);
      //const startDate1 = moment(houseLayDateObj).format("YYYY-MM-DD")
      //console.log("Start D", startDate1)
      // console.log("Start Date", startDate)
      //console.log("Testing", startDate1.setDate(houseLayDateObj.getDate() - 13))
      // startDate.setDate(houseLayDateObj.getDate() - 13);
      //    const momentDate = moment(houseLayDateObj);
      // console.log("Moment Date", momentDate)

      // Subtract 13 days from the date
      // momentDate.subtract(13, 'days');

      // Format the date as you desire
      // const formattedDate = momentDate.format("YYYY-MM-DD");
      // const formattedDate = momentDate.format("YYYY-MM-DD HH:mm:ssZ")
      // console.log("Formatted Date", formattedDate)
      // console.log("start date format", startDate.toISOString().split('T')[0])
      // Assuming 'startDate' is your Date object
      const momentDate = moment(questionList.houseLayDate, "YYYY-MM-DD");

      // Subtract 13 days from the date
      momentDate.subtract(13, "days");

      // Format the date in the required format
      const startDate = momentDate.format("YYYY-MM-DD 00:00:00+00");

      // console.log("Start Date for Query", startDate);

      // Fetching All Questions in accordance with all conditions
      const questions = await db.sequelize.query(
        `
                    WITH NumberedQuestions AS (
                            SELECT
                            questions.*,
                            NoticeOfficeDiary."noticeOfficeDiaryNo",
                            NoticeOfficeDiary."noticeOfficeDiaryDate",
                            NoticeOfficeDiary."noticeOfficeDiaryTime",
                            QuestionStatus."questionStatus",
                            sessions."sessionName",
                            divisions."divisionName",
                            divisions."fkMinistryId", 
                            ministries."ministryName", 
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
                        LEFT JOIN "divisions" ON "divisions".id = questions."fkDivisionId"
                        LEFT JOIN "ministries" ON "ministries".id = divisions."fkMinistryId"
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
                    `,
        {
          type: db.sequelize.QueryTypes.SELECT,
          replacements: {
            startDate: startDate,
            //startDate: formattedDate1,
            // startDate: formattedDate.toISOString().split('T')[0],
            statusList: req.defferedQuestions
              ? ["Admitted", "Deferred"]
              : ["Admitted"],
            sessionId: req.fkSessionId,
            groupId: req.fkGroupId,
            questionCategory: req.questionCategory,
          },
        }
      );

      // Check if any questions are already assigned to a list
      // const assignedQuestions = await db.sequelize.query(`
      //     SELECT qq."fkQuestionId"
      //     FROM "questionQuestionLists" qq
      //     WHERE qq."fkQuestionId" IN (:questionIds)
      // `, {
      //     type: db.sequelize.QueryTypes.SELECT,
      //     replacements: {
      //         questionIds: questions.map(q => q.id)
      //     }
      // });

      // if (assignedQuestions.length > 0) {
      //     throw new Error("Some questions are already assigned to another list.");
      // }

      const sessionDetails = await Sessions.findOne({
        where: { id: req.fkSessionId },
        attributes: ["id", "sessionName"],
      });

      const groupDetails = await Groups.findOne({
        where: { id: req.fkGroupId },
        attributes: ["id", "groupNameStarred", "groupNameUnstarred"],
      });

      // Create an array to hold questionList and questions
      const responseObject = {
        sessionDetails: sessionDetails,
        groupDetails: groupDetails,
        questionList: [questionList], // Wrap questionList in an array
        questions: questions, // Use the questions array as is
      };

      // Return the response object
      return responseObject;
      // return { questionList, questions };
    } catch (error) {
      console.log(error);
      throw new Error({
        message: error.message || "Error Generating Question List",
      });
    }
  },

  getTextHeight: async (text, options) => {
    const { font, fontSize, maxWidth, wrap } = options;
    const splitText = font.layout(text, {
      fontSize,
      maxWidth,
      wordBreak: wrap ? "break-word" : "normal",
    });
    const lineHeight = font.sizeAt(fontSize);
    const height = splitText.lines.length * lineHeight;
    return height;
  },

  estimateTextHeight: async (text, maxWidth, options) => {
    // console.log(options)
    //console.log(text.length)
    const lines = Math.ceil(text.length * (options.size / maxWidth)); // Simplistic estimation
    //console.log(lines * (options.size + 5))
    return lines * (options.size + 5); // Line height + spacing
  },

  // Print Question List
  printQuestionList: async (questionList) => {
    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

      let page = pdfDoc.addPage();
      let yCoordinate = page.getHeight() - 50;
      const textOptions = { font, color: rgb(0, 0, 0), size: 16 };
      const textOptions1 = { font, color: rgb(0, 0, 0), size: 10 };
      const textOptions2 = { font, color: rgb(0, 0, 0), size: 12 };
      const boldTextOptions = { ...textOptions, font: fontBold };
      const boldTextOptions1 = { ...textOptions2, font: fontBold };

      // Initial Session Information
      const verticalGap = 10;
      page.drawText("SENATE OF PAKISTAN", {
        x: 220,
        y: yCoordinate + verticalGap - 40,
        ...boldTextOptions,
      });
      const lineY = yCoordinate + verticalGap - 44;

      const lineStartX = 210;
      const lineEndX = 400;
      const lineWidth = 1;
      const lineColor = rgb(0, 0, 0);

      page.drawLine({
        start: { x: lineStartX, y: lineY },
        end: { x: lineEndX, y: lineY },
        thickness: lineWidth,
        color: lineColor,
      });

      if (questionList.questionList[0].defferedQuestions === true) {
        page.drawText(
          `DEFERRED ${questionList.questionList[0].questionCategory} QUESTIONS LIST ${questionList.questionList[0].startListNo} (${questionList.groupDetails.groupNameStarred}) FOR ${questionList.sessionDetails.sessionName} SESSION`,
          { x: 90, y: yCoordinate + verticalGap - 80, ...textOptions1 }
        );
      } else {
        page.drawText(
          `ADMITTED/DEFERRED ${questionList.questionList[0].questionCategory} QUESTIONS LIST ${questionList.questionList[0].startListNo} (${questionList.groupDetails.groupNameStarred}) FOR ${questionList.sessionDetails.sessionName} SESSION`,
          { x: 90, y: yCoordinate + verticalGap - 80, ...textOptions1 }
        );
      }

      if (questionList.questionList[0].defferedQuestions === true) {
        page.drawText(
          `DEFERRED QUESTIONS-                                      ${questionList.questions.length}`,
          { x: 200, y: yCoordinate + verticalGap - 100, ...textOptions1 }
        );
        const lineY = yCoordinate + verticalGap - 104;

        const lineStartX = 190;
        const lineEndX = 430;
        const lineWidth = 1;
        const lineColor = rgb(0, 0, 0);

        page.drawLine({
          start: { x: lineStartX, y: lineY },
          end: { x: lineEndX, y: lineY },
          thickness: lineWidth,
          color: lineColor,
        });
        page.drawText(
          `TOTAL QUESTIONS-                                         ${questionList.questions.length}`,
          { x: 200, y: yCoordinate + verticalGap - 120, ...textOptions1 }
        );
        const lineY1 = yCoordinate + verticalGap - 124;

        const lineStartX1 = 190;
        const lineEndX1 = 430;
        const lineWidth1 = 1;
        const lineColor1 = rgb(0, 0, 0);

        page.drawLine({
          start: { x: lineStartX1, y: lineY1 },
          end: { x: lineEndX1, y: lineY1 },
          thickness: lineWidth1,
          color: lineColor1,
        });
      } else {
        page.drawText(
          `ADMITTED/DEFERRED QUESTIONS-                                     ${questionList.questions.length}`,
          { x: 200, y: yCoordinate + verticalGap - 100, ...textOptions1 }
        );
        const lineY = yCoordinate + verticalGap - 104;

        const lineStartX = 190;
        const lineEndX = 430;
        const lineWidth = 1;
        const lineColor = rgb(0, 0, 0);

        page.drawLine({
          start: { x: lineStartX, y: lineY },
          end: { x: lineEndX, y: lineY },
          thickness: lineWidth,
          color: lineColor,
        });
        page.drawText(
          `TOTAL QUESTIONS:                                                 ${questionList.questions.length}`,
          { x: 200, y: yCoordinate + verticalGap - 120, ...textOptions1 }
        );
        const lineY1 = yCoordinate + verticalGap - 124;

        const lineStartX1 = 210;
        const lineEndX1 = 400;
        const lineWidth1 = 1;
        const lineColor1 = rgb(0, 0, 0);

        page.drawLine({
          start: { x: lineStartX1, y: lineY1 },
          end: { x: lineEndX1, y: lineY1 },
          thickness: lineWidth1,
          color: lineColor1,
        });
      }

      const ministries = questionList.questions.map(
        (question) => question.ministryName
      );
      let ministriesString = "";
      let currentLineMinistries = 0;

      ministries.forEach((ministry, index) => {
        if (currentLineMinistries === 5) {
          ministriesString += "\n";
          currentLineMinistries = 0;
        }

        ministriesString += ministry;
        currentLineMinistries++;

        if (currentLineMinistries < 5 && index < ministries.length - 1) {
          ministriesString += ", ";
        }
      });

      page.drawText(`Ministries (${ministriesString})`, {
        x: 80,
        y: yCoordinate + verticalGap - 140,
        ...textOptions1,
      });

      let currentY = yCoordinate - 160; // Initial Y coordinate
      //let currentY = initialYCoordinate;
      let questionsPerPage = 0;
      let maxWidth = 400;
      let minY = 50;

      // Retrieve the first page of the document
      const firstPage = pdfDoc.getPages()[0];

      // Get the width and height of the page
      const width = firstPage.getWidth();
      const height = firstPage.getHeight();

      console.log(`Width: ${width}, Height: ${height}`);

      questionList.questions.forEach(async (question, index) => {
        const {
          questionStatus,
          memberName,
          noticeOfficeDiaryDate,
          noticeOfficeDiaryTime,
          id,
          englishText,
        } = question;

        let textToDraw = englishText; // Store the full text of the question
        let segmentStart = 0; // Start of the text segment that will fit on the current page
        let estimatedSpaceForText = 0; // Space needed to draw the text

        // Estimate the space needed for the current question
        //const textHeight = await questionListService.estimateTextHeight(`${englishText}`, { maxWidth, wrap: true, ...boldTextOptions1 });
        const neededSpace =
          (await questionListService.estimateTextHeight(
            englishText,
            maxWidth,
            textOptions
          )) + 10; // Additional 60 for spacing and headers

        console.log("neededSpace after this ----->>", neededSpace);
        console.log("currentY after this ----->>", currentY);
        console.log("currentY after this ----->>", minY);

        // Check if there's enough remaining space on the current page for the question
        // if( currentY < 5 ){
        if ((currentY - neededSpace < minY, index)) {
          console.log("check 1", index);
          // If not, add a new page
          page = pdfDoc.addPage();
          currentY = page.getHeight() - 50; // Reset Y coordinate to top
          console.log("currentY check 11111----->>", currentY);
        }
        // }
        // Draw the text for the current question
        page.drawText(
          `*(${questionStatus}) QUESTION NO: SENATOR ${memberName}`,
          { x: 80, y: currentY, ...boldTextOptions1 }
        );
        page.drawText(
          `(Notice Received On ${noticeOfficeDiaryDate} at ${noticeOfficeDiaryTime}) QID ${id}`,
          { x: 80, y: currentY - 20, ...boldTextOptions1 }
        );
        page.drawText(`${englishText}`, {
          x: 80,
          y: currentY - 40,
          maxWidth,
          wrap: true,
          ...boldTextOptions1,
        });

        // Draw the line under the text
        const lineY = currentY - 4;
        const lineStartX = 75;
        const lineEndX = 400;
        const lineWidth = 1;
        const lineColor = rgb(0, 0, 0);

        page.drawLine({
          start: { x: lineStartX, y: lineY },
          end: { x: lineEndX, y: lineY },
          thickness: lineWidth,
          color: lineColor,
        });

        // Move to the next position after the current question
        currentY -= neededSpace;

        //console.log("currentY---->>", currentY)

        // // Add a 5% gap between questions if there is enough space on the current page
        // const gapPercentage = 0.05;
        // const gap = page.getHeight() * gapPercentage;

        // console.log("gap----", gap)

        // if (currentY > gap) {
        //     currentY -= gap;
        //     console.log("currentY if---->>", currentY)
        // }
        // } else {
        //     // If there's not enough space for the gap, add a new page
        //     page = pdfDoc.addPage();
        //     currentY = page.getHeight() - 50; // Reset Y coordinate to top
        //     console.log("currentY else---->>", currentY)
        // }
      });

      const pdfBytes = await pdfDoc.save();
      return pdfBytes;
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
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
        fkUserId: questionList.fkUserId,
      });

      console.log("quesionss----", questionIds);
      //Check if there are multiple questions
      if (Array.isArray(questionIds) && questionIds.length > 0) {
        // If there are multiple questions, create an entry for each question
        for (const questionId of questionIds) {
          await QuestionListJoin.create({
            fkQuestionListId: savedQuestionList.id,
            fkQuestionId: questionId.id,
          });
        }
      } else if (questionIds) {
        // If there is a single question, create a single entry
        await QuestionListJoin.create({
          fkQuestionListId: savedQuestionList.id,
          fkQuestionId: questionIds.id,
        });
      }
      return savedQuestionList;
    } catch (error) {
      throw new Error({
        message: error.message || "Error Saving Question List",
      });
    }
  },

  // Edit
  editQuestionList: async (questionList, questionIds) => {
    try {
      const existingQuestionList = await QuestionList.findByPk(questionList.id);
      if (!existingQuestionList) {
        throw new Error("Question List not found");
      }

      await existingQuestionList.update({
        fkSessionId: questionList.fkSessionId,
        questionCategory: questionList.questionCategory,
        fkGroupId: questionList.fkGroupId,
        startListNo: questionList.startListNo,
        houseLayDate: questionList.houseLayDate,
        listName: questionList.listName,
        defferedQuestions: questionList.defferedQuestions,
        fkUserId: questionList.fkUserId,
      });

      // Remove specified question IDs from the question list
      await db.questionQuestionLists.destroy({
        where: {
          fkQuestionListId: questionList.id,
          fkQuestionId: questionList.questionDetails,
        },
      });

      return existingQuestionList;
    } catch (error) {
      throw new Error({
        message: error.message || "Error Updating Question List",
      });
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
            attributes: ["id", "sessionName"],
          },
          {
            model: Groups,
            attributes: ["id", "groupNameStarred", "groupNameUnstarred"],
          },
        ],
        attributes: [
          "id",
          "questionCategory",
          "startListNo",
          "questionListStatus",
          "listName",
          "houseLayDate",
          "defferedQuestions",
          "questionListStatus",
        ],
      });

      return { questionList: questionList };
    } catch (error) {
      throw { message: error.message || "Error Retrieving Question List" };
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
            as: "questionList",
            attributes: [
              "id",
              "questionCategory",
              "fkSessionId",
              "fkGroupId",
              "startListNo",
              "listName",
              "houseLayDate",
              "defferedQuestions",
              "fkUserId",
              "questionListStatus",
            ],
          },
        ],
      });
      const questions = question.map(async (question) => {
        const filteredQuestions = await Questions.findAll({
          where: { id: question.fkQuestionId },
          include: [
            {
              model: Sessions,
              attributes: ["id", "sessionName"],
            },
            {
              model: QuestionStatus,
              as: "questionStatus",
              attributes: ["id", "questionStatus"],
            },
            {
              model: Members,
              attributes: ["id", "memberName"],
            },
            {
              model: QuestionDiary,
              attributes: ["id", "questionID", "questionDiaryNo"],
            },
            {
              model: NoticeOfficeDairy,
              as: "noticeOfficeDiary",
              attributes: [
                "id",
                "noticeOfficeDiaryNo",
                "noticeOfficeDiaryDate",
                "noticeOfficeDiaryTime",
              ],
            },
            {
              model: Divisions,
              as: "divisions",
              attributes: ["id", "divisionName"],
            },
            {
              model: Groups,
              as: "groups",
              attributes: ["id", "groupNameStarred", "groupNameUnstarred"],
            },
          ],
        });
        return filteredQuestions;
      });
      const allQuestionsData = await Promise.all(questions);
      // Flatten the array of arrays to get a single-level array
      const flattenedQuestions = allQuestionsData.flat();


      // Aggregate question counts by member
      const memberQuestionCountMap = {};
      flattenedQuestions.forEach((question) => {
        const memberName = question.dataValues.member
          ? question.dataValues.member.memberName
          : null;
        if (memberName) {
          if (!memberQuestionCountMap[memberName]) {
            memberQuestionCountMap[memberName] = 0;
          }
          memberQuestionCountMap[memberName]++;
        }
      });

      // Transform the memberQuestionCountMap into the desired format
      const memberQuestionCount = Object.keys(memberQuestionCountMap).map(name => ({
        name: name,
        count: memberQuestionCountMap[name]
      }));


      return { questions: flattenedQuestions, memberQuestionCount };
    } catch (error) {
      throw new Error(error.message || "Error Fetching Question");
    }
  },

  // Update Question List By Adding Question
  updateQuestionList: async (questionListId, req) => {
    try {
      const updatedQL = await QuestionListJoin.create({
        fkQuestionId: req.fkQuestionId,
        fkQuestionListId: questionListId,
      });

      return updatedQL;
    } catch (error) {
      throw new Error(error.message || "Error Updating!");
    }
  },

  // Delete Question List
  deleteQuestionList: async (questionListId) => {
    try {
      const updatedData = {
        questionListStatus: "inactive",
      };
      await QuestionList.update(updatedData, { where: { id: questionListId } });
      // Fetch the updated questionList after the update
      const deletedList = await QuestionList.findOne({
        where: { id: questionListId },
      });
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
        fkUserId: req.fkUserId,
      };
      //Assuming houseLayDate is in the format 'DD-MM-YYYY' as you mentioned '14-1-2024'
      // const [day, month, year] = supplementaryList.houseLayDate.split('-').map(num => parseInt(num));
      // const houseLayDateObj = new Date(year, month - 1, day); // Month is 0-indexed
      // const startDate = new Date(houseLayDateObj);
      // startDate.setDate(houseLayDateObj.getDate() - 13);
      const momentDate = moment(supplementaryList.houseLayDate, "YYYY-MM-DD");

      // Subtract 13 days from the date
      momentDate.subtract(13, "days");

      // Format the date in the required format
      const startDate = momentDate.format("YYYY-MM-DD 00:00:00+00");
      // console.log("Start Date for Query", startDate);
      const supplementaryQuestions = await db.sequelize.query(
        `
                WITH AllQuestions AS (
                    SELECT
                        questions.*,
                        NoticeOfficeDiary."noticeOfficeDiaryNo",
                        NoticeOfficeDiary."noticeOfficeDiaryDate",
                        NoticeOfficeDiary."noticeOfficeDiaryTime",
                        members."memberName",
                        divisions."divisionName",
                        divisions."fkMinistryId", 
                        ministries."ministryName", 
                        QuestionDiary."questionID",
                        QuestionDiary."questionDiaryNo",
                        sessions."sessionName"
                    FROM 
                        questions
                    LEFT JOIN "noticeOfficeDairies" AS NoticeOfficeDiary ON NoticeOfficeDiary.id = questions."fkNoticeDiary"
                    LEFT JOIN "members" ON "members".id = questions."fkMemberId"
                    LEFT JOIN "divisions" ON "divisions".id = questions."fkDivisionId"
                    LEFT JOIN "ministries" ON "ministries".id = divisions."fkMinistryId"
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
    `,
        {
          type: db.sequelize.QueryTypes.SELECT,
          replacements: {
            startDate: startDate,
            fkQuestionListId: questionListId,
          },
        }
      );

      const responseObject = {
        supplementaryList: [supplementaryList], // Wrap questionList in an array
        supplementaryQuestions: supplementaryQuestions, // Use the questions array as is
      };
      return responseObject;
      // return { supplementaryList, supplementaryQuestions }
    } catch (error) {
      throw new Error({
        message: error.message || "Error Creating Supplementary List!",
      });
    }
  },

  // Save Supplementary List
  saveSupplementaryList: async (
    questionListId,
    supplementaryList,
    supplementaryQuestionsIds
  ) => {
    try {
      const savedSupplementaryList = await SupplementaryList.create({
        fkQuestionListId: questionListId,
        houseLayDate: supplementaryList.houseLayDate,
        listName: supplementaryList.listName,
        fkUserId: supplementaryList.fkUserId,
      });
      // Check if there are multiple supplementary questions
      if (
        Array.isArray(supplementaryQuestionsIds) &&
        supplementaryQuestionsIds.length > 0
      ) {
        // If there are multiple questions, create an entry for each question
        for (const supplementaryQuestionsId of supplementaryQuestionsIds) {
          await SupplementaryListJoin.create({
            fkSupplementaryListId: savedSupplementaryList.id,
            fkQuestionId: supplementaryQuestionsId.id,
          });
        }
      } else if (supplementaryQuestionsIds) {
        // If there is a single supplementary question, create a single entry
        await SupplementaryListJoin.create({
          fkSupplementaryListId: savedSupplementaryList.id,
          fkQuestionId: supplementaryQuestionsIds.id,
        });
      }

      const supplementaryQuestions =
        await questionListService.getSingleQuestionList(questionListId);

      // const responseData = {
      //     savedSupplementaryList,
      //     supplementaryQuestions
      // }

      const responseObject = {
        savedSupplementaryList: [savedSupplementaryList],
        supplementaryQuestions: supplementaryQuestions,
      };

      return responseObject;
    } catch (error) {
      throw new Error({
        message: error.message || "Error Creating Supplementary List!",
      });
    }
  },

  // Get Supplementary List By QuestionListId
  getSupplementaryList: async (questionListId) => {
    try {
      const supplementaryList = await SupplementaryList.findAll({
        where: { fkQuestionListId: questionListId },
        attributes: [
          "id",
          "listName",
          "houseLayDate",
          "supplementaryListStatus",
        ],
      });
      return { supplementaryList: supplementaryList };
    } catch (error) {
      throw new Error({
        message: error.message || "Error Getting Supplementary List",
      });
    }
  },

  // Get Single Supplementary List By SupplementaryListId
  getSingleSupplementaryList: async (supplementaryListId) => {
    try {
      const question = await SupplementaryListJoin.findAll({
        where: { id: supplementaryListId },
        include: [
          {
            model: SupplementaryList,
            as: "questionSuppList",
            attributes: [
              "id",
              "listName",
              "houseLayDate",
              "fkUserId",
              "supplementaryListStatus",
            ],
          },
        ],
      });
      //   console.log(question); return false;

      const questions = question.map(async (question) => {
        const filteredQuestions = await Questions.findAll({
          where: { id: question.fkQuestionId },
          include: [
            {
              model: Sessions,
              attributes: ["id", "sessionName"],
            },
            {
              model: QuestionStatus,
              as: "questionStatus",
              attributes: ["id", "questionStatus"],
            },
            {
              model: Members,
              attributes: ["id", "memberName"],
            },
            {
              model: QuestionDiary,
              attributes: ["id", "questionID", "questionDiaryNo"],
            },
            {
              model: NoticeOfficeDairy,
              as: "noticeOfficeDiary",
              attributes: [
                "id",
                "noticeOfficeDiaryNo",
                "noticeOfficeDiaryDate",
                "noticeOfficeDiaryTime",
              ],
            },
            {
              model: Divisions,
              as: "divisions",
              attributes: ["id", "divisionName"],
            },
            {
              model: Groups,
              as: "groups",
              attributes: ["id", "groupNameStarred", "groupNameUnstarred"],
            },
          ],
        });
        return filteredQuestions;
      });
      const allQuestionsData = await Promise.all(questions);
      // Flatten the array of arrays to get a single-level array
      const flattenedQuestions = allQuestionsData.flat();

      // const memberQuestionCount = {};
      // flattenedQuestions.forEach((question) => {
      //   const memberName = question.dataValues.member
      //     ? question.dataValues.member.memberName
      //     : null;
      //   if (memberName) {
      //     if (!memberQuestionCount[memberName]) {
      //       memberQuestionCount[memberName] = 0;
      //     }
      //     memberQuestionCount[memberName]++;
      //   }
      // });

      // Aggregate question counts by member
      const memberQuestionCountMap = {};
      flattenedQuestions.forEach((question) => {
        const memberName = question.dataValues.member
          ? question.dataValues.member.memberName
          : null;
        if (memberName) {
          if (!memberQuestionCountMap[memberName]) {
            memberQuestionCountMap[memberName] = 0;
          }
          memberQuestionCountMap[memberName]++;
        }
      });

      // Transform the memberQuestionCountMap into the desired format
      const memberQuestionCount = Object.keys(memberQuestionCountMap).map(name => ({
        name: name,
        count: memberQuestionCountMap[name]
      }));

      return { questions: flattenedQuestions, memberQuestionCount };

    } catch (error) {
      throw new Error(error.message || "Error Fetching Question");
    }
  },

  // Update Supplementary List By Adding Question
  updateSupplementaryList: async (supplementaryListId, req) => {
    try {
      const updatedSL = await SupplementaryListJoin.create({
        fkQuestionId: req.fkQuestionId,
        fkSupplementaryListId: supplementaryListId,
      });

      return updatedSL;
    } catch (error) {
      throw new Error(error.message || "Error Updating!");
    }
  },

  // Delete Supplementary List
  deleteSupplementaryList: async (supplementaryListId) => {
    try {
      const updatedData = {
        supplementaryListStatus: "inactive",
      };
      await SupplementaryList.update(updatedData, {
        where: { id: supplementaryListId },
      });
      // Fetch the updated supplementaryList after the update
      const deletedList = await SupplementaryList.findOne({
        where: { id: supplementaryListId },
      });
      return deletedList;
    } catch (error) {
      throw { message: error.message || "Error Deleting Supplementary List!" };
    }
  },
};

module.exports = questionListService;
