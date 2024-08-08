const questionListService = require("../services/questionList.service")
const db = require("../models")

const QuestionList = db.questionLists
const SupplementaryList = db.supplementaryLists
const logger = require('../common/winston');
const {
  validationErrorResponse,
  notFoundResponse,
  unAuthorizedResponse,
} = require('../common/validation-responses')
const { error } = require("console");
const questionQuestionListModel = require("../models/questionQuestionList.model");
const path = require('path');
const fs = require('fs');
const questionListController = {

  // Generate A New Question List
  generateQuestionList: async (req, res) => {
    try {
      logger.info(`questionListController: generateQuestionList body ${JSON.stringify(req.body)}`);
      const questionList = await questionListService.generateQuestionList(req.body);
      const pdfData = await questionListService.printQuestionList(questionList);
      const buffer = Buffer.from(pdfData);
      const fileName = `output_${Date.now()}.pdf`;
      const pdfDirectory = path.join(__dirname, '..', 'pdfDownload');
      if (!fs.existsSync(pdfDirectory)) {
        fs.mkdirSync(pdfDirectory, { recursive: true });
      }
      const filePathh = path.join(pdfDirectory, fileName);
      fs.writeFileSync(filePathh, buffer);
      // Provide a link
      const fileLink = `/assets/${fileName}`;
      logger.info("Question List Generated Successfully!")
      return res.status(200).send({
        success: true,
        message: "Question List Generated Successfully!",
        data: { questionList, fileLink },
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Save Question List
  saveQuestionList: async (req, res) => {
    try {
      logger.info(`questionListController: saveQuestionList body ${JSON.stringify(req.body)}`);
      const questionList = req.body;
      console.log("data----->>>", req.body)
      const questionIds = req.body.questionIds;
      console.log("quesion ids----->>>", req.body.questionIds)
      const savedQuestionList = await questionListService.saveQuestionList(questionList, questionIds);
      const questionLists = await questionListService.generateQuestionList(req.body);
      const pdfData = await questionListService.printQuestionList(questionLists)
      const buffer = Buffer.from(pdfData);
      const fileName = `output_${Date.now()}.pdf`;
      const pdfDirectory = path.join(__dirname, '..', 'pdfDownload');
      if (!fs.existsSync(pdfDirectory)) {
        fs.mkdirSync(pdfDirectory, { recursive: true });
      }
      const filePathh = path.join(pdfDirectory, fileName);
      fs.writeFileSync(filePathh, buffer);
      // Provide a link
      const fileLink = `/assets/${fileName}`;
      logger.info("Question List Saved Successfully!")
      const savedQuestionListPlain = savedQuestionList.get({ plain: true });
      savedQuestionListPlain.fileLink = fileLink;

      return res.status(200).send({
        success: true,
        message: "Question List Saved Successfully!",
        data: [savedQuestionListPlain],
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Edit
  editQuestionList: async (req, res) => {
    try {
        logger.info(`questionListController: editQuestionList body ${JSON.stringify(req.body)}`);
        const questionList = req.body;
        const questionIds = req.body.questionDetails;
        const updatedQuestionList = await questionListService.editQuestionList(questionList, questionIds);

        return res.status(200).send({
            success: true,
            message: "Question List Updated Successfully!",
            data: updatedQuestionList,
        });
    } catch (error) {
        logger.error(error.message);
        return res.status(400).send({
            success: false,
            message: error.message
        });
    }
},

  // Get Question List By QuestionListId
  getSingleQuestionList: async (req, res) => {
    try {
      logger.info(`questionListController: getSingleQuestionList id ${JSON.stringify(req.params.id)}`);
      const questionListId = req.params.id;
      const questionList = await QuestionList.findByPk(questionListId);
      if (!questionList) {
        throw ({ message: "Question List Not Found!" })
      }
      const singleQuestionList = await questionListService.getSingleQuestionList(questionListId);
      logger.info("Single Question List Fetched Successfully!")
      return res.status(200).send({
        success: true,
        message: "Single Question List Fetched Successfully!",
        questionList:questionList,
        data: singleQuestionList.questions,
        memberQuestionCount: singleQuestionList.memberQuestionCount
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }

  },

  // Get Question List By Session Id
  getQuestionListBySessionId: async (req, res) => {
    try {
      logger.info(`questionListController: getQuestionListBySessionId id ${JSON.stringify(req.params.id)}`);
      const sessionId = req.params.id;
      const questionList = await QuestionList.findOne({
        where: { fkSessionId: sessionId }
      });
      if (!questionList) {
        throw ({ message: "Question List Not Found!" })
      }
      const singleQuestionList = await questionListService.getQuestionListBySessionId(sessionId);
      logger.info("Question List By Session Fetched Successfully!")
      return res.status(200).send({
        success: true,
        message: "Question List By Session Fetched Successfully!",
        data: singleQuestionList,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Update Question List By Adding Question
  updateQuestionList: async (req, res) => {
    try {
      logger.info(`questionListController: updateQuestionList id ${JSON.stringify(req.params.id)} & body ${JSON.stringify(req.body)}`);
      const questionListId = req.params.id;
      const questionList = await QuestionList.findByPk(questionListId);
      if (!questionList) {
        throw ({ message: "Question List Not Found!" })
      }
      const singleQuestionList = await questionListService.updateQuestionList(questionListId, req.body);
      logger.info("Question List Updated Successfully!")
      return res.status(200).send({
        success: true,
        message: "Question List Updated Successfully!",
        data: singleQuestionList,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Delete Question List
  deleteQuestionList: async (req, res) => {
    try {
      logger.info(`questionListController: deleteQuestionList id ${JSON.stringify(req.params.id)}`);
      const questionListId = req.params.id;
      const questionList = await QuestionList.findByPk(questionListId);
      if (!questionList) {
        throw ({ message: "Question List Not Found!" })
      }
      const singleQuestionList = await questionListService.deleteQuestionList(questionListId);
      logger.info(`Question List Deleted Successfully!`)
      return res.status(200).send({
        success: true,
        message: `Question List Deleted Successfully!`,
        data: singleQuestionList,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Generate Supplementary List
  generateSupplementaryList: async (req, res) => {
    try {
      logger.info(`questionListController: generateSupplementaryList id ${JSON.stringify(req.params.id)} & body ${JSON.stringify(req.body)}`);
      const questionListId = req.params.id;
      const questionList = await QuestionList.findByPk(questionListId);

      if (!questionList) {
        throw ({ message: "Question List Not Found!" })
      }
      const supplementaryList = await questionListService.generateSupplementaryList(questionListId, req.body)
      logger.info("Supplementary List Generated Successfully!")
      return res.status(200).send({
        success: true,
        message: "Supplementary List Generated Successfully!",
        data: supplementaryList,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Save Supplementary List
  saveSupplementaryList: async (req, res) => {
    try {
      logger.info(`questionListController: saveSupplementaryList id ${JSON.stringify(req.params.id)} & body ${JSON.stringify(req.body)}`);
      const questionListId = req.params.id;
      const supplementaryList = req.body.supplementaryList;
      const supplementaryQuestionsIds = req.body.supplementaryList.supplementaryQuestionsIds;
      const savedSupplementaryList = await questionListService.saveSupplementaryList(questionListId, supplementaryList, supplementaryQuestionsIds)
      logger.info("Supplementary List Created Successfully!")
      return res.status(200).send({
        success: true,
        message: "Supplementary List Created Successfully!",
        data: savedSupplementaryList,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }

  },

  // Get Supplementary Lists By Question List Id
  getSupplementaryList: async (req, res) => {
    try {
      logger.info(`questionListController: getSupplementaryList id ${JSON.stringify(req.params.id)}`);
      const questionListId = req.params.id;
      const questionList = await QuestionList.findByPk(questionListId);
      if (!questionList) {
        throw ({ message: "Question List Not Found!" })
      }
      const supplementaryList = await questionListService.getSupplementaryList(questionListId);
      logger.info(`Supplementary List Fetched Successfully!`)
      return res.status(200).send({
        success: true,
        message: `Supplementary List Fetched Successfully!`,
        data: supplementaryList,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Get Single Supplementary Lists By SupplementaryListId
  getSingleSupplementaryList: async (req, res) => {
    try {
      logger.info(`questionListController: getSingleSupplementaryList id ${JSON.stringify(req.params.id)}`);
      const supplementaryListId = req.params.id;
      const supplementaryList = await SupplementaryList.findByPk(supplementaryListId);
      if (!supplementaryList) {
        throw ({ message: "Supplementary List Not Found!" })
      }
      const singleSupplementaryList = await questionListService.getSingleSupplementaryList(supplementaryListId);
      logger.info("Single Supplementary List Fetched Successfully!")
      return res.status(200).send({
        success: true,
        message: "Single Supplementary List Fetched Successfully!",
        data: singleSupplementaryList,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Update Supplementary List By Adding Question
  updateSupplementaryList: async (req, res) => {
    try {
      logger.info(`questionListController: updateSupplementaryList id ${JSON.stringify(req.params.id)} & body ${JSON.stringify(req.body)}`);
      const supplementaryListId = req.params.id;
      const supplementaryList = await SupplementaryList.findByPk(supplementaryListId);
      if (!supplementaryList) {
        throw ({ message: "Supplementary List Not Found!" })
      }
      const updatedSupplemntaryList = await questionListService.updateSupplementaryList(supplementaryListId, req.body);
      logger.info("Supplementary List Updated Successfully!")
      return res.status(200).send({
        success: true,
        message: "Supplementary List Updated Successfully!",
        data: updatedSupplemntaryList,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Delete Question Supplementary List
  deleteSupplementaryList: async (req, res) => {
    try {
      logger.info(`questionListController: deleteSupplementaryList id ${JSON.stringify(req.params.id)}`);
      const supplementaryListId = req.params.id;
      const supplementaryList = await SupplementaryList.findByPk(supplementaryListId);
      if (!supplementaryList) {
        throw ({ message: "Supplementary List Not Found!" })
      }
      const singleSupplementaryList = await questionListService.deleteSupplementaryList(supplementaryListId);
      logger.info(`Suppplementary List Deleted Successfully!`)
      return res.status(200).send({
        success: true,
        message: `Suppplementary List Deleted Successfully!`,
        data: singleSupplementaryList,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

}

module.exports = questionListController