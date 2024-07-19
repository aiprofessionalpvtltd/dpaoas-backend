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
const { error } = require("console")
const questionListController = {

  // Generate A New Question List
  generateQuestionList: async (req, res) => {
    try {
      const questionList = await questionListService.generateQuestionList(req.body)
      logger.info("Question List Generated Successfully!")
      return res.status(200).send({
          success: true,
          message: "Question List Generated Successfully!",
          data: questionList,
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
      const questionList = req.body.questionList;
      const questionIds = req.body.questionIds;
      const savedQuestionList = await questionListService.saveQuestionList(questionList,questionIds)
      logger.info("Question List Saved Successfully!")
      return res.status(200).send({
        success: true,
        message: "Question List Saved Successfully!",
        data: savedQuestionList,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Get Question List By QuestionListId
  getSingleQuestionList: async (req, res) => {
    try {
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

  // Get Question List By Session Id
  getQuestionListBySessionId: async (req, res) => {
    try {
      const sessionId = req.params.id;
      const questionList = await QuestionList.findOne({
        where: { fkSessionId: sessionId }
      });
      if (!questionList) {
        throw ({ message: "Question List Not Found!" })
      }
      const singleQuestionList = await questionListService.getQuestionListBySessionId(sessionId);
      logger.info("Single Question List Fetched Successfully!")
      return res.status(200).send({
        success: true,
        message: "Single Question List Fetched Successfully!",
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
      const questionListId = req.params.id;
      const questionList = await QuestionList.findByPk(questionListId);
      if (!questionList) {
        throw ({ message: "Question List Not Found!" })
      }
      const singleQuestionList = await questionListService.deleteQuestionList(questionListId);
      logger.info(`Question List: ${singleQuestionList.id} Deleted Successfully!`)
      return res.status(200).send({
        success: true,
        message: `Question List: ${singleQuestionList.id} Deleted Successfully!`,
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
  generateSupplementaryList: async(req, res)=>
  {
    try {
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
      const questionListId = req.params.id;
      const supplementaryList = req.body.supplementaryList;
      const supplementaryQuestionsIds = req.body.supplementaryQuestionsIds;
      const savedSupplementaryList = await questionListService.saveSupplementaryList(questionListId,supplementaryList, supplementaryQuestionsIds)
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
      const questionListId = req.params.id;
      const questionList = await QuestionList.findByPk(questionListId);
      if (!questionList) {
        throw ({ message: "Question List Not Found!" })
      }
      const supplementaryList = await questionListService.getSupplementaryList(questionListId);
      logger.info(`Supplementary List of Question List: ${questionListId} Fetched Successfully!`)
      return res.status(200).send({
        success: true,
        message: `Supplementary List of Question List: ${questionListId} Fetched Successfully!`,
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

  // Delete Question Supplementary List
  deleteSupplementaryList: async (req, res) => {
    try {
      const supplementaryListId = req.params.id;
      const supplementaryList = await SupplementaryList.findByPk(supplementaryListId);
      if (!supplementaryList) {
        throw ({ message: "Supplementary List Not Found!" })
      }
      const singleSupplementaryList = await questionListService.deleteSupplementaryList(supplementaryListId);
      logger.info(`Suppplementary List:${singleSupplementaryList.id} Deleted Successfully!`)
      return res.status(200).send({
        success: true,
        message: `Suppplementary List:${singleSupplementaryList.id} Deleted Successfully!`,
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